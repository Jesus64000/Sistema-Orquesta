import ConfirmDialog from "../ConfirmDialog";



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
  const [success, setSuccess] = useState("");
  // Estado para diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil((instrumentos?.length || 0) / rowsPerPage) || 1;
  const paginatedInstrumentos = instrumentos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1); // Reiniciar página al cambiar datos
  }, [instrumentos, rowsPerPage]);

  const fetchInstrumentos = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
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
    setError("");
    setSuccess("");
    // Validación básica
    if (!form.nombre.trim() || !form.id_categoria || !form.estado) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }
    // Prevenir duplicados
    const nombreLower = form.nombre.trim().toLowerCase();
    const isDuplicate = instrumentos.some(i => i.nombre.trim().toLowerCase() === nombreLower && i.id_instrumento !== editId);
    if (isDuplicate) {
      setError("Ya existe un instrumento con ese nombre");
      setLoading(false);
      return;
    }
    try {
      if (editId) {
        await updateInstrumento(editId, form);
        setSuccess("Instrumento actualizado correctamente");
      } else {
        await createInstrumento(form);
        setSuccess("Instrumento agregado correctamente");
      }
      setForm({ nombre: "", id_categoria: "", estado: "" });
      setEditId(null);
      fetchInstrumentos();
    } catch {
      setError("Error al guardar el instrumento");
    }
    setLoading(false);
  };

  const handleEdit = (i) => {
    setForm({ nombre: i.nombre, id_categoria: i.id_categoria, estado: i.estado });
    setEditId(i.id_instrumento);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteInstrumento(toDeleteId);
      setSuccess("Instrumento eliminado correctamente");
      fetchInstrumentos();
    } catch {
      setError("Error al eliminar el instrumento");
    }
    setLoading(false);
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Instrumentos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end" aria-live="polite">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="nombre-instrumento">Nombre</label>
          <input
            id="nombre-instrumento"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className={`border rounded px-3 py-1 w-48 ${error && !form.nombre ? 'border-red-400' : ''}`}
            aria-invalid={!!error && !form.nombre}
            aria-describedby={error && !form.nombre ? 'nombre-error' : undefined}
          />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="categoria-instrumento">Categoría</label>
          <select
            id="categoria-instrumento"
            name="id_categoria"
            value={form.id_categoria}
            onChange={handleChange}
            required
            className={`border rounded px-3 py-1 w-40 ${error && !form.id_categoria ? 'border-red-400' : ''}`}
            aria-invalid={!!error && !form.id_categoria}
            aria-describedby={error && !form.id_categoria ? 'categoria-error' : undefined}
          >
            <option value="">Seleccione</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="estado-instrumento">Estado</label>
          <select
            id="estado-instrumento"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            required
            className={`border rounded px-3 py-1 w-40 ${error && !form.estado ? 'border-red-400' : ''}`}
            aria-invalid={!!error && !form.estado}
            aria-describedby={error && !form.estado ? 'estado-error' : undefined}
          >
            <option value="">Seleccione</option>
            {estados.map((e) => (
              <option key={e.id_estado} value={e.nombre}>{e.nombre}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={`bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow flex items-center gap-2 transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-300'}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <span className="loader border-2 border-t-2 border-yellow-600 rounded-full w-4 h-4 animate-spin" aria-label="Cargando"></span>}
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ nombre: "", id_categoria: "", estado: "" }); setError(""); setSuccess(""); }}
            className="ml-2 text-xs text-gray-500 underline"
          >Cancelar</button>
        )}
      </form>
      {error && (
        <div className="text-red-500 mb-2" role="alert" aria-live="assertive" id="form-error">{error}</div>
      )}
      {success && (
        <div className="text-green-600 mb-2" role="status" aria-live="polite">{success}</div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar instrumento"
        message="¿Estás seguro de que deseas eliminar este instrumento? Esta acción no se puede deshacer."
        onCancel={() => { setConfirmOpen(false); setToDeleteId(null); }}
        onConfirm={confirmDelete}
        confirmLabel="Eliminar"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
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
              paginatedInstrumentos.map((i) => (
                <tr key={i.id_instrumento}>
                  <td className="px-4 py-2 border-b">{i.nombre}</td>
                  <td className="px-4 py-2 border-b">{i.categoria_nombre}</td>
                  <td className="px-4 py-2 border-b">{i.estado}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(i)} className="text-yellow-500 font-bold mr-2" aria-label={`Editar instrumento ${i.nombre}`}>Editar</button>
                    <button onClick={() => handleDelete(i.id_instrumento)} className="text-red-500 font-bold" aria-label={`Eliminar instrumento ${i.nombre}`}>Eliminar</button>
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
