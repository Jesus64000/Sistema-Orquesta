import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import PermisosEditor from './PermisosEditor';

export default function RolEditModal({ open, initialData, onClose, onSave, saving = false }) {
  const [nombre, setNombre] = useState('');
  const [permisos, setPermisos] = useState({});
  const [error, setError] = useState('');

  const tokensToObject = (arr) => {
    if (!Array.isArray(arr)) return {};
    const obj = {};
    if (arr.includes('*')) {
      // acceso total: todos los recursos '*'
      // Establecemos por recurso ['*'] para que el editor muestre Acceso total
  const allResources = ['alumnos','eventos','instrumentos','programas','representantes','personal','dashboard','roles','usuarios','reportes']; // 'personalizacion' se oculta del editor
      for (const res of allResources) obj[res] = ['*'];
      return obj;
    }
    for (const t of arr) {
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
    return obj;
  };

  useEffect(() => {
    if (!open) return;
    const initNombre = initialData?.nombre || '';
    let initPerms = {};
    try {
      const raw = typeof initialData?.permisos === 'string' ? JSON.parse(initialData.permisos) : (initialData?.permisos ?? {});
      initPerms = Array.isArray(raw) ? tokensToObject(raw) : (raw || {});
    } catch { initPerms = initialData?.permisos || {}; }
    setNombre(initNombre);
    setPermisos(initPerms);
    setError('');
  }, [open, initialData]);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    try {
      // No persistimos $nivel en roles; el nivel es por usuario
      // Aseguramos que no viaje accidentalmente un $nivel si viene de datos previos
  const { $nivel: _NIVEL, ...permLimpios } = permisos || {};
      await onSave?.({ nombre: nombre.trim(), permisos: permLimpios });
    } catch (e) {
      setError(e?.message || 'Error al guardar');
    }
  };

  const isAdminRole = String(initialData?.nombre || '').toLowerCase() === 'admin' || String(initialData?.nombre || '').toLowerCase() === 'administrador';
  return (
    <Modal open={open} onClose={onClose} title={initialData?.id_rol ? 'Editar rol' : 'Nuevo rol'} size="xl">
      <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input
            name="nombre"
            value={nombre}
            onChange={(e)=>setNombre(e.target.value)}
            required
            className="card rounded px-3 py-2 w-full"
            disabled={isAdminRole}
          />
          {isAdminRole && (
            <p className="text-xs muted mt-1">El rol Administrador no puede ser editado.</p>
          )}
        </div>
        {/* El nivel de acceso ahora es por usuario, no por rol */}
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-2">Permisos por recurso</label>
          <PermisosEditor value={permisos} onChange={setPermisos} columns={2} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="px-3 py-2 rounded card-90" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="px-3 py-2 rounded bg-yellow-400 text-gray-900 font-medium disabled:opacity-50" disabled={saving || isAdminRole}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
