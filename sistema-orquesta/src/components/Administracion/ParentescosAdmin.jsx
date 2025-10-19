import React, { useEffect, useState } from 'react';
import { listarParentescos, crearParentesco, actualizarParentesco, eliminarParentesco } from '../../api/administracion/parentescos';

export default function ParentescosAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({ nombre: '', activo: 1 });
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function cargar() {
    setLoading(true); setError(null);
    try {
      const data = await listarParentescos(busqueda);
      setItems(data);
    } catch (e) { setError(e.message || 'Error al cargar'); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []); // inicial

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!form.nombre.trim()) return;
      if (editId) {
        await actualizarParentesco(editId, form);
      } else {
        await crearParentesco(form);
      }
      setForm({ nombre: '', activo: 1 });
      setEditId(null);
      cargar();
    } catch (e) { setError(e.message || 'Error guardando'); }
  }

  function onEdit(item) {
    setEditId(item.id_parentesco);
    setForm({ nombre: item.nombre, activo: item.activo });
  }

  async function onDelete(id) {
    if (!window.confirm('¿Eliminar parentesco?')) return;
    try {
      await eliminarParentesco(id);
      cargar();
    } catch (e) { setError(e.message || 'No se pudo eliminar'); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Parentescos</h1>

      <div className="flex items-center gap-2">
        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded px-2 py-1 bg-app text-app"
        />
        <button onClick={cargar} className="px-3 py-1 rounded bg-app text-app border">Buscar</button>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded pill pill--active" onClick={() => { setEditId(null); setForm({ nombre: '', activo: 1 }); setModalOpen(true); }}>Nuevo parentesco</button>
      </div>

      {/* Modal para crear/editar */}
      {typeof window !== 'undefined' && (
        <Modal open={modalOpen} title={editId ? 'Editar parentesco' : 'Nuevo parentesco'} onClose={() => setModalOpen(false)}>
          <form onSubmit={(e) => { onSubmit(e); setModalOpen(false); }} className="space-y-2 p-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="border rounded px-2 py-1 w-72"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Activo</label>
              <input type="checkbox" checked={!!form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked ? 1 : 0 }))} />
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="px-3 py-1 rounded pill pill--active">Guardar</button>
              <button type="button" onClick={() => { setModalOpen(false); setEditId(null); setForm({ nombre: '', activo: 1 }); }} className="px-3 py-1 rounded border">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="table-head">
            <tr>
              <th className="px-2 py-1 border">ID</th>
              <th className="px-2 py-1 border text-left">Nombre</th>
              <th className="px-2 py-1 border">Activo</th>
              <th className="px-2 py-1 border">Creado</th>
              <th className="px-2 py-1 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="text-center p-4">Cargando...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan="5" className="text-center p-4 table-empty">Sin resultados</td></tr>}
            {items.map(it => (
              <tr key={it.id_parentesco} className="hover:bg-app">
                <td className="border px-2 py-1 text-center text-app">{it.id_parentesco}</td>
                <td className="border px-2 py-1 text-app">{it.nombre}</td>
                <td className="border px-2 py-1 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${it.activo ? 'card text-app' : 'card-90 muted'}`}>{it.activo ? 'Sí' : 'No'}</span>
                </td>
                <td className="border px-2 py-1 text-center text-app">{it.creado_en ? new Date(it.creado_en).toLocaleDateString() : ''}</td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button onClick={() => onEdit(it)} className="text-app hover:underline">Editar</button>
                  <button onClick={() => onDelete(it.id_parentesco)} className="text-app hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
