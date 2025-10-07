import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar roles
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_rol, nombre, permisos FROM rol');
    // Intentar parsear permisos JSON si existen
    const parsed = rows.map(r => ({
      ...r,
      permisos: (() => { try { return r.permisos ? JSON.parse(r.permisos) : null; } catch { return r.permisos; } })()
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

// Crear rol
router.post('/', requirePermission('admin:roles:manage'), async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
  const [result] = await db.query('INSERT INTO rol (nombre, permisos) VALUES (?, ?)', [nombre, typeof permisos === 'string' ? permisos : JSON.stringify(permisos ?? null)]);
    res.json({ success: true, id_rol: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// Editar rol
router.put('/:id', requirePermission('admin:roles:manage'), async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
  await db.query('UPDATE rol SET nombre=?, permisos=? WHERE id_rol=?', [nombre, typeof permisos === 'string' ? permisos : JSON.stringify(permisos ?? null), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar rol' });
  }
});

// Eliminar rol
router.delete('/:id', requirePermission('admin:roles:manage'), async (req, res) => {
  try {
  await db.query('DELETE FROM rol WHERE id_rol=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
});

export default router;
