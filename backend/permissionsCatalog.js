// Catálogo centralizado de recursos y acciones (Fase 1)
// Nota: acciones especiales futuras (assign, unassign, generate) se agregarán cuando se implementen.

export const permissionsCatalog = {
  alumnos: ["read","create","update","delete","export"],
  eventos: ["read","create","update","delete","finalize","cancel"],
  instrumentos: ["read","create","update","delete"],
  programas: ["read","create","update","delete"],
  representantes: ["read","create","update","delete"],
  roles: ["read","create","update","delete"],
  usuarios: ["read","create","update","delete"],
  dashboard: ["read"],
};

// Expande un recurso que tenga '*' a todas las acciones del catálogo.
export function expandWildcardPermissions(perms) {
  const result = {};
  for (const [resource, actions] of Object.entries(perms || {})) {
    if (!Array.isArray(actions)) continue;
    if (actions.includes('*')) {
      result[resource] = [...permissionsCatalog[resource]];
    } else {
      // Filtra acciones desconocidas para mantener limpieza
      const valid = (permissionsCatalog[resource] || []).filter(a => actions.includes(a));
      result[resource] = [...new Set(valid)];
    }
  }
  return result;
}

export function mergeRoleAndUserExtras(rolePerms, userExtras) {
  const expandedRole = expandWildcardPermissions(rolePerms);
  const expandedExtras = expandWildcardPermissions(userExtras);
  const merged = {};
  const allResources = new Set([...Object.keys(expandedRole), ...Object.keys(expandedExtras)]);
  for (const r of allResources) {
    const set = new Set([...(expandedRole[r]||[]), ...(expandedExtras[r]||[])]);
    if (set.size) merged[r] = Array.from(set);
  }
  return merged;
}

export default permissionsCatalog;
