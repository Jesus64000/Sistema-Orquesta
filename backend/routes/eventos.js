// backend/routes/eventos.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /eventos
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Evento ORDER BY fecha_evento ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /eventos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_evento, lugar, id_programa = null } = req.body;

    const [result] = await pool.query(
      'UPDATE Evento SET titulo=?, descripcion=?, fecha_evento=?, lugar=?, id_programa=? WHERE id_evento=?',
      [titulo, descripcion, fecha_evento, lugar, id_programa, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ id_evento: Number(id), titulo, descripcion, fecha_evento, lugar, id_programa });
  } catch (err) {
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
      SELECT id_evento, titulo, descripcion, fecha_evento, lugar, id_programa
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

// (Opcional) GET /eventos/futuros2 - mantiene compatibilidad si ya lo usas
router.get('/futuros2', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_evento, titulo, descripcion, fecha_evento, lugar, id_programa
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

export default router;
