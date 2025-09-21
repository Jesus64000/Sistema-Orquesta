import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar categorías
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Categoria');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear categoría
router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    await db.query('INSERT INTO Categoria (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Editar categoría
router.put('/:id', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    await db.query('UPDATE Categoria SET nombre=?, descripcion=? WHERE id_categoria=?', [nombre, descripcion, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar categoría' });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Categoria WHERE id_categoria=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

export default router;
