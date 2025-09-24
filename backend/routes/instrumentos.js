// backend/routes/instrumentos.js
import { Router } from 'express';
import pool from '../db.js';
import { registrarHistorialInstrumento, obtenerHistorialInstrumento } from '../helpers/historial.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const router = Router();

// Valida id numérico y evita colisiones con rutas no numéricas
router.param('id', (req, res, next, val) => {
  if (!/^\d+$/.test(String(val))) return next('route');
  next();
});

// GET /instrumentos
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, c.nombre as categoria_nombre, e.nombre as estado_nombre
      FROM Instrumento i
      LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
      LEFT JOIN Estados e ON i.id_estado = e.id_estado
      ORDER BY i.nombre ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /instrumentos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[instrumento]] = await pool.query(
      `SELECT i.*, c.nombre as categoria_nombre, e.nombre as estado_nombre
       FROM Instrumento i
       LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
       LEFT JOIN Estados e ON i.id_estado = e.id_estado
       WHERE i.id_instrumento = ?`,
      [id]
    );
    if (!instrumento) return res.status(404).json({ error: 'Instrumento no encontrado' });

    // ¿Está asignado actualmente? Traer todos los datos relevantes del alumno
    const [asignadoRows] = await pool.query(
      `SELECT a.id_alumno, a.nombre, a.genero, a.telefono_contacto, a.estado, ai.fecha_asignacion
       FROM Asignacion_Instrumento ai
       JOIN Alumno a ON ai.id_alumno = a.id_alumno
       WHERE ai.id_instrumento = ? AND ai.estado = 'Activo'
       ORDER BY ai.fecha_asignacion DESC
       LIMIT 1`,
      [id]
    );
    let asignado = null;
    if (asignadoRows[0]) {
      // Traer programas del alumno asignado
      const [programas] = await pool.query(
        `SELECT p.id_programa, p.nombre
         FROM alumno_programa ap
         JOIN Programa p ON ap.id_programa = p.id_programa
         WHERE ap.id_alumno = ?`,
        [asignadoRows[0].id_alumno]
      );
      asignado = { ...asignadoRows[0], programas };
    }
    res.json({ ...instrumento, asignado });
  } catch (err) {
    console.error('Error en GET /instrumentos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /instrumentos
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      id_categoria,
      numero_serie,
      id_estado,
      fecha_adquisicion = null,
      ubicacion = '',
    } = req.body;

    if (!nombre || !id_categoria || !numero_serie || !id_estado) {
      return res.status(400).json({ error: 'nombre, id_categoria, numero_serie e id_estado son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO Instrumento (nombre, id_categoria, numero_serie, id_estado, fecha_adquisicion, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, id_categoria, numero_serie, id_estado, fecha_adquisicion, ubicacion]
    );

    await registrarHistorialInstrumento(
      result.insertId,
      'CREACION',
      `Instrumento creado: ${nombre} (${numero_serie})`
    );

    // Obtener el nombre de la categoría y estado para la respuesta
    let categoria_nombre = null;
    let estado_nombre = null;
    try {
      const [[cat]] = await pool.query('SELECT nombre FROM Categoria WHERE id_categoria = ?', [id_categoria]);
      categoria_nombre = cat ? cat.nombre : null;
      const [[est]] = await pool.query('SELECT nombre FROM Estados WHERE id_estado = ?', [id_estado]);
      estado_nombre = est ? est.nombre : null;
    } catch {}

    res.status(201).json({
      id_instrumento: result.insertId,
      nombre,
      id_categoria,
      categoria_nombre,
      numero_serie,
      id_estado,
      estado_nombre,
      fecha_adquisicion,
      ubicacion,
    });
  } catch (err) {
    console.error('Error en POST /instrumentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /instrumentos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_categoria, numero_serie, id_estado, fecha_adquisicion, ubicacion } = req.body;

    const [result] = await pool.query(
      `UPDATE Instrumento
       SET nombre=?, id_categoria=?, numero_serie=?, id_estado=?, fecha_adquisicion=?, ubicacion=?
       WHERE id_instrumento=?`,
      [nombre, id_categoria, numero_serie, id_estado, fecha_adquisicion, ubicacion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado' });
    }

    await registrarHistorialInstrumento(
      id,
      'ACTUALIZACION',
      `Instrumento actualizado: ${nombre}`,
      'sistema'
    );

    // Obtener el nombre de la categoría y estado para la respuesta
    let categoria_nombre = null;
    let estado_nombre = null;
    try {
      const [[cat]] = await pool.query('SELECT nombre FROM Categoria WHERE id_categoria = ?', [id_categoria]);
      categoria_nombre = cat ? cat.nombre : null;
      const [[est]] = await pool.query('SELECT nombre FROM Estados WHERE id_estado = ?', [id_estado]);
      estado_nombre = est ? est.nombre : null;
    } catch {}

    res.json({
      id_instrumento: Number(id),
      nombre,
      id_categoria,
      categoria_nombre,
      numero_serie,
      id_estado,
      estado_nombre,
      fecha_adquisicion,
      ubicacion
    });
  } catch (err) {
    console.error('Error en PUT /instrumentos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /instrumentos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Borrar asignaciones del instrumento
    await pool.query('DELETE FROM Asignacion_Instrumento WHERE id_instrumento = ?', [id]);

    // 2) Borrar historial del instrumento (tabla correcta)
    await pool.query('DELETE FROM Instrumento_Historial WHERE id_instrumento = ?', [id]);

    // 3) Borrar instrumento
    const [del] = await pool.query('DELETE FROM Instrumento WHERE id_instrumento = ?', [id]);
    if (del.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado' });
    }

    res.json({ message: 'Instrumento eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /instrumentos/:id:', err);
    res.status(500).json({ error: 'No se pudo eliminar el instrumento. ' + err.message });
  }
});

// GET /instrumentos/:id/historial
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT h.id_historial, h.tipo, h.descripcion, h.usuario, h.creado_en,
              a.nombre AS nombre_alumno
       FROM Instrumento_Historial h
       LEFT JOIN Alumno a ON h.id_alumno = a.id_alumno
       WHERE h.id_instrumento = ?
       ORDER BY h.creado_en DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /instrumentos/:id/historial', err);
    res.status(500).json({ error: 'Error obteniendo historial instrumento' });
  }
});

// POST /instrumentos/:id/historial
router.post('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params; // id_instrumento
    const { tipo = 'OTRO', descripcion = '', usuario = 'sistema', id_alumno = null } = req.body;

    await pool.query(
      `INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario, id_alumno) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, tipo, descripcion, usuario, id_alumno]
    );

    res.status(201).json({ message: 'Historial de instrumento registrado' });
  } catch (err) {
    console.error('Error en POST /instrumentos/:id/historial', err);
    res.status(500).json({ error: 'Error guardando historial instrumento' });
  }
});

// POST /instrumentos/export-masivo { ids: number[], format: 'csv'|'xlsx'|'pdf' }
router.post('/export-masivo', async (req, res) => {
  try {
    const { ids = [], format = 'csv' } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array requerido en body' });

    const [rows] = await pool.query(
      `SELECT i.id_instrumento, i.nombre, i.numero_serie, c.nombre AS categoria, e.nombre AS estado, i.fecha_adquisicion, i.ubicacion
       FROM Instrumento i
       LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
       LEFT JOIN Estados e ON i.id_estado = e.id_estado
       WHERE i.id_instrumento IN (?)
       ORDER BY i.nombre ASC`,
      [ids]
    );

    const data = rows.map(r => ({
      id_instrumento: r.id_instrumento,
      nombre: r.nombre || '',
      numero_serie: r.numero_serie || '',
      categoria: r.categoria || '',
      estado: r.estado || '',
      fecha_adquisicion: (() => {
        const v = r.fecha_adquisicion;
        try {
          if (!v) return '';
          if (typeof v === 'string') return v.slice(0, 10);
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          const d = new Date(v);
          return isNaN(d) ? '' : d.toISOString().slice(0, 10);
        } catch { return ''; }
      })(),
      ubicacion: r.ubicacion || ''
    }));

    if (format === 'csv') {
      const cols = [
        { key: 'id_instrumento', title: 'ID' },
        { key: 'nombre', title: 'Nombre' },
        { key: 'numero_serie', title: 'Serie' },
        { key: 'categoria', title: 'Categoría' },
        { key: 'estado', title: 'Estado' },
        { key: 'fecha_adquisicion', title: 'F. Adq.' },
        { key: 'ubicacion', title: 'Ubicación' },
      ];
      const lines = [cols.map(c => c.title).join(',')];
      if (data.length === 0) {
        lines.push(cols.map(() => '""').join(','));
      } else {
        for (const row of data) {
          const vals = cols.map(c => `"${String(row[c.key] ?? '').replace(/"/g,'""')}"`);
          lines.push(vals.join(','));
        }
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_masivo_${Date.now()}.csv"`);
      return res.send(csv);
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new();
      const cols = [
        { key: 'id_instrumento', title: 'ID' },
        { key: 'nombre', title: 'Nombre' },
        { key: 'numero_serie', title: 'Serie' },
        { key: 'categoria', title: 'Categoría' },
        { key: 'estado', title: 'Estado' },
        { key: 'fecha_adquisicion', title: 'F. Adq.' },
        { key: 'ubicacion', title: 'Ubicación' },
      ];
      const aoa = [cols.map(c => c.title)];
      if (data.length === 0) {
        aoa.push(cols.map(() => ''));
      } else {
        aoa.push(...data.map(r => cols.map(c => r[c.key])));
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [
        { wch: 6 },  // ID
        { wch: 24 }, // Nombre
        { wch: 18 }, // Serie
        { wch: 18 }, // Categoría
        { wch: 14 }, // Estado
        { wch: 12 }, // F. Adq.
        { wch: 16 }, // Ubicación
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Instrumentos');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_masivo_${Date.now()}.xlsx"`);
      return res.send(buf);
    }

  if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_masivo_${Date.now()}.pdf"`);
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);
      doc.fontSize(14).text('Instrumentos exportados', { align: 'center' });
      const now = new Date();
      const hours12 = now.getHours() % 12 || 12;
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      const ts = `${now.toLocaleDateString()} ${hours12}:${String(now.getMinutes()).padStart(2,'0')} ${ampm}`;
      doc.fontSize(8).fillColor('#666').text(`Generado: ${ts}`, { align: 'right' });
      doc.fillColor('#000');
      doc.moveDown();

      const headers = ['ID','Nombre','Serie','Categoría','Estado','F. Adq.','Ubicación'];
      const widths = [40,150,90,90,65,50,50];
      const tableWidth = widths.reduce((a,b)=>a+b, 0);
      const padX = 4;
      const rowHeight = 18;
      let tableStartX = 0;

      const fitText = (text, maxWidth) => {
        let t = String(text ?? '');
        const ell = '…';
        while (doc.widthOfString(t) > maxWidth && t.length > 0) t = t.slice(0, -1);
        if (t.length < String(text ?? '').length && t.length > 0) {
          while (doc.widthOfString(t + ell) > maxWidth && t.length > 0) t = t.slice(0, -1);
          t += ell;
        }
        return t;
      };

      const drawRow = (vals, isHeader=false, zebra=false) => {
        const y = doc.y;
        const startX = tableStartX || doc.x;
        if (zebra && !isHeader) {
          doc.save();
          doc.rect(startX, y - 2, tableWidth, rowHeight).fill('#fafafa');
          doc.fillColor('#000');
          doc.restore();
        }
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor('#111827');
        let x = startX;
        for (let i=0;i<vals.length;i++) {
          const maxW = widths[i] - padX * 2;
          const txt = fitText(vals[i], maxW);
          doc.text(txt, x + padX, y + 3, { width: maxW, lineBreak: false });
          x += widths[i];
        }
        const sepY = y + rowHeight - 2;
        doc.moveTo(startX, sepY).lineTo(startX + tableWidth, sepY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        doc.strokeColor('#000').lineWidth(1);
        doc.y = y + rowHeight;
      };

      const drawHeader = () => {
        const startX = doc.x;
        const startY = doc.y;
        const headerHeight = rowHeight;
        doc.save();
        doc.rect(startX, startY - 2, tableWidth, headerHeight).fill('#f3f4f6');
        doc.fillColor('#111827');
        doc.restore();
        tableStartX = startX;
        drawRow(headers, true, false);
      };

      drawHeader();
      doc.on('pageAdded', () => drawHeader());

      const formatDate = (s) => {
        if (!s) return '';
        try { const d = new Date(s); if (isNaN(d)) return s; return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }); } catch { return s; }
      };

      if (data.length === 0) {
        doc.moveDown();
        doc.font('Helvetica-Oblique').fillColor('#6b7280').text('No hay registros para mostrar.', { align: 'center' });
        doc.fillColor('#000');
      } else {
        data.forEach((r, idx) => {
          drawRow([r.id_instrumento, r.nombre, r.numero_serie, r.categoria, r.estado, formatDate(r.fecha_adquisicion), r.ubicacion], false, idx % 2 === 1);
        });
      }

      // Resumen
      const total = data.length;
      const disponibles = data.filter(d => d.estado?.toLowerCase() === 'disponible').length;
      const asignados = data.filter(d => d.estado?.toLowerCase() === 'asignado').length;
      const otros = total - disponibles - asignados;
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Resumen');
      doc.font('Helvetica').text(`Total instrumentos: ${total}`);
      doc.text(`Disponibles: ${disponibles}    Asignados: ${asignados}    Otros: ${otros}`);

      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#666').text(`Página ${i + 1} de ${range.count}`, 30, doc.page.height - 30, { align: 'center' }).fillColor('#000');
      }
      doc.end();
      return;
    }

    res.status(400).json({ error: 'Formato no soportado. Usa csv | xlsx | pdf' });
  } catch (err) {
    console.error('Error en POST /instrumentos/export-masivo:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// POST /instrumentos/export { ids?: number[], format: 'csv'|'xlsx'|'pdf' }
router.post('/export', async (req, res) => {
  try {
    const { ids = [], format = 'csv' } = req.body;

    const where = Array.isArray(ids) && ids.length ? 'WHERE i.id_instrumento IN (?)' : '';
    const params = Array.isArray(ids) && ids.length ? [ids] : [];
    const [rows] = await pool.query(
      `SELECT i.id_instrumento, i.nombre, i.numero_serie, c.nombre AS categoria, e.nombre AS estado, i.fecha_adquisicion, i.ubicacion
       FROM Instrumento i
       LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
       LEFT JOIN Estados e ON i.id_estado = e.id_estado
       ${where}
       ORDER BY i.nombre ASC`,
      params
    );

    const data = rows.map(r => ({
      id_instrumento: r.id_instrumento,
      nombre: r.nombre || '',
      numero_serie: r.numero_serie || '',
      categoria: r.categoria || '',
      estado: r.estado || '',
      fecha_adquisicion: (() => {
        const v = r.fecha_adquisicion;
        try {
          if (!v) return '';
          if (typeof v === 'string') return v.slice(0, 10);
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          const d = new Date(v);
          return isNaN(d) ? '' : d.toISOString().slice(0, 10);
        } catch { return ''; }
      })(),
      ubicacion: r.ubicacion || ''
    }));

    if ((format === 'xlsx') || (format === 'excel')) {
      const wb = XLSX.utils.book_new();
      const cols = [
        { key: 'id_instrumento', title: 'ID' },
        { key: 'nombre', title: 'Nombre' },
        { key: 'numero_serie', title: 'Serie' },
        { key: 'categoria', title: 'Categoría' },
        { key: 'estado', title: 'Estado' },
        { key: 'fecha_adquisicion', title: 'F. Adq.' },
        { key: 'ubicacion', title: 'Ubicación' },
      ];
      const aoa = [cols.map(c => c.title)];
      if (data.length === 0) {
        aoa.push(cols.map(() => ''));
      } else {
        aoa.push(...data.map(r => cols.map(c => r[c.key])));
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [
        { wch: 6 },  // ID
        { wch: 24 }, // Nombre
        { wch: 18 }, // Serie
        { wch: 18 }, // Categoría
        { wch: 14 }, // Estado
        { wch: 12 }, // F. Adq.
        { wch: 16 }, // Ubicación
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Instrumentos');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_${Date.now()}.xlsx"`);
      return res.send(buf);
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_${Date.now()}.pdf"`);
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);

  // Encabezado
  doc.fontSize(14).text('Instrumentos exportados', { align: 'center' });
      const now = new Date();
      const hours12 = now.getHours() % 12 || 12;
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      const ts = `${now.toLocaleDateString()} ${hours12}:${String(now.getMinutes()).padStart(2,'0')} ${ampm}`;
      doc.fontSize(8).fillColor('#666').text(`Generado: ${ts}`, { align: 'right' });
      doc.fillColor('#000');
  doc.moveDown();

  const headers = ['ID','Nombre','Serie','Categoría','Estado','F. Adq.','Ubicación'];
  // A4 width 595pt, margen 30 a cada lado => ancho útil ~535pt. La suma debe ser 535.
  const widths = [40,150,90,90,65,50,50];

      const tableWidth = widths.reduce((a,b)=>a+b, 0);
      const padX = 4;
      const rowHeight = 18;
      let tableStartX = 0;

      const fitText = (text, maxWidth) => {
        let t = String(text ?? '');
        const ell = '…';
        // Evitar saltos de línea: truncar hasta que quepa
        while (doc.widthOfString(t) > maxWidth && t.length > 0) {
          t = t.slice(0, -1);
        }
        if (t.length < String(text ?? '').length && t.length > 0) {
          // Asegurar espacio para elipsis
          while (doc.widthOfString(t + ell) > maxWidth && t.length > 0) t = t.slice(0, -1);
          t += ell;
        }
        return t;
      };

      const drawRow = (vals, isHeader=false, zebra=false) => {
        const y = doc.y;
        const startX = tableStartX || doc.x;
        if (zebra && !isHeader) {
          doc.save();
          doc.rect(startX, y - 2, tableWidth, rowHeight).fill('#fafafa');
          doc.fillColor('#000');
          doc.restore();
        }
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor('#111827');
        let x = startX;
        for (let i=0;i<vals.length;i++) {
          const maxW = widths[i] - padX * 2;
          const txt = fitText(vals[i], maxW);
          doc.text(txt, x + padX, y + 3, { width: maxW, lineBreak: false });
          x += widths[i];
        }
        // Línea separadora inferior (para header y filas)
        const sepY = y + rowHeight - 2;
        doc.moveTo(startX, sepY).lineTo(startX + tableWidth, sepY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        doc.strokeColor('#000').lineWidth(1);
        // Avanzar fila
        doc.y = y + rowHeight;
      };

      const drawHeader = () => {
        // Fondo de encabezado
        const startX = doc.x;
        const startY = doc.y;
        const headerHeight = rowHeight;
        doc.save();
        doc.rect(startX, startY - 2, tableWidth, headerHeight).fill('#f3f4f6'); // gris más claro
        doc.fillColor('#111827');
        doc.restore();
        tableStartX = startX;
        drawRow(headers, true, false);
      };
      // Cabecera inicial y por cada nueva página
      drawHeader();
      doc.on('pageAdded', () => {
        // Repetir encabezado de la tabla en cada página nueva
        drawHeader();
      });
      const formatDate = (s) => {
        if (!s) return '';
        try {
          const d = new Date(s);
          if (isNaN(d)) return s;
          // estilo similar al de alumnos (abreviado)
          const opts = { weekday: 'short', month: 'short', day: '2-digit' };
          return d.toLocaleDateString('en-US', opts);
        } catch { return s; }
      };
      if (data.length === 0) {
        doc.moveDown();
        doc.font('Helvetica-Oblique').fillColor('#6b7280').text('No hay registros para mostrar.', { align: 'center' });
        doc.fillColor('#000');
      } else {
        data.forEach((r, idx) => {
          drawRow([
            r.id_instrumento,
            r.nombre,
            r.numero_serie,
            r.categoria,
            r.estado,
            formatDate(r.fecha_adquisicion),
            r.ubicacion
          ], false, idx % 2 === 1);
        });
      }

  // Resumen
  const total = data.length;
  const disponibles = data.filter(d => d.estado?.toLowerCase() === 'disponible').length;
  const asignados = data.filter(d => d.estado?.toLowerCase() === 'asignado').length;
  const otros = total - disponibles - asignados;
  doc.moveDown();
  doc.font('Helvetica-Bold').text('Resumen');
  doc.font('Helvetica').text(`Total instrumentos: ${total}`);
  doc.text(`Disponibles: ${disponibles}    Asignados: ${asignados}    Otros: ${otros}`);

      // Pie de página
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#666')
          .text(`Página ${i + 1} de ${range.count}`, 30, doc.page.height - 30, { align: 'center' })
          .fillColor('#000');
      }
      doc.end();
      return;
    }

    // CSV por defecto
    const cols = [
      { key: 'id_instrumento', title: 'ID' },
      { key: 'nombre', title: 'Nombre' },
      { key: 'numero_serie', title: 'Serie' },
      { key: 'categoria', title: 'Categoría' },
      { key: 'estado', title: 'Estado' },
      { key: 'fecha_adquisicion', title: 'F. Adq.' },
      { key: 'ubicacion', title: 'Ubicación' },
    ];
    const lines = [cols.map(c => c.title).join(',')];
    if (data.length === 0) {
      lines.push(cols.map(() => '""').join(','));
    } else {
      for (const row of data) {
        const vals = cols.map(c => `"${String(row[c.key] ?? '').replace(/"/g,'""')}"`);
        lines.push(vals.join(','));
      }
    }
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error('Error en POST /instrumentos/export:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// PUT /instrumentos/estado-masivo  { ids: number[], id_estado?: number, estado_nombre?: string, usuario?: string }
router.put('/estado-masivo', async (req, res) => {
  try {
    const { ids = [], id_estado = null, estado_nombre = null, usuario = 'sistema' } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array requerido' });

    let targetIdEstado = id_estado;
    let targetNombre = null;
    if (!targetIdEstado && estado_nombre) {
      const [[row]] = await pool.query('SELECT id_estado, nombre FROM Estados WHERE nombre = ? LIMIT 1', [estado_nombre]);
      if (!row) return res.status(400).json({ error: 'estado_nombre no válido' });
      targetIdEstado = row.id_estado;
      targetNombre = row.nombre;
    }
    if (!targetIdEstado) return res.status(400).json({ error: 'Debe enviar id_estado o estado_nombre' });

    // Obtener nombre si no lo tenemos
    if (!targetNombre) {
      const [[row]] = await pool.query('SELECT nombre FROM Estados WHERE id_estado = ? LIMIT 1', [targetIdEstado]);
      targetNombre = row ? row.nombre : String(targetIdEstado);
    }

    await pool.query('UPDATE Instrumento SET id_estado = ? WHERE id_instrumento IN (?)', [targetIdEstado, ids]);
    for (const id of ids) {
      await registrarHistorialInstrumento(id, 'ESTADO', `Estado cambiado a ${targetNombre}`, usuario);
    }
    res.json({ message: 'Estado actualizado para los instrumentos seleccionados' });
  } catch (err) {
    console.error('Error en PUT /instrumentos/estado-masivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /instrumentos/eliminar-masivo { ids: number[] }
router.post('/eliminar-masivo', async (req, res) => {
  try {
    const { ids = [] } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array requerido' });

    await pool.query('DELETE FROM Asignacion_Instrumento WHERE id_instrumento IN (?)', [ids]);
    await pool.query('DELETE FROM Instrumento_Historial WHERE id_instrumento IN (?)', [ids]);
    await pool.query('DELETE FROM Instrumento WHERE id_instrumento IN (?)', [ids]);

    res.json({ message: 'Instrumentos eliminados correctamente' });
  } catch (err) {
    console.error('Error en POST /instrumentos/eliminar-masivo:', err);
    res.status(500).json({ error: err.message });
  }
});



export default router;