// backend/routes/eventos.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();


// POST /eventos
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa = null } = req.body;

    if (!titulo || !fecha_evento || !hora_evento || !lugar) {
      return res.status(400).json({ error: 'Título, fecha, hora y lugar son obligatorios' });
    }

    // Validar que la fecha no sea pasada
    const hoy = new Date().toISOString().split('T')[0];
    if (fecha_evento < hoy) {
      return res.status(400).json({ error: 'La fecha no puede estar en el pasado' });
    }

    const [result] = await pool.query(
      'INSERT INTO Evento (titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa]
    );

    res.status(201).json({
      id_evento: result.insertId,
      titulo,
      descripcion,
      fecha_evento,
      hora_evento,
      lugar,
      id_programa,
    });
  } catch (err) {
    console.error('Error creando evento:', err);
    res.status(500).json({ error: err.message });
  }
});


// PUT /eventos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa = null } = req.body;

    if (!titulo || !fecha_evento || !hora_evento || !lugar) {
      return res.status(400).json({ error: 'Título, fecha, hora y lugar son obligatorios' });
    }

    const hoy = new Date().toISOString().split('T')[0];
    if (fecha_evento < hoy) {
      return res.status(400).json({ error: 'La fecha no puede estar en el pasado' });
    }

    const [result] = await pool.query(
      'UPDATE Evento SET titulo=?, descripcion=?, fecha_evento=?, hora_evento=?, lugar=?, id_programa=? WHERE id_evento=?',
      [titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ id_evento: Number(id), titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa });
  } catch (err) {
    console.error('Error actualizando evento:', err);
    res.status(500).json({ error: err.message });
  }
});


// DELETE /eventos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Evento WHERE id_evento=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/futuros (con filtro opcional por programa_id)
router.get('/futuros', async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa
      FROM Evento
      WHERE fecha_evento >= CURDATE()
    `;

    const params = [];

    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    query += ' ORDER BY fecha_evento ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos/futuros:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/pasados (con filtro opcional por programa_id)
router.get('/pasados', async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa
      FROM Evento
      WHERE fecha_evento < CURDATE()
    `;
    const params = [];

    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    query += ' ORDER BY fecha_evento DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos/pasados:', err);
    res.status(500).json({ error: err.message });
  }
});

// (Opcional) GET /eventos/futuros2 - mantiene compatibilidad si ya lo usas
router.get('/futuros2', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa
      FROM Evento
      WHERE fecha_evento >= CURDATE()
      ORDER BY fecha_evento ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo eventos futuros:', err);
    res.status(500).json({ error: 'Error obteniendo eventos futuros' });
  }
});


// GET /eventos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa, 
        creado_en
      FROM Evento 
      WHERE id_evento = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo evento:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos (con filtros opcionales: programa_id y search)
router.get('/', async (req, res) => {
  try {
    const { programa_id, search } = req.query;

    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa, 
        creado_en
      FROM Evento
      WHERE 1=1
    `;

    const params = [];

    // Filtro por programa
    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    // Búsqueda por título o lugar
    if (search) {
      query += ' AND (titulo LIKE ? OR lugar LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    // Ordenar por fecha + hora
    query += ' ORDER BY fecha_evento ASC, hora_evento ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /eventos/export { ids?: number[], format?: 'csv'|'xlsx'|'pdf', search?: string }
router.post('/export', async (req, res) => {
  try {
    const { ids = [], format = 'csv', search = '' } = req.body || {};

    // Construir query base similar a GET /eventos
    let query = `
      SELECT 
        id_evento,
        titulo,
        descripcion,
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar,
        id_programa,
        creado_en
      FROM Evento
      WHERE 1=1`;
    const params = [];

    if (Array.isArray(ids) && ids.length) {
      query += ` AND id_evento IN (?)`;
      params.push(ids);
    }

    if (search) {
      query += ' AND (titulo LIKE ? OR lugar LIKE ? OR descripcion LIKE ? )';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY fecha_evento ASC, hora_evento ASC';
    const [rows] = await pool.query(query, params);

    // Normalizar datos
    const data = rows.map(r => ({
      id_evento: r.id_evento,
      titulo: r.titulo || '',
      descripcion: r.descripcion || '',
      fecha_evento: r.fecha_evento || '',
      hora_evento: r.hora_evento || '',
      lugar: r.lugar || '',
      id_programa: r.id_programa ?? '',
      creado_en: (() => {
        const v = r.creado_en;
        try {
          if (!v) return '';
          if (typeof v === 'string') return v.replace('T', ' ').slice(0, 19);
          if (v instanceof Date) return v.toISOString().replace('T', ' ').slice(0, 19);
          const d = new Date(v);
          return isNaN(d) ? '' : d.toISOString().replace('T', ' ').slice(0, 19);
        } catch { return ''; }
      })()
    }));

    if (format === 'csv') {
      const cols = [
        { key: 'id_evento', title: 'ID' },
        { key: 'titulo', title: 'Título' },
        { key: 'descripcion', title: 'Descripción' },
        { key: 'fecha_evento', title: 'Fecha' },
        { key: 'hora_evento', title: 'Hora' },
        { key: 'lugar', title: 'Lugar' },
        { key: 'id_programa', title: 'Id Programa' },
        { key: 'creado_en', title: 'Creado En' },
      ];
      const lines = [cols.map(c => c.title).join(',')];
      if (data.length === 0) {
        lines.push(cols.map(() => '""').join(','));
      } else {
        for (const row of data) {
          const vals = cols.map(c => '"' + String(row[c.key] ?? '').replace(/"/g,'""') + '"');
          lines.push(vals.join(','));
        }
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="eventos_export_${Date.now()}.csv"`);
      return res.send(csv);
    }

    // Hooks para futuras implementaciones
    if (format === 'xlsx' || format === 'excel') {
      return res.status(501).json({ error: 'Export XLSX no implementado aún' });
    }
    if (format === 'pdf') {
      return res.status(501).json({ error: 'Export PDF no implementado aún' });
    }

    return res.status(400).json({ error: 'Formato no soportado' });
  } catch (err) {
    console.error('Error en /eventos/export:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

export default router;
