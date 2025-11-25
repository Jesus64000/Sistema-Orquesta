// backend/routes/personalizacion.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import requirePermiso from '../middleware/requirePermiso.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const dataDir = path.join(backendRoot, 'data');
const filePath = path.join(dataDir, 'personalizacion.json');

function ensureDataDir() {
  try { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { }
}

router.get('/', async (_req, res) => {
  try {
    // try DB first
    try {
      const [rows] = await pool.query("SELECT nombre, tema FROM personalizacion ORDER BY actualizado_en DESC");
      // return array of { name, theme } ensuring theme is an object
      if (rows && rows.length) {
        const list = rows.map(r => {
          let theme = r.tema;
          if (typeof theme === 'string') {
            try { theme = JSON.parse(theme); } catch { /* keep as-is */ }
          }
          return { name: r.nombre, theme };
        });
        return res.json({ saved: true, themes: list });
      }
    } catch (e) {
      // db may not be available yet, fallback to file
    }
    ensureDataDir();
    if (!fs.existsSync(filePath)) return res.status(200).json({ saved: false });
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    // file format previously was single theme; if legacy, wrap
    if (!Array.isArray(parsed)) return res.json({ saved: true, themes: [{ name: 'guardado', theme: parsed }] });
    return res.json({ saved: true, themes: parsed });
  } catch (err) {
    console.warn('personalizacion GET error', err);
    return res.status(500).json({ error: 'failed' });
  }
});

router.post('/', requirePermiso('personalizacion','update'), async (req, res) => {
  try {
    const body = req.body || {};
    const name = (body.name || '').toString().trim();
    const payload = body.theme || body;
    if (!name) return res.status(400).json({ error: 'missing_name' });
    if (!payload || !payload.claro || !payload.oscuro) return res.status(400).json({ error: 'invalid_payload' });
    // try DB: enforce max 3 saved themes (excluding default)
    try {
      const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM personalizacion');
      const count = existing && existing[0] ? existing[0].cnt : 0;
      // check if updating existing
      const [found] = await pool.query('SELECT id FROM personalizacion WHERE nombre = ? LIMIT 1', [name]);
      const exists = found && found[0];
      if (!exists && count >= 3) return res.status(400).json({ error: 'max_themes_reached' });
      const temaJson = JSON.stringify(payload);
      await pool.query("INSERT INTO personalizacion (nombre, tema, creado_por) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tema = VALUES(tema), actualizado_en = CURRENT_TIMESTAMP, creado_por = VALUES(creado_por)", [name, temaJson, req.user?.id_usuario || null]);
      return res.status(200).json({ ok: true });
    } catch (e) {
      // fallback to file-based storage (legacy). keep as array of { name, theme }
      ensureDataDir();
      let arr = [];
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        try { arr = JSON.parse(raw || '[]'); if (!Array.isArray(arr)) arr = [{ name: 'guardado', theme: arr }]; } catch (er) { arr = []; }
      }
      const existsIdx = arr.findIndex(x => x.name === name);
      if (existsIdx === -1 && arr.length >= 3) return res.status(400).json({ error: 'max_themes_reached' });
      if (existsIdx === -1) arr.unshift({ name, theme: payload }); else arr[existsIdx].theme = payload;
      fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
      return res.status(200).json({ ok: true, fallback: true });
    }
  } catch (err) {
    console.warn('personalizacion POST error', err);
    return res.status(500).json({ error: 'failed' });
  }
});

router.delete('/:name', requirePermiso('personalizacion','delete'), async (req, res) => {
  try {
    const name = (req.params.name || '').toString();
    if (!name) return res.status(400).json({ error: 'missing_name' });
    try { await pool.query('DELETE FROM personalizacion WHERE nombre = ?', [name]); } catch (e) { }
    // also remove from file fallback
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        let arr = [];
        try { arr = JSON.parse(raw || '[]'); } catch (er) { arr = []; }
        arr = arr.filter(x => x.name !== name);
        fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
      }
    } catch (e) {}
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.warn('personalizacion DELETE error', err);
    return res.status(500).json({ error: 'failed' });
  }
});

export default router;
