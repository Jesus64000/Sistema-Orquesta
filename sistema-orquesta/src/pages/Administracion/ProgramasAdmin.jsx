import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProgramasAdmin() {
  const [programas, setProgramas] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProgramas = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/programas");
      // Asegura que siempre sea un array
      setProgramas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar programas");
      setProgramas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/programas/${editId}`, form);
      } else {
        await axios.post("/programas", form);
      }
      setForm({ nombre: "", descripcion: "" });
      setEditId(null);
      fetchProgramas();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (p) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion || "" });
    setEditId(p.id_programa);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este programa?")) return;
    setLoading(true);
    try {
      await axios.delete(`/programas/${id}`);
      fetchProgramas();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Programas</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Descripción</label>
          <input name="descripcion" value={form.descripcion} onChange={handleChange} className="border rounded px-3 py-1 w-64" />
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "" }); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Descripción</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(programas) || programas.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay programas</td></tr>
            ) : (
              programas.map((p) => (
                <tr key={p.id_programa}>
                  <td className="px-4 py-2 border-b">{p.nombre}</td>
                  <td className="px-4 py-2 border-b">{p.descripcion}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(p)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(p.id_programa)} className="text-red-500 font-bold">Eliminar</button>
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
