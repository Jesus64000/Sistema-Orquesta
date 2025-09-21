
import React, { useEffect, useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { getEstados, createEstado, updateEstado, deleteEstado } from "../../api/administracion/estados";

export default function EstadosAdmin() {
  const [estados, setEstados] = useState([]);
  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil((estados?.length || 0) / rowsPerPage) || 1;
  const paginatedEstados = estados.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const [form, setForm] = useState({ nombre: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // ConfirmDialog state
  const [confirm, setConfirm] = useState({ open: false, id: null, nombre: "" });

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

  useEffect(() => {
    setPage(1); // Reiniciar página al cambiar datos
  }, [estados, rowsPerPage]);

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
    // Evitar duplicados
    const existe = estados.some(est => est.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase() && est.id_estado !== editId);
    if (existe) {
      setError("Ya existe un estado con ese nombre.");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateEstado(editId, form);
        setSuccess("Estado actualizado correctamente.");
      } else {
        await createEstado(form);
        setSuccess("Estado creado correctamente.");
      }
      setForm({ nombre: "" });
      setEditId(null);
      fetchEstados();
    } catch (err) {
      setError("Error al guardar: " + (err?.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleEdit = (e) => {
    setForm({ nombre: e.nombre });
    setEditId(e.id_estado);
  };

  const handleDelete = async (id) => {
    // Buscar el nombre para mostrarlo en el diálogo
    const estado = estados.find(e => e.id_estado === id);
    setConfirm({ open: true, id, nombre: estado ? estado.nombre : "" });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteEstado(confirm.id);
      setSuccess("Estado eliminado correctamente.");
      fetchEstados();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
    setConfirm({ open: false, id: null, nombre: "" });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Estados de Instrumentos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition flex items-center gap-2" disabled={loading}>
          {loading && <span className="loader border-2 border-t-2 border-yellow-600 rounded-full w-4 h-4 animate-spin"></span>}
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "" }); setError(""); setSuccess(""); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
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
              paginatedEstados.map((e) => (
                <tr key={e.id_estado}>
                  <td className="px-4 py-2 border-b">{e.nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(e)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(e.id_estado)} className="text-red-500 font-bold">Eliminar</button>
      {/* ConfirmDialog para eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar estado"
        message={`¿Seguro que deseas eliminar el estado "${confirm.nombre}"? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirm({ open: false, id: null, nombre: "" })}
        onConfirm={confirmDelete}
        confirmLabel="Eliminar"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      {/* Controles de paginación */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="Primera página"
          >&#171;</button>
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >&#60;</button>
          <span className="mx-2">Página {page} de {totalPages}</span>
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Página siguiente"
          >&#62;</button>
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label="Última página"
          >&#187;</button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="text-xs">Filas por página:</label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
    </div>
  );
}
