// backend/export/styles.js
// Estilos compartidos para exportaciones (XLSX/PDF).
// Permite sobreescritura desde un JSON opcional en docs/estilos-referencia/export-styles.json

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const DEFAULT_STYLES = {
  // PDF
  pdf: {
    // Si existen fuentes en export/fonts/ArialNarrow(.ttf/.otf), se usarán automáticamente.
    // De lo contrario se hace fallback a Helvetica.
    font: 'Helvetica',
    fontBold: 'Helvetica-Bold',
    titleFontSize: 14,
    headerFontSize: 10,
    rowFontSize: 9,
    margin: 36,
  headerHeight: 60,
  headerReserve: 80,
  logoWidth: 150,
  logoOffsetY: -8,
    showGradientBar: true,
    includeSignatureSeal: true,
    colors: {
      title: '#111827',
      headerBg: '#e2e8f0',
      headerText: '#111827',
      rowText: '#111827',
      zebraBg: '#f8fafc',
      grid: '#cbd5e1',
      meta: '#64748b',
      gradientStart: '#5eead4', // turquesa
      gradientEnd: '#a78bfa'    // lila
    }
  },
  // Excel
  excel: {
    font: { name: 'Calibri', size: 11, color: { argb: 'FF111827' } },
    header: {
      font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }, // gris azulado oscuro
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } }
    },
    row: {
      alignment: { vertical: 'middle', horizontal: 'left' },
      border: { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } } }
    },
    zebra: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } } }
  }
};

function readOverride() {
  try {
    // Buscar relativo al proyecto (dos niveles arriba de export/)
    const projectRoot = path.resolve(__dirname, '..');
    const candidates = [
      path.join(projectRoot, '..', 'docs', 'estilos-referencia', 'export-styles.json'),
      path.join(projectRoot, 'export-styles.json')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8');
        return JSON.parse(txt);
      }
    }
  } catch (_) {}
  return null;
}

export function getExportStyles() {
  const override = readOverride();
  if (!override) return DEFAULT_STYLES;
  // mezcla superficial
  return {
    pdf: { ...(DEFAULT_STYLES.pdf || {}), ...(override.pdf || {}), colors: { ...(DEFAULT_STYLES.pdf?.colors||{}), ...(override.pdf?.colors||{}) } },
    excel: { ...(DEFAULT_STYLES.excel || {}), ...(override.excel || {}), header: { ...(DEFAULT_STYLES.excel?.header||{}), ...(override.excel?.header||{}) }, row: { ...(DEFAULT_STYLES.excel?.row||{}), ...(override.excel?.row||{}) }, zebra: { ...(DEFAULT_STYLES.excel?.zebra||{}), ...(override.excel?.zebra||{}) } }
  };
}

export default getExportStyles;
