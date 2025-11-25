// backend/export/excel.js
// Utilidad para construir un XLSX estilizado usando exceljs

import ExcelJS from 'exceljs';
import { getExportStyles } from './styles.js';

/**
 * buildWorkbookBuffer
 * @param {Object} opts
 * @param {string} [opts.sheetName]
 * @param {Array<{header:string,key:string,width?:number}>} opts.columns
 * @param {Array<Object>} opts.rows
 * @returns {Promise<Buffer>}
 */
export async function buildWorkbookBuffer({ sheetName = 'Hoja1', columns = [], rows = [] }) {
  const styles = getExportStyles();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema Orquesta';
  wb.created = new Date();
  const ws = wb.addWorksheet(sheetName, { properties: { defaultRowHeight: 16 } });

  // Definir columnas
  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 15 }));

  // Header style
  const headerRow = ws.getRow(1);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    if (styles.excel.header.font) cell.font = styles.excel.header.font;
    if (styles.excel.header.fill) cell.fill = styles.excel.header.fill;
    if (styles.excel.header.alignment) cell.alignment = styles.excel.header.alignment;
    if (styles.excel.header.border) cell.border = styles.excel.header.border;
  });

  // Datos
  rows.forEach((r) => ws.addRow(r));

  // Estilos de filas
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header ya tratado
    row.eachCell((cell) => {
      cell.font = { ...(styles.excel.font || {}), ...(cell.font || {}) };
      if (styles.excel.row?.alignment) cell.alignment = styles.excel.row.alignment;
      if (styles.excel.row?.border) cell.border = styles.excel.row.border;
    });
    if (rowNumber % 2 === 0 && styles.excel.zebra?.fill) {
      row.eachCell((cell) => { cell.fill = styles.excel.zebra.fill; });
    }
  });

  // Auto filtro y congelar encabezado
  if (columns.length) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length }
    };
  }
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export default { buildWorkbookBuffer };
