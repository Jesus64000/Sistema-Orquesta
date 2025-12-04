import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { http } from '../../api/http';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';

export default function CargosAdmin() {
  const { tienePermiso } = useAuth();
  const canWrite = tienePermiso('personal','update');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [nombre, setNombre] = useState('');

  // Confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true); setError('');
      const res = await http.get(`/administracion/cargos${q?`?q=${encodeURIComponent(q)}`:''}`);
      const data = res?.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setError(String(e.message||e)); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[q]);

  const openCreate = () => {
    setEditingItem(null);
    setNombre('');
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setEditingItem(it);
    setNombre(it.nombre);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) return;
    try {
      if (editingItem) {
        await http.put(`/administracion/cargos/${editingItem.id_cargo}`, { nombre: nombre.trim() });
      } else {
        await http.post('/administracion/cargos', { nombre: nombre.trim(), activo: 1 });
      }
      setModalOpen(false);
      load();
    } catch (e) { alert(e.message); }
  };

  const openDelete = (it) => {
    setItemToDelete(it);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await http.delete(`/administracion/cargos/${itemToDelete.id_cargo}`);
      setConfirmOpen(false);
      load();
    } catch (e) { alert(e.message); }
  };

  const toggleActivo = async (it) => {
    try {
      await http.put(`/administracion/cargos/${it.id_cargo}`, { activo: it.activo ? 0 : 1 });
      load();
    } catch (e) { alert(e.message); }
  };

  const filtered = useMemo(()=> items, [items]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Cargos</h2>
        <div className="flex gap-2">
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Buscar..." 
            className="h-9 px-3 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
          />
          {canWrite && (
            <Button variant="primary" onClick={openCreate}>+ Nuevo Cargo</Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Activo</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-4 table-empty text-center" colSpan="3">Cargando...</td></tr>
            ) : error ? (
              <tr><td className="px-4 py-4 text-red-600" colSpan="3">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6 text-center table-empty" colSpan="3">Sin cargos</td></tr>
            ) : filtered.map(it => (
              <tr key={it.id_cargo}>
                <td className="px-4 py-2 border-b text-app">{it.nombre}</td>
                <td className="px-4 py-2 border-b">
                  <button onClick={()=> canWrite && toggleActivo(it)} className={`px-2 py-1 rounded-full text-xs border ${it.activo? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{it.activo? 'Sí' : 'No'}</button>
                </td>
                <td className="px-4 py-2 border-b">
                  {canWrite && (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={()=>openEdit(it)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={()=>openDelete(it)}>Eliminar</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Editar Cargo" : "Nuevo Cargo"}
        size="md"
      >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="Nombre del cargo"
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} disabled={!nombre.trim()}>Guardar</Button>
            </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar Cargo"
        message={`¿Estás seguro de que deseas eliminar el cargo "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Eliminar"
        confirmVariant="danger"
      />
    </div>
  );
}
