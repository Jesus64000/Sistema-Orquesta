// Middleware requirePermiso (Fase 1 - sin auth real)
// Asume que req.user ya contiene: { rol: { permisos: JSON }, permisos_extra: JSON }
// En ausencia de auth se puede inyectar un usuario dev con rol Admin.

import { mergeRoleAndUserExtras, permissionsCatalog } from '../permissionsCatalog.js';
import db from '../db.js';

// Carga de usuario temporal (dev) si no hay auth implementada.
// Usa el primer usuario con rol Admin si existe; si no, construye uno virtual.
export async function loadUserDev(req, res, next) {
  if (req.user) return next();
  try {
    // Permitir override via query ?_devrole=consulta o cabecera X-Dev-Role
    const override = (req.query._devrole || req.headers['x-dev-role'] || '').toString().trim();
    const allowed = ['admin','coordinador','consulta'];

    let targetRoleName = 'Admin';
    if (override && allowed.includes(override.toLowerCase())) {
      // Normalizamos a Capitalizado según semillas esperadas
      if (override.toLowerCase() === 'admin') targetRoleName = 'Admin';
      else if (override.toLowerCase() === 'coordinador') targetRoleName = 'Coordinador';
      else if (override.toLowerCase() === 'consulta') targetRoleName = 'Consulta';
    }

    const [roles] = await db.query("SELECT id_rol, nombre, permisos FROM rol WHERE nombre=? LIMIT 1", [targetRoleName]);
    let selectedRole = roles[0];
    if (!selectedRole) {
      // Si no existe el rol (por ejemplo semillas no corridas) generamos uno virtual acorde
      if (targetRoleName === 'Admin') {
        selectedRole = { id_rol: 0, nombre: 'AdminVirtual', permisos: JSON.stringify(Object.keys(permissionsCatalog).reduce((acc,k)=>{acc[k] = ['*']; return acc;}, {})) };
      } else if (targetRoleName === 'Coordinador') {
        // Coordinador virtual: sin delete en algunos recursos, ejemplo
        const virtual = {
          alumnos: ['read','create','update','export'],
          eventos: ['read','create','update','finalize','cancel'],
          instrumentos: ['read','create','update'],
          programas: ['read','create','update'],
          representantes: ['read','create','update'],
          roles: ['read'],
          usuarios: ['read'],
          dashboard: ['read']
        };
        selectedRole = { id_rol: 0, nombre: 'CoordinadorVirtual', permisos: JSON.stringify(virtual) };
      } else if (targetRoleName === 'Consulta') {
        const virtual = Object.keys(permissionsCatalog).reduce((acc,k)=>{acc[k] = ['read']; return acc;}, {});
        selectedRole = { id_rol: 0, nombre: 'ConsultaVirtual', permisos: JSON.stringify(virtual) };
      }
    }

    const parsedPerms = JSON.parse(selectedRole.permisos || '{}');

    req.user = {
      id_usuario: 0,
      nombre: 'DevUser',
      rol: { id_rol: selectedRole.id_rol, nombre: selectedRole.nombre, permisos: parsedPerms },
      permisos_extra: {},
      permisos_denegados: {},
      effectivePerms: mergeRoleAndUserExtras(parsedPerms, {})
    };
    // Exponer cabecera para depuración opcional
    res.setHeader('X-Dev-Role-Active', selectedRole.nombre);
    next();
  } catch (e) {
    console.error('Error loadUserDev:', e.message);
    res.status(500).json({ error: { code: 'USER_LOAD_ERROR', message: 'No se pudo preparar usuario' } });
  }
}

export function requirePermiso(recurso, accion) {
  return function(req, res, next) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: { code: 'NO_AUTH', message: 'No autenticado' } });
      const perms = user.effectivePerms || mergeRoleAndUserExtras(user.rol?.permisos, user.permisos_extra);
      const acciones = perms[recurso] || [];
      if (!acciones.includes(accion)) {
        return res.status(403).json({ error: { code: 'PERMISO_DENEGADO', message: `Falta permiso ${recurso}.${accion}` } });
      }
      next();
    } catch (e) {
      console.error('Error requirePermiso:', e.message);
      return res.status(500).json({ error: { code: 'PERM_CHECK_ERROR', message: 'Error interno verificación permisos' } });
    }
  }
}

export default requirePermiso;
