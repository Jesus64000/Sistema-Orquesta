// backend/routes/programas.js
import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requirePermission } from '../helpers/permissions.js';

const router = Router();

// GET /programas - lectura para cualquier usuario autenticado
router.get('/', requireAuth(), async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM programa ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /programas
router.post('/', requirePermission('programas:create'), async (req, res) => {
  try {
    const { nombre, descripcion = null } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });

    const [result] = await pool.query(
      'INSERT INTO programa (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    res.status(201).json({ id_programa: result.insertId, nombre, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /programas/:id
router.put('/:id', requirePermission('programas:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion = null } = req.body;

    const [result] = await pool.query(
      'UPDATE programa SET nombre = ?, descripcion = ? WHERE id_programa = ?',
      [nombre, descripcion, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    res.json({ id_programa: Number(id), nombre, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /programas/:id
router.delete('/:id', requirePermission('programas:delete'), async (req, res) => {
  try {
    const { id } = req.params;

  const [result] = await pool.query('DELETE FROM programa WHERE id_programa = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    res.json({ message: 'Programa eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;