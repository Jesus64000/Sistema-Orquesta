import React, { useEffect, useState } from "react";
import { getEstados, createEstado, updateEstado, deleteEstado } from "../../api/administracion/estados";

export default function EstadosAdmin() {
  const [estados, setEstados] = useState([]);
  const [form, setForm] = useState({ nombre: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEstados = async () => {
    setLoading(true);
    try {
      const res = await getEstados();
      setEstados(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar estados");
      setEstados([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateEstado(editId, form);
      } else {
        await createEstado(form);
      }
      setForm({ nombre: "" });
      setEditId(null);
      fetchEstados();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (e) => {
    setForm({ nombre: e.nombre });
    setEditId(e.id_estado);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este estado?")) return;
    setLoading(true);
    try {
  await deleteEstado(id);
      fetchEstados();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Estados de Instrumentos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "" }); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(estados) || estados.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-4 text-gray-500">No hay estados</td></tr>
            ) : (
              estados.map((e) => (
                <tr key={e.id_estado}>
                  <td className="px-4 py-2 border-b">{e.nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(e)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(e.id_estado)} className="text-red-500 font-bold">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
