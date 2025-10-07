import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar representantes
router.get('/', async (req, res) => {
  try {
  const [rows] = await db.query('SELECT * FROM representante');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener representantes' });
  }
});

// Crear representante
router.post('/', requirePermission('representantes:write'), async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
  await db.query('INSERT INTO representante (nombre, telefono) VALUES (?, ?)', [nombre, telefono]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear representante' });
  }
});

// Editar representante
router.put('/:id', requirePermission('representantes:write'), async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
  await db.query('UPDATE representante SET nombre=?, telefono=? WHERE id_representante=?', [nombre, telefono, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar representante' });
  }
});

// Eliminar representante
router.delete('/:id', requirePermission('representantes:write'), async (req, res) => {
  try {
  await db.query('DELETE FROM representante WHERE id_representante=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar representante' });
  }
});

export default router;
