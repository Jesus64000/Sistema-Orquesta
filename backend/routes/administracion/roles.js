import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar roles
router.get('/', requirePermission('roles:read'), async (req, res) => {
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
router.post('/', requirePermission('roles:create'), async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
    let permsObj = permisos;
    if (typeof permisos === 'string') {
      try { permsObj = JSON.parse(permisos); } catch { permsObj = null; }
    }
    // No gestionamos nivel desde roles; eliminar cualquier metadato $nivel si viene
    if (permsObj && typeof permsObj === 'object' && '$nivel' in permsObj) delete permsObj.$nivel;
    const [result] = await db.query('INSERT INTO rol (nombre, permisos) VALUES (?, ?)', [nombre, JSON.stringify(permsObj ?? null)]);
    res.json({ success: true, id_rol: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// Editar rol
router.put('/:id', requirePermission('roles:update'), async (req, res) => {
  const { nombre, permisos = null } = req.body;
  try {
    const [[row]] = await db.query('SELECT nombre FROM rol WHERE id_rol=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Rol no encontrado' });
    const currentIsAdmin = String(row.nombre || '').toLowerCase().includes('admin');
    if (currentIsAdmin) {
      return res.status(403).json({ error: 'El rol Administrador no puede ser editado' });
    }
    let permsObj = permisos;
    if (typeof permisos === 'string') {
      try { permsObj = JSON.parse(permisos); } catch { permsObj = null; }
    }
    // No gestionamos nivel desde roles; eliminar cualquier metadato $nivel si viene
    if (permsObj && typeof permsObj === 'object' && '$nivel' in permsObj) delete permsObj.$nivel;
    await db.query('UPDATE rol SET nombre=?, permisos=? WHERE id_rol=?', [nombre, JSON.stringify(permsObj ?? null), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar rol' });
  }
});

// Eliminar rol
router.delete('/:id', requirePermission('roles:delete'), async (req, res) => {
  try {
    const [[row]] = await db.query('SELECT nombre FROM rol WHERE id_rol=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Rol no encontrado' });
    const isAdmin = String(row.nombre || '').toLowerCase().includes('admin');
    if (isAdmin) return res.status(403).json({ error: 'El rol Administrador no puede eliminarse' });
    await db.query('DELETE FROM rol WHERE id_rol=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
});

export default router;
