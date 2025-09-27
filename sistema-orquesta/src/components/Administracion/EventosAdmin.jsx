import React, { useEffect, useState } from "react";
import { getEventos, createEvento, updateEvento, deleteEvento } from "../../api/administracion/eventos";
import { getInstrumentos } from "../../api/administracion/instrumentos";
import { getProgramas } from "../../api/administracion/programas";
import Button from "../ui/Button";

export default function EventosAdmin() {
  const [eventos, setEventos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [form, setForm] = useState({ nombre: "", fecha: "", programa: "", instrumento: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await getEventos();
      setEventos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar eventos");
      setEventos([]);
    }
    setLoading(false);
  };

  const fetchProgramas = async () => {
    try {
      const res = await getProgramas();
      setProgramas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProgramas([]);
    }
  };

  const fetchInstrumentos = async () => {
    try {
      const res = await getInstrumentos();
      setInstrumentos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setInstrumentos([]);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchProgramas();
    fetchInstrumentos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.fecha) {
      setError("La fecha es obligatoria.");
      return;
    }
    // Evitar duplicados
    const existe = eventos.some(ev => ev.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase() && ev.id_evento !== editId);
    if (existe) {
      setError("Ya existe un evento con ese nombre.");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateEvento(editId, form);
        setSuccess("Evento actualizado correctamente.");
      } else {
        await createEvento(form);
        setSuccess("Evento creado correctamente.");
      }
      setForm({ nombre: "", fecha: "", programa: "", instrumento: "" });
      setEditId(null);
      fetchEventos();
    } catch (err) {
      setError("Error al guardar: " + (err?.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleEdit = (e) => {
    setForm({ nombre: e.nombre, fecha: e.fecha, programa: e.programa, instrumento: e.instrumento });
    setEditId(e.id_evento);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    setLoading(true);
    try {
  await deleteEvento(id);
      fetchEventos();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Eventos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Fecha</label>
          <input name="fecha" value={form.fecha} onChange={handleChange} required className="border rounded px-3 py-1 w-40" type="date" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Programa</label>
          <select name="programa" value={form.programa} onChange={handleChange} className="border rounded px-3 py-1 w-40">
            <option value="">Seleccione</option>
            {programas.map((p) => (
              <option key={p.id_programa} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Instrumento</label>
          <select name="instrumento" value={form.instrumento} onChange={handleChange} className="border rounded px-3 py-1 w-40">
            <option value="">Seleccione</option>
            {instrumentos.map((i) => (
              <option key={i.id_instrumento} value={i.nombre}>{i.nombre}</option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="primary" loading={loading}>
          {editId ? "Actualizar" : "Agregar"}
        </Button>
        {editId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setEditId(null); setForm({ nombre: "", fecha: "", programa: "", instrumento: "" }); setError(""); setSuccess(""); }}
          >Cancelar</Button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Fecha</th>
              <th className="px-4 py-2 border-b text-left">Programa</th>
              <th className="px-4 py-2 border-b text-left">Instrumento</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(eventos) || eventos.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">No hay eventos</td></tr>
            ) : (
              eventos.map((e) => (
                <tr key={e.id_evento}>
                  <td className="px-4 py-2 border-b">{e.nombre}</td>
                  <td className="px-4 py-2 border-b">{e.fecha}</td>
                  <td className="px-4 py-2 border-b">{e.programa}</td>
                  <td className="px-4 py-2 border-b">{e.instrumento}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(e)} className="text-yellow-600 font-semibold hover:underline mr-2">Editar</button>
                    <button onClick={() => handleDelete(e.id_evento)} className="text-red-600 font-semibold hover:underline">Eliminar</button>
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
