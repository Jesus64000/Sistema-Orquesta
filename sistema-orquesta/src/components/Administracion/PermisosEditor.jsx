import React, { useMemo } from 'react';

// Catálogo local (mantener alineado con backend/permissionsCatalog.js)
const catalog = {
  alumnos: ["read","create","update","delete","export"],
  eventos: ["read","create","update","delete","finalize","cancel"],
  instrumentos: ["read","create","update","delete"],
  programas: ["read","create","update","delete"],
  representantes: ["read","create","update","delete"],
  roles: ["read","create","update","delete"],
  usuarios: ["read","create","update","delete"],
  reportes: ["read"],
};

const labels = {
  read: 'Leer',
  create: 'Crear',
  update: 'Editar',
  delete: 'Desactivar/Eliminar',
  export: 'Exportar',
  finalize: 'Finalizar',
  cancel: 'Cancelar',
};

function presetToActions(resource, preset) {
  const all = catalog[resource] || [];
  switch (preset) {
    case 'none': return [];
    case 'read': return ['read'];
    case 'edit': return all.filter(a => ['read','create','update'].includes(a));
    case 'all': return ['*'];
    default: return [];
  }
}

function inferPreset(resource, actions = []) {
  if (!actions || actions.length === 0) return 'none';
  if (actions.includes('*')) return 'all';
  const set = new Set(actions);
  const isReadOnly = set.size === 1 && set.has('read');
  if (isReadOnly) return 'read';
  const editSet = new Set(['read','create','update']);
  const onlyEdit = Array.from(set).every(a => editSet.has(a)) && editSet.size === set.size;
  if (onlyEdit) return 'edit';
  return 'custom';
}

export default function PermisosEditor({ value, onChange, columns = 1 }) {
  const adminResources = useMemo(() => ['roles','usuarios'], []);
  const allResources = useMemo(() => Object.keys(catalog), []);
  const generalResources = useMemo(() => allResources.filter(r => !adminResources.includes(r)), [allResources, adminResources]);

  const permisos = value && typeof value === 'object' ? value : {};

  const setPreset = (resource, preset) => {
    const next = { ...permisos };
    const acts = presetToActions(resource, preset);
    if (acts.length) next[resource] = acts; else delete next[resource];
    onChange?.(next);
  };

  const toggleAction = (resource, action) => {
    const current = permisos[resource] || [];
    if (current.includes('*')) return; // si es all, primero cambiar preset
    const set = new Set(current);
    if (set.has(action)) set.delete(action); else set.add(action);
    const arr = Array.from(set);
    const next = { ...permisos };
    if (arr.length) next[resource] = arr; else delete next[resource];
    onChange?.(next);
  };

  const gridClass = columns > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4';

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Permisos generales</div>
        <div className={gridClass}>
      {generalResources.map((res) => {
        const actions = permisos[res] || [];
        const preset = inferPreset(res, actions);
        return (
          <div key={res} className="border rounded-lg p-3">
            <div className="mb-2">
              <div className="font-medium capitalize mb-2">{res}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" className={`px-2 py-1 rounded ${preset==='none'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'none')}>Sin acceso</button>
                <button type="button" className={`px-2 py-1 rounded ${preset==='read'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'read')}>Solo lectura</button>
                <button type="button" className={`px-2 py-1 rounded ${preset==='edit'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'edit')}>Editar (sin desactivar)</button>
                <button type="button" className={`px-2 py-1 rounded ${preset==='all'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'all')}>Acceso total</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(catalog[res]||[]).map((a) => (
                <label key={a} className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${actions.includes('*') ? 'opacity-50' : ''}`}>
                  <input type="checkbox" disabled={actions.includes('*')} checked={actions.includes('*') || actions.includes(a)} onChange={() => toggleAction(res, a)} />
                  <span className="text-sm">{labels[a] || a}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Administración</div>
        <div className={gridClass}>
      {adminResources.map((res) => {
          const actions = permisos[res] || [];
          const preset = inferPreset(res, actions);
          return (
            <div key={res} className="border rounded-lg p-3">
              <div className="mb-2">
                <div className="font-medium capitalize mb-2">{res}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" className={`px-2 py-1 rounded ${preset==='none'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'none')}>Sin acceso</button>
                  <button type="button" className={`px-2 py-1 rounded ${preset==='read'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'read')}>Solo lectura</button>
                  <button type="button" className={`px-2 py-1 rounded ${preset==='edit'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'edit')}>Editar (sin desactivar)</button>
                  <button type="button" className={`px-2 py-1 rounded ${preset==='all'?'bg-gray-900 text-white':'bg-gray-100'}`} onClick={() => setPreset(res, 'all')}>Acceso total</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(catalog[res]||[]).map((a) => (
                  <label key={a} className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${actions.includes('*') ? 'opacity-50' : ''}`}>
                    <input type="checkbox" disabled={actions.includes('*')} checked={actions.includes('*') || actions.includes(a)} onChange={() => toggleAction(res, a)} />
                    <span className="text-sm">{labels[a] || a}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <p className="text-xs text-gray-500">Nota: "Acceso total" equivale a todas las acciones del recurso (comodín *).</p>
    </div>
  );
}
