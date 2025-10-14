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
  reportes: ["read"],
};

function tokensArrayToObject(permsArr) {
  // Convierte ['alumnos:read','usuarios:*','*'] a objeto por recurso
  const obj = {};
  if (!Array.isArray(permsArr)) return obj;
  const tokens = permsArr.map(p => String(p || '').toLowerCase());
  if (tokens.includes('*')) {
    // Acceso total: todos los recursos '*'
    for (const res of Object.keys(permissionsCatalog)) obj[res] = ['*'];
    return obj;
  }
  for (const t of tokens) {
    const [res, act] = t.split(':');
    if (!res) continue;
    if (!obj[res]) obj[res] = [];
    if (act) {
      if (!obj[res].includes(act)) obj[res].push(act);
    }
  }
  return obj;
}

// Expande un recurso que tenga '*' a todas las acciones del catálogo.
export function expandWildcardPermissions(perms) {
  // Acepta tanto objeto como array de tokens
  if (Array.isArray(perms)) perms = tokensArrayToObject(perms);
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
