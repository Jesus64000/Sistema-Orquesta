// backend/helpers/permissions.js
// Utilidades simples de autorización basadas en permisos por rol
// Sin autenticación real: depende de req.user (inyectado por middleware en index.js)

function normalizePerm(p) {
  return String(p || '').trim().toLowerCase();
}

export function hasPermission(user, required) {
  if (!user) return false;
  const requiredNorm = normalizePerm(required);
  const perms = Array.isArray(user.permisos) ? user.permisos.map(normalizePerm) : [];
  if (perms.includes('*')) return true;
  if (perms.includes(requiredNorm)) return true;
  // soporte comodín por sección: ej. 'alumnos:*'
  const [section] = requiredNorm.split(':');
  if (perms.includes(section + ':*')) return true;
  return false;
}

export function requirePermission(required) {
  return function (req, res, next) {
    if (hasPermission(req.user, required)) return next();
    return res.status(403).json({ error: 'Permiso denegado', required });
  };
}

export function requireRole(roles) {
  const required = Array.isArray(roles) ? roles.map(r => r.toLowerCase()) : [String(roles).toLowerCase()];
  return function (req, res, next) {
    const rol = (req.user?.rol || '').toLowerCase();
    if (required.includes(rol)) return next();
    return res.status(403).json({ error: 'Rol no autorizado', required, rol });
  };
}
