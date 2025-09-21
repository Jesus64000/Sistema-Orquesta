import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar representantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM representantes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener representantes' });
  }
});

// Crear representante
router.post('/', async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
    await db.query('INSERT INTO representantes (nombre, telefono) VALUES (?, ?)', [nombre, telefono]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear representante' });
  }
});

// Editar representante
router.put('/:id', async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
    await db.query('UPDATE representantes SET nombre=?, telefono=? WHERE id_representante=?', [nombre, telefono, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar representante' });
  }
});

// Eliminar representante
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM representantes WHERE id_representante=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar representante' });
  }
});

export default router;
