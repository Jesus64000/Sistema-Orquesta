import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import { getRoles, createRol, updateRol, deleteRol } from "../../api/administracion/roles";
import RolEditModal from "./RolEditModal";

export default function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // rol o null
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // Catálogo y labels locales (mantener alineado con PermisosEditor y backend)
  const catalog = useMemo(() => ({
    alumnos: ["read","create","update","delete","export"],
    eventos: ["read","create","update","delete","finalize","cancel"],
    instrumentos: ["read","create","update","delete"],
    programas: ["read","create","update","delete"],
    representantes: ["read","create","update","delete"],
    roles: ["read","create","update","delete"],
    usuarios: ["read","create","update","delete"],
    reportes: ["read"],
  }), []);

  const actionLabels = {
    read: 'Leer',
    create: 'Crear',
    update: 'Editar',
    delete: 'Desactivar/Eliminar',
    export: 'Exportar',
    finalize: 'Finalizar',
    cancel: 'Cancelar',
  };

  const normalizeActions = (actions) => {
    if (actions === '*' ) return ['*'];
    if (Array.isArray(actions)) return actions;
    if (actions == null) return [];
    if (typeof actions === 'object') return [];
    const s = String(actions).trim();
    if (!s) return [];
    return [s];
  };

  const inferPreset = (resource, actions = []) => {
    const arr = normalizeActions(actions);
    if (!arr || arr.length === 0) return 'none';
    if (arr.includes('*')) return 'all';
    const set = new Set(arr);
    const isReadOnly = set.size === 1 && set.has('read');
    if (isReadOnly) return 'read';
    const editSet = new Set(['read','create','update']);
    const onlyEdit = Array.from(set).every(a => editSet.has(a)) && set.size === editSet.size;
    if (onlyEdit) return 'edit';
    return 'custom';
  };

  const presetBadge = (preset) => {
    switch (preset) {
      case 'none': return <span className="px-2 py-0.5 text-[11px] rounded card-90 muted">Sin acceso</span>;
      case 'read': return <span className="px-2 py-0.5 text-[11px] rounded card-90 text-app">Solo lectura</span>;
      case 'edit': return <span className="px-2 py-0.5 text-[11px] rounded card-90 text-app">Editar</span>;
      case 'all': return <span className="px-2 py-0.5 text-[11px] rounded card-90 text-app">Acceso total</span>;
      default: return null;
    }
  };

  const renderPermissionsCell = (permisos) => {
    // Parse seguro (puede venir como string desde API)
    let p = permisos;
    if (typeof p === 'string') {
      try { p = JSON.parse(p || '{}'); } catch { p = {}; }
    }
    if (Array.isArray(p)) {
      if (p.includes('*')) {
        // Mostrar una sola etiqueta de acceso total
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium capitalize text-gray-700">todos:</span>
            {presetBadge('all')}
          </div>
        );
      }
      // convertir tokens a objeto por recurso
      const obj = {};
      if (!p.includes('*')) {
        for (const t of p) {
          const [res, actRaw] = String(t||'').toLowerCase().split(':');
          if (!res) continue;
          obj[res] = obj[res] || [];
          if (!actRaw) continue;
          if (actRaw === 'write') {
            for (const a of ['read','create','update']) {
              if (!obj[res].includes(a)) obj[res].push(a);
            }
          } else {
            if (!obj[res].includes(actRaw)) obj[res].push(actRaw);
          }
        }
      }
      p = obj;
    }
    p = p && typeof p === 'object' ? p : {};

  // Unir catálogo + claves reales presentes para mostrar también recursos desconocidos (ej. 'asistencia')
  const resources = Array.from(new Set([...Object.keys(catalog), ...Object.keys(p || {})]));
    const chips = [];
    for (const res of resources) {
      const acts = p[res] || [];
      const preset = inferPreset(res, acts);
        if (preset !== 'custom') {
        if (preset === 'none') continue; // no mostrar recursos sin acceso para compactar
        chips.push(
          <div key={res} className="flex items-center gap-2">
            <span className="text-xs font-medium capitalize muted">{res}:</span>
            {presetBadge(preset)}
          </div>
        );
      } else {
        // custom: listar acciones marcadas
        const items = normalizeActions(acts).filter(a => a !== '*').map(a => (
          <span key={a} className="px-1.5 py-0.5 text-[11px] rounded border card">{actionLabels[a] || a}</span>
        ));
        if (items.length === 0) continue;
        chips.push(
          <div key={res} className="flex items-center gap-2">
            <span className="text-xs font-medium capitalize text-gray-700">{res}:</span>
            <div className="flex flex-wrap gap-1.5">{items}</div>
          </div>
        );
      }
    }
  if (chips.length === 0) return <span className="text-xs muted">Sin permisos</span>;
    return <div className="grid gap-1.5" style={{gridTemplateColumns:'repeat(1, minmax(0, 1fr))'}}>{chips}</div>;
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar roles");
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenNew = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (r) => {
    if (String(r.nombre).toLowerCase() === 'admin' || String(r.nombre).toLowerCase() === 'administrador') {
      return; // no editable
    }
    setEditing(r); setModalOpen(true);
  };
  const handleClose = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async ({ nombre, permisos }) => {
    setSaving(true);
    try {
      if (editing?.id_rol) await updateRol(editing.id_rol, { nombre, permisos });
      else await createRol({ nombre, permisos });
      await fetchRoles();
      setModalOpen(false);
      setEditing(null);
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este rol?")) return;
    setLoading(true);
    try {
  await deleteRol(id);
      fetchRoles();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return (roles || []).filter(r => (r?.nombre || '').toLowerCase().includes(q));
  }, [roles, query]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Roles</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="border rounded px-3 py-1.5 text-sm w-56 bg-app text-app"
          />
          <Button type="button" variant="primary" onClick={handleOpenNew}>+ Nuevo rol</Button>
        </div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Permisos</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(filteredRoles) || filteredRoles.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 table-empty">No hay roles</td></tr>
            ) : (
              filteredRoles.map((r) => (
                <tr key={r.id_rol}>
                  <td className="px-4 py-2 border-b text-app">{r.nombre}</td>
                  <td className="px-4 py-2 border-b align-top text-app">
                    {renderPermissionsCell(r.permisos)}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleEdit(r)}
                      className={`font-semibold mr-2 ${ (String(r.nombre).toLowerCase()==='admin' || String(r.nombre).toLowerCase()==='administrador') ? 'muted cursor-not-allowed' : 'text-app hover:underline'}`}
                      disabled={String(r.nombre).toLowerCase()==='admin' || String(r.nombre).toLowerCase()==='administrador'}
                    >Editar</button>
                    <button
                      onClick={() => handleDelete(r.id_rol)}
                      className={`font-semibold ${ (String(r.nombre).toLowerCase()==='admin' || String(r.nombre).toLowerCase()==='administrador') ? 'muted cursor-not-allowed' : 'text-app hover:underline'}`}
                      disabled={String(r.nombre).toLowerCase()==='admin' || String(r.nombre).toLowerCase()==='administrador'}
                    >Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RolEditModal
        open={modalOpen}
        initialData={editing}
        onClose={handleClose}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
