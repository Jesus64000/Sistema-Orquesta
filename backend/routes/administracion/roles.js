import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar roles
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_rol, nombre, permisos FROM Rol');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

// Crear rol
router.post('/', async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
    const [result] = await db.query('INSERT INTO Rol (nombre, permisos) VALUES (?, ?)', [nombre, permisos]);
    res.json({ success: true, id_rol: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// Editar rol
router.put('/:id', async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
    await db.query('UPDATE Rol SET nombre=?, permisos=? WHERE id_rol=?', [nombre, permisos, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar rol' });
  }
});

// Eliminar rol
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Rol WHERE id_rol=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
});

export default router;
