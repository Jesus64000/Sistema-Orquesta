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
      const headers = Object.keys(data[0] || { id_instrumento:'', nombre:'', numero_serie:'', categoria:'', estado:'', fecha_adquisicion:'', ubicacion:'' });
      const lines = [headers.join(',')];
      for (const row of data) {
        const vals = headers.map(h => `"${String(row[h] ?? '').replace(/"/g,'""')}"`);
        lines.push(vals.join(','));
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="instrumentos_export_masivo_${Date.now()}.csv"`);
      return res.send(csv);
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
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
      doc.fontSize(14).text('Exportación de Instrumentos', { align: 'center' });
      doc.moveDown();
      const titles = ['ID','Nombre','Serie','Categoría','Estado','F. Adq.','Ubicación'];
      const drawRow = (vals, bold=false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
        for (let i=0;i<vals.length;i++) {
          const t = String(vals[i] ?? '');
          doc.text(t, { continued: i < vals.length - 1, width: [40,140,90,100,80,70,120][i] });
        }
        doc.text('\n');
      };
      drawRow(titles, true);
      doc.moveDown(0.2);
      data.forEach(r => drawRow([r.id_instrumento, r.nombre, r.numero_serie, r.categoria, r.estado, r.fecha_adquisicion, r.ubicacion]));
      doc.end();
      return;
    }

    res.status(400).json({ error: 'Formato no soportado. Usa csv | xlsx | pdf' });
  } catch (err) {
    console.error('Error en POST /instrumentos/export-masivo:', err);
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