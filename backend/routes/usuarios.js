// backend/routes/usuarios.js
import { Router } from 'express';
import pool from '../db.js';
import { requirePermission } from '../helpers/permissions.js';

const router = Router();

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
  SELECT u.id_usuario, u.nombre, u.email, u.id_rol, r.nombre as rol_nombre
  FROM usuario u
  LEFT JOIN rol r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario
router.post('/', requirePermission('admin:usuarios:manage'), async (req, res) => {
  try {
  const { nombre, email, password, id_rol } = req.body;
    if (!nombre || !email || !password || !id_rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // TODO: Hashear password antes de guardar (bcrypt)
    const [result] = await pool.query(
  'INSERT INTO usuario (nombre, email, password_hash, id_rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, id_rol]
    );

    res.status(201).json({ id_usuario: result.insertId, nombre, email, id_rol });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario
router.put('/:id', requirePermission('admin:usuarios:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, id_rol } = req.body;

    const [result] = await pool.query(
  'UPDATE usuario SET nombre = ?, email = ?, id_rol = ? WHERE id_usuario = ?',
      [nombre, email, id_rol, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ id, nombre, email, id_rol });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', requirePermission('admin:usuarios:manage'), async (req, res) => {
  try {
    const { id } = req.params;

  const [result] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;