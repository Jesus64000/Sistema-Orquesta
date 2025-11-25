// backend/boot/migrateLegacyPaths.js
// Migra y limpia rutas legadas creadas accidentalmente como backend/backend/* hacia backend/*
import fs from 'fs';
import path from 'path';

function ensureDir(p) {
  try { fs.mkdirSync(p, { recursive: true }); } catch {}
}

function copyFileSafe(src, dst) {
  try {
    if (!fs.existsSync(src)) return;
    ensureDir(path.dirname(dst));
    if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
  } catch {}
}

function moveDirContents(srcDir, dstDir) {
  try {
    if (!fs.existsSync(srcDir)) return;
    ensureDir(dstDir);
    const items = fs.readdirSync(srcDir);
    for (const it of items) {
      const s = path.join(srcDir, it);
      const d = path.join(dstDir, it);
      try {
        const stat = fs.statSync(s);
        if (stat.isDirectory()) {
          moveDirContents(s, d);
        } else if (stat.isFile()) {
          if (!fs.existsSync(d)) fs.copyFileSync(s, d);
        }
      } catch {}
    }
  } catch {}
}

function rmDirIfEmpty(dir) {
  try {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const it of items) {
      const p = path.join(dir, it);
      try {
        const st = fs.statSync(p);
        if (st.isDirectory()) rmDirIfEmpty(p);
      } catch {}
    }
    // Re-evaluar tras limpiar subcarpetas
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  } catch {}
}

export function migrateLegacyPaths() {
  try {
    const backendRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
    // En Windows, URL path empieza con /F:/...; normalizar
    const root = path.resolve(decodeURIComponent(backendRoot));

    // Paths correctos
    const dataDir = path.join(root, 'data');
    const uploadsDir = path.join(root, 'uploads');
    ensureDir(dataDir);
    ensureDir(uploadsDir);

    // Paths legados (incorrectos)
    const legacyRoot = path.join(root, 'backend');
    const legacyData = path.join(legacyRoot, 'data');
    const legacyUploads = path.join(legacyRoot, 'uploads');

    // Migrar JSON de identidad si existe
    const newIdentFile = path.join(dataDir, 'identidad.json');
    copyFileSafe(path.join(legacyData, 'identidad.json'), newIdentFile);
    // Normalizar identidad.json si contiene sólo 'logo'
    try {
      if (fs.existsSync(newIdentFile)) {
        const raw = fs.readFileSync(newIdentFile, 'utf8');
        const parsed = JSON.parse(raw || '{}');
        const hasNew = parsed.appLogo || parsed.exportLogo || typeof parsed.includeSeal === 'boolean' || typeof parsed.includeSignature === 'boolean';
        if (!hasNew && parsed.logo) {
          const norm = {
            appLogo: parsed.appLogo || parsed.logo,
            exportLogo: parsed.exportLogo || parsed.logo,
            sello: parsed.sello || null,
            firma: parsed.firma || null,
            includeSeal: true,
            includeSignature: true,
          };
          fs.writeFileSync(newIdentFile, JSON.stringify(norm, null, 2), 'utf8');
        }
      }
    } catch {}
    // Migrar JSON de personalización si existe
    copyFileSafe(path.join(legacyData, 'personalizacion.json'), path.join(dataDir, 'personalizacion.json'));
    // Migrar uploads/identidad
    moveDirContents(path.join(legacyUploads, 'identidad'), path.join(uploadsDir, 'identidad'));

    // Limpieza best-effort (solo si está vacío)
    rmDirIfEmpty(path.join(legacyUploads, 'identidad'));
    rmDirIfEmpty(legacyUploads);
    rmDirIfEmpty(legacyData);
    rmDirIfEmpty(legacyRoot);
  } catch (e) {
    // No bloquear el arranque por fallos de limpieza
    console.warn('[boot] migrateLegacyPaths warning:', e.message);
  }
}

export default migrateLegacyPaths;
