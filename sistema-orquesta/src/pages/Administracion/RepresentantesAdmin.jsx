import React, { useEffect, useState } from "react";
import { getRepresentantes, createRepresentante, updateRepresentante, deleteRepresentante } from "../../api/administracion/representantes";

export default function RepresentantesAdmin() {
  const [representantes, setRepresentantes] = useState([]);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepresentantes = async () => {
    setLoading(true);
    try {
      const res = await getRepresentantes();
      setRepresentantes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar representantes");
      setRepresentantes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRepresentantes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateRepresentante(editId, form);
      } else {
        await createRepresentante(form);
      }
      setForm({ nombre: "", telefono: "" });
      setEditId(null);
      fetchRepresentantes();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (r) => {
    setForm({ nombre: r.nombre, telefono: r.telefono });
    setEditId(r.id_representante);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este representante?")) return;
    setLoading(true);
    try {
  await deleteRepresentante(id);
      fetchRepresentantes();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Representantes</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} className="border rounded px-3 py-1 w-40" />
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "", telefono: "" }); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Teléfono</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(representantes) || representantes.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay representantes</td></tr>
            ) : (
              representantes.map((r) => (
                <tr key={r.id_representante}>
                  <td className="px-4 py-2 border-b">{r.nombre}</td>
                  <td className="px-4 py-2 border-b">{r.telefono}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(r)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(r.id_representante)} className="text-red-500 font-bold">Eliminar</button>
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
