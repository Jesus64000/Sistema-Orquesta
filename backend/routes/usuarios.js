// backend/routes/usuarios.js
import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { requirePermission, requireAuth } from '../helpers/permissions.js';

const router = Router();

// Listar usuarios
router.get('/', requirePermission('usuarios:read'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
  SELECT u.id_usuario, u.nombre, u.email, u.id_rol, u.nivel_acceso, r.nombre as rol_nombre
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
router.put('/:id', requirePermission('usuarios:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, id_rol, nivel_acceso } = req.body;

    if (!nombre || !email || !id_rol) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    // Validar nivel_acceso si viene: debe ser 0,1,2
    let nivelValue = null;
    if (nivel_acceso !== undefined && nivel_acceso !== null && nivel_acceso !== '') {
      const n = Number(nivel_acceso);
      if (![0,1,2].includes(n)) {
        return res.status(400).json({ error: 'nivel_acceso inválido' });
      }
      nivelValue = n;
    }

    // Restricción: solo usuarios con nivel 0 pueden asignar nivel 0 a otros
    const editorNivel = req.user?.nivel_acceso;
    if (nivelValue === 0 && editorNivel !== 0) {
      return res.status(403).json({ error: 'No autorizado para asignar nivel 0' });
    }

    let result;
    try {
      if (nivelValue !== null) {
        [result] = await pool.query(
          'UPDATE usuario SET nombre = ?, email = ?, id_rol = ?, nivel_acceso = ? WHERE id_usuario = ?',
          [nombre, email, id_rol, nivelValue, id]
        );
      } else {
        [result] = await pool.query(
          'UPDATE usuario SET nombre = ?, email = ?, id_rol = ? WHERE id_usuario = ?',
          [nombre, email, id_rol, id]
        );
      }
    } catch (err) {
      // Si la columna nivel_acceso no existe aún, reintentar sin ella
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/.test(String(err?.message))) {
        [result] = await pool.query(
          'UPDATE usuario SET nombre = ?, email = ?, id_rol = ? WHERE id_usuario = ?',
          [nombre, email, id_rol, id]
        );
      } else {
        throw err;
      }
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ id, nombre, email, id_rol, nivel_acceso: nivelValue });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', requirePermission('usuarios:delete'), async (req, res) => {
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

// Actualizar perfil propio (nombre/email)
router.put('/me', requireAuth(), async (req, res) => {
  try {
    const id = req.user?.id;
    const { nombre, email } = req.body || {};
    if (!id) return res.status(401).json({ error: 'No autenticado' });
    if (!nombre || !email) return res.status(400).json({ error: 'Faltan campos' });
    await pool.query('UPDATE usuario SET nombre=?, email=? WHERE id_usuario=?', [nombre, email, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// Cambiar contraseña propia (requiere actual)
router.put('/me/password', requireAuth(), async (req, res) => {
  try {
    const id = req.user?.id;
    const { actual, nueva } = req.body || {};
    if (!id) return res.status(401).json({ error: 'No autenticado' });
    if (!actual || !nueva) return res.status(400).json({ error: 'Faltan campos' });
    const [[row]] = await pool.query('SELECT password_hash FROM usuario WHERE id_usuario=?', [id]);
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    const ok = row.password_hash?.startsWith('$2') ? await bcrypt.compare(actual, row.password_hash) : (actual === row.password_hash);
    if (!ok) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    const hash = await bcrypt.hash(String(nueva), 10);
    try {
      await pool.query('UPDATE usuario SET password_hash=?, must_change_password=0 WHERE id_usuario=?', [hash, id]);
    } catch (err) {
      // Si la columna must_change_password no existe, intenta sin ella
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/.test(String(err?.message))) {
        await pool.query('UPDATE usuario SET password_hash=? WHERE id_usuario=?', [hash, id]);
      } else {
        throw err;
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// Resetear contraseña (admin) -> genera temporal y activa must_change_password
router.post('/:id/reset-password', requirePermission('usuarios:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const providedRaw = req?.body?.temp;
    const provided = typeof providedRaw === 'string' ? providedRaw : undefined;
    let temp = provided;
    let autoGenerated = false;
    if (temp) {
      // Validación mínima de seguridad
      if (temp.length < 8) {
        return res.status(400).json({ error: 'La contraseña temporal debe tener al menos 8 caracteres' });
      }
      if (temp.length > 128) {
        return res.status(400).json({ error: 'La contraseña temporal es demasiado larga (máx. 128)' });
      }
    } else {
      temp = (Math.random().toString(36).slice(-8) + Date.now().toString().slice(-4)).slice(0,12);
      autoGenerated = true;
    }
    const hash = await bcrypt.hash(String(temp), 10);
    try {
      await pool.query('UPDATE usuario SET password_hash=?, must_change_password=1 WHERE id_usuario=?', [hash, id]);
    } catch (err) {
      // Si la columna must_change_password no existe, intenta sin ella
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/.test(String(err?.message))) {
        await pool.query('UPDATE usuario SET password_hash=? WHERE id_usuario=?', [hash, id]);
      } else {
        throw err;
      }
    }
    res.json({ ok: true, tempPassword: temp, autoGenerated });
  } catch (err) {
    res.status(500).json({ error: 'Error al resetear contraseña' });
  }
});

// Activar/Desactivar cuenta (admin)
router.put('/:id/activo', requirePermission('usuarios:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body || {};
    if (typeof activo !== 'number' && typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'activo debe ser 0/1' });
    }
    try {
      await pool.query('UPDATE usuario SET activo=? WHERE id_usuario=?', [activo ? 1 : 0, id]);
    } catch (err) {
      // Si la columna activo no existe, devolvemos ok para no romper en esquemas antiguos
      if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/.test(String(err?.message))) {
        return res.json({ ok: true, skipped: true });
      }
      throw err;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

export default router;