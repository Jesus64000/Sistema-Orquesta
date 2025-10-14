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
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Rate limit específico para login: 5 intentos por 15 minutos por IP
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxAttempts: 5, keyGenerator: (req) => `${req.ip}:auth/login` });

// Utilidad: detectar si hash es bcrypt
function isBcryptHash(str = '') {
  return str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$');
}

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Email y contraseña requeridos' } });
  }
  try {
    let row;
    try {
      const [[r]] = await db.query(`SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.id_rol, u.activo, COALESCE(u.must_change_password,0) as must_change_password, u.nivel_acceso,
        r.nombre AS rol_nombre, r.permisos AS rol_permisos
        FROM usuario u LEFT JOIN rol r ON u.id_rol = r.id_rol WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
      row = r;
    } catch (e) {
      // Fallback si las columnas nuevo esquema no existen
      if (String(e?.code) === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(String(e?.message))) {
        const [[r]] = await db.query(`SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.id_rol,
          r.nombre AS rol_nombre, r.permisos AS rol_permisos
          FROM usuario u LEFT JOIN rol r ON u.id_rol = r.id_rol WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
        row = { ...r, activo: 1, must_change_password: 0, nivel_acceso: null };
      } else {
        throw e;
      }
    }
  if (!row) return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
  if (row.activo === 0) return res.status(403).json({ error: { code: 'USER_INACTIVE', message: 'Cuenta inactiva' } });

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
  let extras = {}; // columnas de extras pueden no existir aún
    const effectivePerms = mergeRoleAndUserExtras(rolPerms, extras);
    // Prioridad: columna usuario.nivel_acceso si existe y no null; luego $nivel de rol; finalmente heurística por nombre rol
    const nivelAcceso = (row.nivel_acceso !== undefined && row.nivel_acceso !== null)
      ? row.nivel_acceso
      : (typeof rolPerms?.$nivel === 'number'
        ? rolPerms.$nivel
        : ((row.rol_nombre || '').toLowerCase().includes('admin') ? 0 : 2));

    // Actualizar last_login (best effort, tolerante a ausencia de columna)
    try { await db.query('UPDATE usuario SET last_login=NOW() WHERE id_usuario=?', [row.id_usuario]); } catch { /* noop */ }

    const token = signToken({ id_usuario: row.id_usuario, rol: { nombre: row.rol_nombre } });
    // Reiniciar contador de rate limit si está disponible, ya que el intento fue exitoso
    try { req.rateLimit?.reset?.(); } catch {}
    return res.json({
      token,
      token_type: 'Bearer',
      expires_in_seconds: 24 * 3600,
      user: {
        id_usuario: row.id_usuario,
        nombre: row.nombre,
        email: row.email,
        rol: { id_rol: row.id_rol, nombre: row.rol_nombre },
        effectivePerms,
        nivel_acceso: nivelAcceso,
        must_change_password: row.must_change_password === 1
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
