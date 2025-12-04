// backend/export/pdf.js
// Utilidad para generar tablas PDF con estilo consistente

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { getExportStyles } from './styles.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function findFontPaths() {
  const fontsDir = path.join(__dirname, 'fonts');
  const candidates = [
    { key: 'regular', names: ['ArialNarrow.ttf', 'ArialNarrow-Regular.ttf', 'Arial Narrow.ttf'] },
    { key: 'bold', names: ['ArialNarrow-Bold.ttf', 'Arial Narrow Bold.ttf'] }
  ];
  const out = {};
  for (const c of candidates) {
    for (const n of c.names) {
      const p = path.join(fontsDir, n);
      if (fs.existsSync(p)) { out[c.key] = p; break; }
    }
  }
  return out;
}

function tryRegisterFonts(doc) {
  const f = findFontPaths();
  if (f.regular) {
    try { doc.registerFont('ArialNarrow', f.regular); } catch {}
  }
  if (f.bold) {
    try { doc.registerFont('ArialNarrow-Bold', f.bold); } catch {}
  }
}

function assetPath(file) {
  return path.join(__dirname, 'img', file);
}

function getBrandingAssetPaths() {
  // Lee backend/data/identidad.json y arma rutas absolutas a backend/uploads/identidad
  try {
    const backendRoot = path.resolve(__dirname, '..');
    // Ruta correcta
    const dataFile = path.join(backendRoot, 'data', 'identidad.json');
    // Fallback de compatibilidad si alguien quedó con backend/backend
    const legacyDataFile = path.join(backendRoot, 'backend', 'data', 'identidad.json');
    const fileToUse = fs.existsSync(dataFile) ? dataFile : (fs.existsSync(legacyDataFile) ? legacyDataFile : null);
    if (!fileToUse) return {};
    const raw = fs.readFileSync(fileToUse, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    // Normalizar estructura: soportar legacy 'logo'
    const appLogo = parsed.appLogo || parsed.logo || null;
    const exportLogo = parsed.exportLogo || parsed.logo || null;
    const includeSeal = typeof parsed.includeSeal === 'boolean' ? parsed.includeSeal : true;
    const includeSignature = typeof parsed.includeSignature === 'boolean' ? parsed.includeSignature : true;

    const uploadsDir = path.join(backendRoot, 'uploads', 'identidad');
    const legacyUploadsDir = path.join(backendRoot, 'backend', 'uploads', 'identidad');
    const dirToUse = fs.existsSync(uploadsDir) ? uploadsDir : legacyUploadsDir;
    const mk = (name) => (name ? path.join(dirToUse, name) : null);
    const out = {
      appLogo: mk(appLogo),
      exportLogo: mk(exportLogo),
      sello: mk(parsed.sello),
      firma: mk(parsed.firma),
      includeSeal,
      includeSignature,
    };
    for (const k of Object.keys(out)) {
      if ((k === 'appLogo' || k === 'exportLogo' || k === 'sello' || k === 'firma') && out[k] && !fs.existsSync(out[k])) out[k] = null;
    }
    return out;
  } catch {
    return {};
  }
}

function drawHeaderDecor(doc, styles) {
  if (!styles.pdf.showGradientBar) return;
  // barra vertical izquierda con gradiente
  const m = styles.pdf.margin || 30;
  const gWidth = 14;
  const grad = doc.linearGradient(m - 18, m, m - 18 + gWidth, doc.page.height - m);
  grad.stop(0, styles.pdf.colors.gradientStart).stop(1, styles.pdf.colors.gradientEnd);
  doc.save();
  doc.rect(m - 18, m, gWidth, doc.page.height - m * 2).fill(grad);
  doc.restore();
}

/**
 * streamTablePDF
 * @param {import('express').Response} res
 * @param {Object} opts
 * @param {string} opts.title - Título del reporte
 * @param {Array<{header:string,key:string,width:number,format?:(v:any)=>string}>} opts.columns - Columnas y anchos (pt)
 * @param {Array<Object>} opts.rows - Filas de datos
 */
export function streamTablePDF(res, { title, columns, rows }) {
  const styles = getExportStyles();
  const margin = styles.pdf.margin || 30;
  const doc = new PDFDocument({ margin, size: 'A4' });
  doc.pipe(res);
  tryRegisterFonts(doc);

  // Intentar usar ArialNarrow si está registrada
  const fontRegular = doc._registeredFonts?.['ArialNarrow'] ? 'ArialNarrow' : styles.pdf.font;
  const fontBold = doc._registeredFonts?.['ArialNarrow-Bold'] ? 'ArialNarrow-Bold' : styles.pdf.fontBold;

  const branding = getBrandingAssetPaths();
  // Forzar que el logo de exportación sea el logo del sistema cuando no
  // exista uno personalizado. `assetPath('logo.png')` es el logo fijo
  // empaquetado con el backend (coincide con el logo público del frontend
  // si se copia allí). Priorizar branding.exportLogo > branding.appLogo > sistema.
  const chosenLogo = branding.exportLogo || branding.appLogo || assetPath('logo.png');
  const logos = { right: chosenLogo || assetPath('logo-sin-fondo.png') };
  const headerH = styles.pdf.headerHeight || 60;
  const headerReserve = Math.max(headerH, styles.pdf.headerReserve || 80);
  // Reducir tamaño logo un 25% (aprox 112px si base es 150) y subirlo un poco más
  const logoW = Math.max(60, (styles.pdf.logoWidth || 150) * 0.75);
  const imgY = Math.max(6, margin + (styles.pdf.logoOffsetY ?? -15));

  const now = new Date();
  const hh = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const ts = `${now.toLocaleDateString()} ${String(hh)}:${String(now.getMinutes()).padStart(2,'0')} ${ampm}`;

  const footerReserve = 120; // espacio para firma/sello

  function renderPageChrome() {
    drawHeaderDecor(doc, styles);
    
    // Logo Izquierdo
    if (fs.existsSync(logos.right)) {
      doc.image(logos.right, margin, imgY, { width: logoW });
    }

    // Fecha Generado (Derecha Superior)
    const genY = Math.max(10, margin - 10);
    doc.fontSize(8).fillColor(styles.pdf.colors.meta).text(`Generado: ${ts}`, margin, genY, { align: 'right', width: doc.page.width - (margin * 2) });

    // Título Centrado (ajustado verticalmente para alinearse mejor con el logo)
    const titleY = imgY + 35;
    doc.font(fontRegular).fontSize(styles.pdf.titleFontSize + 2).fillColor(styles.pdf.colors.title);
    doc.text(title || 'Reporte', margin, titleY, { align: 'center', width: doc.page.width - (margin * 2) });

    doc.fillColor(styles.pdf.colors.rowText);
    
    // Garantizar que el contenido de tabla empiece por debajo del encabezado y del logo
    doc.y = Math.max(doc.y, margin + headerReserve);
    drawFooterSignSeal();
  }

  function drawFooterSignSeal() {
    // Respetar flags identidad; si no están, usar styles.pdf.includeSignatureSeal
    const allow = styles.pdf.includeSignatureSeal !== false;
    const useSeal = branding.includeSeal ?? allow;
    const useSig = branding.includeSignature ?? allow;
    if (!useSeal && !useSig) return;
    const sello = useSeal ? (branding.sello || assetPath('sello.png')) : null;
    const firma = useSig ? (branding.firma || assetPath('firma.png')) : null;
    const y = doc.page.height - margin - footerReserve + 10;
    // Ubicar a la derecha inferior
    if (firma && fs.existsSync(firma)) {
      doc.image(firma, doc.page.width - margin - 180, y, { width: 140 });
    }
    if (sello && fs.existsSync(sello)) {
      doc.image(sello, doc.page.width - margin - 110, y + 35, { width: 100 });
    }
  }

  renderPageChrome();

  const widths = columns.map(c => c.width);
  const tableWidth = widths.reduce((a,b)=>a+b, 0);
  const padX = 4;
  const rowHeight = 18;
  let tableStartX = 0;

  const fitText = (text, maxWidth) => {
    const t0 = String(text ?? '');
    let t = t0;
    const ell = '…';
    while (doc.widthOfString(t) > maxWidth && t.length > 0) t = t.slice(0, -1);
    if (t.length < t0.length && t.length > 0) {
      while (doc.widthOfString(t + ell) > maxWidth && t.length > 0) t = t.slice(0, -1);
      t += ell;
    }
    return t;
  };

  const drawRow = (vals, { header = false, zebra = false } = {}) => {
    const y = doc.y;
    const startX = tableStartX || doc.x;
    if (zebra && !header) {
      doc.save();
      doc.rect(startX, y - 2, tableWidth, rowHeight).fill(styles.pdf.colors.zebraBg);
      doc.fillColor(styles.pdf.colors.rowText).restore();
    }
    doc.font(header ? fontBold : fontRegular)
      .fontSize(header ? styles.pdf.headerFontSize : styles.pdf.rowFontSize)
      .fillColor(styles.pdf.colors.rowText);
    let x = startX;
    for (let i = 0; i < vals.length; i++) {
      const maxW = widths[i] - padX * 2;
      const txt = fitText(vals[i], maxW);
      doc.text(txt, x + padX, y + 3, { width: maxW, lineBreak: false });
      x += widths[i];
    }
    const sepY = y + rowHeight - 2;
    doc.moveTo(startX, sepY).lineTo(startX + tableWidth, sepY).strokeColor(styles.pdf.colors.grid).lineWidth(0.5).stroke();
    doc.strokeColor('#000').lineWidth(1);
    doc.y = y + rowHeight;
  };

  const drawHeader = () => {
    const startX = doc.x;
    const startY = doc.y;
    doc.save();
    doc.rect(startX, startY - 2, tableWidth, rowHeight).fill(styles.pdf.colors.headerBg);
    doc.fillColor(styles.pdf.colors.headerText).restore();
    tableStartX = startX;
    drawRow(columns.map(c => c.header), { header: true });
  };

  drawHeader();
  doc.on('pageAdded', () => { renderPageChrome(); drawHeader(); });

  if (!rows || rows.length === 0) {
    doc.moveDown();
    doc.font(fontRegular).fontSize(9).fillColor('#6b7280').text('No hay registros para mostrar.', { align: 'center' });
    doc.fillColor(styles.pdf.colors.rowText);
  } else {
    rows.forEach((r, idx) => {
      const values = columns.map(c => {
        const raw = r[c.key];
        return c.format ? c.format(raw) : raw;
      });
      // Si nos acercamos al pie reservado, forzar salto
      if (doc.y > doc.page.height - (margin + footerReserve)) {
        doc.addPage();
      }
      drawRow(values, { zebra: idx % 2 === 1 });
    });
  }

  // Pie de página con paginación
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Truco para escribir en el margen inferior sin disparar nueva página
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.fontSize(8).fillColor(styles.pdf.colors.meta)
      .text(`Página ${i + 1} de ${range.count}` , margin, doc.page.height - margin + 10, { align: 'center', lineBreak: false })
      .fillColor(styles.pdf.colors.rowText);
      
    doc.page.margins.bottom = oldBottom;
  }

  doc.end();
}

export default { streamTablePDF };
