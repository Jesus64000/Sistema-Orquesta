import React, { useEffect, useState } from "react";
import { getInstrumentos, createInstrumento, updateInstrumento, deleteInstrumento } from "../../api/administracion/instrumentos";
import { getCategorias } from "../../api/administracion/categorias";
import { getEstados } from "../../api/administracion/estados";

export default function InstrumentosAdmin() {
  const [instrumentos, setInstrumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [form, setForm] = useState({ nombre: "", id_categoria: "", estado: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInstrumentos = async () => {
    setLoading(true);
    try {
      const res = await getInstrumentos();
      setInstrumentos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar instrumentos");
      setInstrumentos([]);
    }
    setLoading(false);
  };

  const fetchCategorias = async () => {
    try {
      const res = await getCategorias();
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategorias([]);
    }
  };

  const fetchEstados = async () => {
    try {
      const res = await getEstados();
      setEstados(Array.isArray(res.data) ? res.data : []);
    } catch {
      setEstados([]);
    }
  };

  useEffect(() => {
    fetchInstrumentos();
    fetchCategorias();
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
        await updateInstrumento(editId, form);
      } else {
        await createInstrumento(form);
      }
      setForm({ nombre: "", id_categoria: "", estado: "" });
      setEditId(null);
      fetchInstrumentos();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (i) => {
    setForm({ nombre: i.nombre, id_categoria: i.id_categoria, estado: i.estado });
    setEditId(i.id_instrumento);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este instrumento?")) return;
    setLoading(true);
    try {
  await deleteInstrumento(id);
      fetchInstrumentos();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Instrumentos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Categoría</label>
          <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required className="border rounded px-3 py-1 w-40">
            <option value="">Seleccione</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} required className="border rounded px-3 py-1 w-40">
            <option value="">Seleccione</option>
            {estados.map((e) => (
              <option key={e.id_estado} value={e.nombre}>{e.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "", categoria: "", estado: "" }); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Categoría</th>
              <th className="px-4 py-2 border-b text-left">Estado</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(instrumentos) || instrumentos.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No hay instrumentos</td></tr>
            ) : (
              instrumentos.map((i) => (
                <tr key={i.id_instrumento}>
                  <td className="px-4 py-2 border-b">{i.nombre}</td>
                  <td className="px-4 py-2 border-b">{i.categoria_nombre}</td>
                  <td className="px-4 py-2 border-b">{i.estado}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(i)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(i.id_instrumento)} className="text-red-500 font-bold">Eliminar</button>
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
