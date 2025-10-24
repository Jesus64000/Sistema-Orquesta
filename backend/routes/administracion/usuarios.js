import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.email, u.id_rol, u.nivel_acceso, u.activo, u.creado_en, u.actualizado_en, r.nombre as rol_nombre
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario
router.post('/', requirePermission('usuarios:create'), async (req, res) => {
  const { nombre, email, id_rol, password, nivel_acceso } = req.body || {};
  try {
    if (!nombre || !email || !id_rol) return res.status(400).json({ error: 'Faltan campos requeridos' });
    // Validación de nivel: ahora es obligatorio (1 o 2). 0 reservado para Admin, no asignable aquí.
    const n = Number(nivel_acceso);
    if (![1,2].includes(n)) return res.status(400).json({ error: 'nivel_acceso inválido o ausente (debe ser 1 o 2)' });
    const pass = password ?? '123456';
    await db.query('INSERT INTO usuario (nombre, email, password_hash, id_rol, nivel_acceso) VALUES (?, ?, ?, ?, ?)', [nombre, email, pass, id_rol, n]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Editar usuario
router.put('/:id', requirePermission('usuarios:update'), async (req, res) => {
  const { nombre, email, id_rol, nivel_acceso } = req.body;
  try {
    // No permitir tocar nivel 0 vía esta ruta (admin fijo). Solo 1 ó 2.
    let setNivel = null;
    if (nivel_acceso !== undefined && nivel_acceso !== null && nivel_acceso !== '') {
      const n = Number(nivel_acceso);
      if (![1,2].includes(n)) {
        return res.status(400).json({ error: 'nivel_acceso inválido (solo 1 o 2)' });
      }
      // Verificar que el usuario destino no sea ya nivel 0 (para no cambiarlo)
      const [[target]] = await db.query('SELECT nivel_acceso FROM usuario WHERE id_usuario=?', [req.params.id]);
      if (target && target.nivel_acceso === 0) {
        return res.status(403).json({ error: 'No se puede modificar un admin (nivel 0)' });
      }
      setNivel = n;
    }
    if (setNivel !== null) {
      await db.query('UPDATE usuario SET nombre=?, email=?, id_rol=?, nivel_acceso=? WHERE id_usuario=?', [nombre, email, id_rol, setNivel, req.params.id]);
    } else {
      await db.query('UPDATE usuario SET nombre=?, email=?, id_rol=? WHERE id_usuario=?', [nombre, email, id_rol, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', requirePermission('usuarios:delete'), async (req, res) => {
  try {
    await db.query('DELETE FROM usuario WHERE id_usuario=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
