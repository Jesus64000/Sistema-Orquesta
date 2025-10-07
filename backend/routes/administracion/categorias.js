import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar categorías
router.get('/', async (req, res) => {
  try {
  const [rows] = await db.query('SELECT * FROM categoria');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear categoría
router.post('/', requirePermission('instrumentos:write'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
  await db.query('INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Editar categoría
router.put('/:id', requirePermission('instrumentos:write'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
  await db.query('UPDATE categoria SET nombre=?, descripcion=? WHERE id_categoria=?', [nombre, descripcion, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar categoría' });
  }
});

// Eliminar categoría
router.delete('/:id', requirePermission('instrumentos:write'), async (req, res) => {
  try {
  await db.query('DELETE FROM categoria WHERE id_categoria=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

export default router;
