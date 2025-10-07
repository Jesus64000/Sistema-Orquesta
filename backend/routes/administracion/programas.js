// backend/routes/administracion/programas.js
import { Router } from 'express';
import pool from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

const router = Router();

// GET /administracion/programas
router.get('/', async (_req, res) => {
  try {
  const [rows] = await pool.query('SELECT * FROM programa ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /administracion/programas
router.post('/', requirePermission('programas:write'), async (req, res) => {
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

// PUT /administracion/programas/:id
router.put('/:id', requirePermission('programas:write'), async (req, res) => {
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

// DELETE /administracion/programas/:id
router.delete('/:id', requirePermission('programas:write'), async (req, res) => {
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
