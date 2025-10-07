import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.email, u.id_rol, u.activo, u.creado_en, u.actualizado_en, r.nombre as rol_nombre
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
  const { nombre, email, id_rol, password } = req.body;
  try {
    await db.query('INSERT INTO usuario (nombre, email, password_hash, id_rol) VALUES (?, ?, ?, ?)', [nombre, email, password ?? '123456', id_rol]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Editar usuario
router.put('/:id', requirePermission('admin:usuarios:manage'), async (req, res) => {
  const { nombre, email, id_rol } = req.body;
  try {
    await db.query('UPDATE usuario SET nombre=?, email=?, id_rol=? WHERE id_usuario=?', [nombre, email, id_rol, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', requirePermission('admin:usuarios:manage'), async (req, res) => {
  try {
    await db.query('DELETE FROM usuario WHERE id_usuario=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
