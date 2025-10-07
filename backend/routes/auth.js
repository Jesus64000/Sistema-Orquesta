// routes/auth.js
// Rutas de autenticación básica
// POST /auth/login  -> { email, password }
// GET  /auth/me     -> datos usuario + permisos efectivos
// (Password temporal en texto plano hasta que se active bcrypt)

import { Router } from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { mergeRoleAndUserExtras } from '../permissionsCatalog.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// Utilidad: detectar si hash es bcrypt
function isBcryptHash(str = '') {
  return str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$');
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Email y contraseña requeridos' } });
  }
  try {
    const [[row]] = await db.query(`SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.id_rol, u.permisos_extra, u.permisos_denegados,
      r.nombre AS rol_nombre, r.permisos AS rol_permisos
      FROM Usuario u LEFT JOIN Rol r ON u.id_rol = r.id_rol WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
    if (!row) return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });

    let passwordOk = false;
    if (row.password_hash) {
      if (isBcryptHash(row.password_hash)) {
        passwordOk = await bcrypt.compare(password, row.password_hash);
      } else {
        // Texto plano temporal (fase transición)
        passwordOk = password === row.password_hash;
        if (passwordOk) {
          // Rehash transparente a bcrypt
          try {
            const newHash = await bcrypt.hash(password, 10);
            await db.query('UPDATE Usuario SET password_hash=? WHERE id_usuario=?', [newHash, row.id_usuario]);
          } catch (e) { /* noop */ }
        }
      }
    }
    if (!passwordOk) return res.status(401).json({ error: { code: 'INVALID_PASSWORD', message: 'Contraseña incorrecta' } });

    // Preparar permisos efectivos
    let rolPerms = {}; try { rolPerms = JSON.parse(row.rol_permisos || '{}'); } catch {}
    let extras = {}; try { extras = JSON.parse(row.permisos_extra || '{}'); } catch {}
    const effectivePerms = mergeRoleAndUserExtras(rolPerms, extras);

    // Actualizar last_login (best effort)
    try { await db.query('UPDATE Usuario SET last_login=NOW() WHERE id_usuario=?', [row.id_usuario]); } catch {}

    const token = signToken({ id_usuario: row.id_usuario, rol: { nombre: row.rol_nombre } });
    return res.json({
      token,
      token_type: 'Bearer',
      expires_in_seconds: 24 * 3600,
      user: {
        id_usuario: row.id_usuario,
        nombre: row.nombre,
        email: row.email,
        rol: { id_rol: row.id_rol, nombre: row.rol_nombre },
        effectivePerms
      }
    });
  } catch (e) {
    console.error('Error login:', e);
    return res.status(500).json({ error: { code: 'LOGIN_ERROR', message: 'Error interno de autenticación' } });
  }
});

// GET /auth/me (requiere token válido). El user se carga en middleware authOptional (index lo aplicará antes de rutas protegidas en futura integración) 
router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: { code: 'NO_AUTH', message: 'Token requerido' } });
  res.json({ user: req.user });
});

export default router;
