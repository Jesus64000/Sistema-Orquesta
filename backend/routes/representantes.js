import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /representantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Representante ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /representantes:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /representantes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query('SELECT * FROM Representante WHERE id_representante = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Representante no encontrado' });
    res.json(row);
  } catch (err) {
    console.error('Error en GET /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /representantes
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;
    if (!nombre || !telefono || !email) {
      return res.status(400).json({ error: 'nombre, telefono y email son requeridos' });
    }
    const [result] = await pool.query(
      'INSERT INTO Representante (nombre, telefono, email) VALUES (?, ?, ?)',
      [nombre, telefono, email]
    );
    res.status(201).json({ id_representante: result.insertId, nombre, telefono, email });
  } catch (err) {
    console.error('Error en POST /representantes:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /representantes/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    const [result] = await pool.query(
      'UPDATE Representante SET nombre = ?, telefono = ?, email = ? WHERE id_representante = ?',
      [nombre, telefono, email, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Representante no encontrado' });
    }
    res.json({ id_representante: Number(id), nombre, telefono, email });
  } catch (err) {
    console.error('Error en PUT /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /representantes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Representante WHERE id_representante = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Representante no encontrado' });
    }
    res.json({ message: 'Representante eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;