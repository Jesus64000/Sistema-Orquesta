import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar estados
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM estados');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estados' });
  }
});

// Crear estado
router.post('/', requirePermission('instrumentos:write'), async (req, res) => {
  const { nombre } = req.body;
  try {
    await db.query('INSERT INTO estados (nombre) VALUES (?)', [nombre]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear estado' });
  }
});

// Editar estado
router.put('/:id', requirePermission('instrumentos:write'), async (req, res) => {
  const { nombre } = req.body;
  try {
    await db.query('UPDATE estados SET nombre=? WHERE id_estado=?', [nombre, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar estado' });
  }
});

// Eliminar estado
router.delete('/:id', requirePermission('instrumentos:write'), async (req, res) => {
  try {
    await db.query('DELETE FROM estados WHERE id_estado=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar estado' });
  }
});

export default router;
