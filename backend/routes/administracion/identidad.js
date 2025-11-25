// backend/routes/administracion/identidad.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import requirePermiso from '../../middleware/requirePermiso.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');
const uploadsRoot = path.join(backendRoot, 'uploads');
const identidadDir = path.join(uploadsRoot, 'identidad');
const dataDir = path.join(backendRoot, 'data');
const dataFile = path.join(dataDir, 'identidad.json');

function ensureDirs() {
  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
  if (!fs.existsSync(identidadDir)) fs.mkdirSync(identidadDir, { recursive: true });
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  // Migración desde rutas antiguas (backend/backend/*) si existieran
  try {
    const oldRoot = path.join(backendRoot, 'backend');
    const oldDataFile = path.join(oldRoot, 'data', 'identidad.json');
    const oldUploads = path.join(oldRoot, 'uploads', 'identidad');
    if (fs.existsSync(oldDataFile) && !fs.existsSync(dataFile)) {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.copyFileSync(oldDataFile, dataFile);
    }
    if (fs.existsSync(oldUploads)) {
      const items = fs.readdirSync(oldUploads);
      for (const it of items) {
        const src = path.join(oldUploads, it);
        const dst = path.join(identidadDir, it);
        if (!fs.existsSync(dst)) {
          try { fs.copyFileSync(src, dst); } catch {}
        }
      }
    }
  } catch {}
}

function normalizeState(rawObj) {
  const out = {
    appLogo: rawObj.appLogo || null,
    exportLogo: rawObj.exportLogo || null,
    // compat: si venía solo 'logo', usarlo para ambos
    sello: rawObj.sello || null,
    firma: rawObj.firma || null,
    includeSeal: typeof rawObj.includeSeal === 'boolean' ? rawObj.includeSeal : true,
    includeSignature: typeof rawObj.includeSignature === 'boolean' ? rawObj.includeSignature : true,
  };
  if ((!out.appLogo || !out.exportLogo) && rawObj.logo) {
    out.appLogo = out.appLogo || rawObj.logo;
    out.exportLogo = out.exportLogo || rawObj.logo;
  }
  return out;
}

function loadState() {
  try {
    if (!fs.existsSync(dataFile)) return normalizeState({});
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    const norm = normalizeState(parsed || {});
    // Persistir normalización si cambió estructura
    try { saveState(norm); } catch {}
    return norm;
  } catch {
    return normalizeState({});
  }
}

function saveState(state) {
  const norm = normalizeState(state || {});
  fs.writeFileSync(dataFile, JSON.stringify(norm, null, 2), 'utf8');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDirs();
    cb(null, identidadDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  // Sin límite de tamaño a petición: confiar en la optimización posterior con sharp
  fileFilter: (_req, file, cb) => {
    // Aceptar imágenes comunes
    const ok = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.originalname);
    if (!ok) return cb(new Error('Formato no soportado. Usa PNG/JPG/SVG/WEBP/GIF.'));
    cb(null, true);
  }
});

function toUrl(name) {
  if (!name) return null;
  return `/uploads/identidad/${name}`;
}

router.get('/', requirePermiso('identidad','read'), (_req, res) => {
  try {
    ensureDirs();
    const st = loadState();
    return res.json({
      ok: true,
      appLogo: toUrl(st.appLogo),
      exportLogo: toUrl(st.exportLogo),
      sello: toUrl(st.sello),
      firma: toUrl(st.firma),
      includeSeal: st.includeSeal,
      includeSignature: st.includeSignature,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'failed' });
  }
});

router.post('/', requirePermiso('identidad','update'), upload.fields([
  { name: 'logo', maxCount: 1 }, // legacy: si viene, copiar a appLogo/exportLogo
  { name: 'appLogo', maxCount: 1 },
  { name: 'exportLogo', maxCount: 1 },
  { name: 'sello', maxCount: 1 },
  { name: 'firma', maxCount: 1 },
]), (req, res) => {
  try {
    ensureDirs();
    const current = loadState();
    const files = req.files || {};

    const replaceIf = (stateKey, fieldName = stateKey) => {
      const arr = files[fieldName];
      const entry = Array.isArray(arr) && arr[0] ? arr[0] : null;
      if (entry) {
        // Opcional: borrar anterior si existe
        if (current[stateKey]) {
          const prev = path.join(identidadDir, current[stateKey]);
          try { if (fs.existsSync(prev)) fs.unlinkSync(prev); } catch {}
        }
        current[stateKey] = entry.filename;
      }
    };

    // Legacy 'logo'
    replaceIf('appLogo', 'logo');
    replaceIf('exportLogo', 'logo');
    // Nuevos
    replaceIf('appLogo', 'appLogo');
    replaceIf('exportLogo', 'exportLogo');
    replaceIf('sello', 'sello');
    replaceIf('firma', 'firma');

    // Optimización/normalización de imágenes con sharp (omitir SVG)
    const optimize = async (stateKey, targetWidth) => {
      const fname = current[stateKey];
      if (!fname) return;
      const abs = path.join(identidadDir, fname);
      const lower = fname.toLowerCase();
      const isSvg = lower.endsWith('.svg');
      if (isSvg) return; // mantener SVG original (vectorial)
      try {
        const normName = `${Date.now()}_${stateKey}_norm.png`;
        const outPath = path.join(identidadDir, normName);
        // Redimensionar manteniendo aspecto, sin ampliar si es más pequeño
        await sharp(abs)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .png({ quality: 90 })
          .toFile(outPath);
        // Reemplazar referencia por la versión normalizada y borrar el original
        try { fs.unlinkSync(abs); } catch {}
        current[stateKey] = normName;
      } catch (e) {
        // Si falla sharp, dejar el archivo original
        console.warn('optimize image failed:', stateKey, e?.message);
      }
    };

    const optimizations = [];
    // Sólo optimizar los que cambiaron en esta petición (presentes en req.files)
    if (files.logo || files.appLogo) optimizations.push(optimize('appLogo', 220));
    if (files.logo || files.exportLogo) optimizations.push(optimize('exportLogo', 300));
    if (files.sello) optimizations.push(optimize('sello', 400));
    if (files.firma) optimizations.push(optimize('firma', 600));

    // Flags en body (multipart convierte a string)
    const valBool = (v, def) => {
      if (typeof v === 'boolean') return v;
      if (v === undefined) return def;
      const s = String(v).toLowerCase();
      if (['1','true','on','yes','si','sí'].includes(s)) return true;
      if (['0','false','off','no'].includes(s)) return false;
      return def;
    };
    current.includeSeal = valBool(req.body?.includeSeal, current.includeSeal ?? true);
    current.includeSignature = valBool(req.body?.includeSignature, current.includeSignature ?? true);

    Promise.allSettled(optimizations).then(() => {
      saveState(current);
      return res.json({
      ok: true,
      appLogo: toUrl(current.appLogo),
      exportLogo: toUrl(current.exportLogo),
      sello: toUrl(current.sello),
      firma: toUrl(current.firma),
      includeSeal: current.includeSeal,
      includeSignature: current.includeSignature,
      });
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'failed' });
  }
});

export default router;
