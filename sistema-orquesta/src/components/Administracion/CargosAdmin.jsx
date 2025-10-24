import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { http } from '../../api/http';

export default function CargosAdmin() {
  const { tienePermiso } = useAuth();
  const canWrite = tienePermiso('personal','update');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [q, setQ] = useState('');

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

  const onCreate = async () => {
    if (!nombre.trim()) return;
    try {
      await http.post('/administracion/cargos', { nombre: nombre.trim(), activo: 1 });
      setNombre(''); load();
    } catch (e) { alert(e.message); }
  };

  const toggleActivo = async (it) => {
    try {
      await http.put(`/administracion/cargos/${it.id_cargo}`, { activo: it.activo ? 0 : 1 });
      load();
    } catch (e) { alert(e.message); }
  };

  const onRename = async (it) => {
    const nuevo = prompt('Nuevo nombre para el cargo', it.nombre);
    if (!nuevo || !nuevo.trim()) return;
    try {
      await http.put(`/administracion/cargos/${it.id_cargo}`, { nombre: nuevo.trim() });
      load();
    } catch (e) { alert(e.message); }
  };

  const onDelete = async (it) => {
    if (!confirm(`Eliminar cargo "${it.nombre}"?`)) return;
    try {
      await http.delete(`/administracion/cargos/${it.id_cargo}`);
      load();
    } catch (e) { alert(e.message); }
  };

  const filtered = useMemo(()=> items, [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cargos</h2>
        <div className="flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." className="h-10 px-3 rounded-full card border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
      </div>

      {canWrite && (
        <div className="flex items-center gap-2">
          <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre del cargo" className="h-10 px-3 rounded-full card border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <Button onClick={onCreate} disabled={!nombre.trim()} >Agregar</Button>
        </div>
      )}

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
                    <>
                      <button onClick={()=>onRename(it)} className="text-yellow-600 font-semibold hover:underline mr-2 text-xs">Renombrar</button>
                      <button onClick={()=>onDelete(it)} className="text-red-600 font-semibold hover:underline text-xs">Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
