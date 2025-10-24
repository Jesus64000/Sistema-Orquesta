// middleware/auth.js
// Autenticación JWT básica (Fase inicial)
// - Si hay Authorization: Bearer <token> se valida y se carga req.user
// - Si no hay token, no rompe (permitirá fallback dev con loadUserDev)
// - Expiración configurada a 24h (controlada al firmar el token)

import jwt from 'jsonwebtoken';
import db from '../db.js';
import { mergeRoleAndUserExtras } from '../permissionsCatalog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export function signToken(usuario) {
  const payload = {
    sub: usuario.id_usuario,
    rol: usuario.rol?.nombre || null,
    v: 1,
  };
  // 24h => '24h'
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function authOptional(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return next();
  const token = auth.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Cargar usuario + rol
    const [[userRow]] = await db.query(`SELECT u.id_usuario, u.nombre, u.email, u.id_rol, u.nivel_acceso, r.nombre AS rol_nombre, r.permisos AS rol_permisos
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?`, [decoded.sub]);
    if (!userRow) return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });

  let rolPerms = {};
    try { rolPerms = JSON.parse(userRow.rol_permisos || '{}'); } catch {}
  let extras = {};

    const effectivePerms = mergeRoleAndUserExtras(rolPerms, extras);
    // Nivel de acceso ahora se define exclusivamente por usuario (no por rol)
    const nivelAcceso = (userRow.nivel_acceso !== undefined && userRow.nivel_acceso !== null)
      ? userRow.nivel_acceso
      : 2; // por defecto, sin acceso a Administración
    // Limpiar metadatos del objeto de permisos efectivo si se coló
    if (effectivePerms && typeof effectivePerms === 'object') {
      delete effectivePerms['$nivel'];
    }
    req.user = {
      id_usuario: userRow.id_usuario,
      nombre: userRow.nombre,
      email: userRow.email,
      rol: { id_rol: userRow.id_rol, nombre: userRow.rol_nombre, permisos: rolPerms },
      permisos_extra: extras,
      permisos_denegados: userRow.permisos_denegados ? JSON.parse(userRow.permisos_denegados) : {},
      effectivePerms,
      nivel_acceso: nivelAcceso,
      // Exponer permisos para middlewares de autorización (acepta objeto)
      permisos: effectivePerms
    };
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token expirado' } });
    }
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Token inválido' } });
  }
}

export default authOptional;
