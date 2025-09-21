import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  const { nombre, email, id_rol } = req.body;
  try {
    await db.query('INSERT INTO usuarios (nombre, email, id_rol) VALUES (?, ?, ?)', [nombre, email, id_rol]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Editar usuario
router.put('/:id', async (req, res) => {
  const { nombre, email, id_rol } = req.body;
  try {
    await db.query('UPDATE usuarios SET nombre=?, email=?, id_rol=? WHERE id_usuario=?', [nombre, email, id_rol, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM usuarios WHERE id_usuario=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
