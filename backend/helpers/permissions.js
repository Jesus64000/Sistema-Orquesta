// backend/helpers/permissions.js
// Utilidades de autorización con soporte para 2 modelos:
// 1) Array de tokens: ['alumnos:read', 'usuarios:*', '*']
// 2) Objeto por recurso: { alumnos: ['read','update'], usuarios: ['*'] }

function normalizePerm(p) {
  return String(p || '').trim().toLowerCase();
}

function flattenObjectPerms(obj) {
  // Convierte { res: ['read','*'] } a tokens ['res:read','res:*']
  const tokens = [];
  if (!obj || typeof obj !== 'object') return tokens;
  for (const [res, acts] of Object.entries(obj)) {
    if (!Array.isArray(acts)) continue;
    for (const a of acts) {
      tokens.push(`${res}:${String(a).toLowerCase()}`);
    }
  }
  return tokens;
}

function extractTokens(user) {
  const raw = user?.permisos;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizePerm);
  if (typeof raw === 'object') return flattenObjectPerms(raw).map(normalizePerm);
  if (typeof raw === 'string') return [normalizePerm(raw)];
  return [];
}

export function hasPermission(user, required) {
  if (!user) return false;
  const requiredNorm = normalizePerm(required);
  const perms = extractTokens(user);
  if (perms.includes('*')) return true; // comodín global
  if (perms.includes(requiredNorm)) return true;
  // soporte comodín por sección: ej. 'alumnos:*'
  const [section] = requiredNorm.split(':');
  if (perms.includes(section + ':*')) return true;
  // compat: 'seccion:write' concede 'seccion:read' y 'seccion:create' y 'seccion:update'
  const [, action] = requiredNorm.split(':');
  if (perms.includes(section + ':write') && ['read','create','update'].includes(action)) return true;
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

// Requiere que el usuario esté autenticado (req.user presente)
export function requireAuth() {
  return function (req, res, next) {
    if (req.user) return next();
    return res.status(401).json({ error: 'No autenticado' });
  };
}
