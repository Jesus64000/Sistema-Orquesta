
import React, { useEffect, useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../../api/administracion/categorias";

// Validación de nombre
function validarNombre(nombre) {
  return nombre && nombre.trim().length > 0;
}

export default function CategoriasAdmin() {
  // Confirmación personalizada para eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil((categorias?.length || 0) / rowsPerPage) || 1;
  const paginatedCategorias = categorias.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1); // Reiniciar página al cambiar datos
  }, [categorias, rowsPerPage]);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await getCategorias();
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar categorías");
      setCategorias([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validarNombre(form.nombre)) {
      setError("El nombre es obligatorio.");
      return;
    }
    // Evitar duplicados
    const existe = categorias.some(c => c.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase() && c.id_categoria !== editId);
    if (existe) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateCategoria(editId, form);
        setSuccess("Categoría actualizada correctamente.");
      } else {
        await createCategoria(form);
        setSuccess("Categoría creada correctamente.");
      }
      setForm({ nombre: "", descripcion: "" });
      setEditId(null);
      fetchCategorias();
    } catch (err) {
      setError("Error al guardar: " + (err?.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleEdit = (c) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || "" });
    setEditId(c.id_categoria);
    setError("");
    setSuccess("");
  };

  // Abre el diálogo de confirmación
  const handleDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  // Confirma la eliminación
  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteCategoria(toDeleteId);
      setSuccess("Categoría eliminada correctamente.");
      setToDeleteId(null);
      setConfirmOpen(false);
      fetchCategorias();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Categorías de Instrumentos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end" aria-live="polite">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="nombre-categoria">Nombre</label>
          <input
            id="nombre-categoria"
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
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="descripcion-categoria">Descripción</label>
          <input
            id="descripcion-categoria"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="border rounded px-3 py-1 w-64"
          />
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
            onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "" }); setError(""); setSuccess(""); }}
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
      <div className="overflow-x-auto">
        <ConfirmDialog
          open={confirmOpen}
          title="Eliminar categoría"
          message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
          onCancel={() => { setConfirmOpen(false); setToDeleteId(null); }}
          onConfirm={confirmDelete}
          confirmLabel="Eliminar"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
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
            ) : !Array.isArray(categorias) || categorias.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay categorías</td></tr>
            ) : (
              paginatedCategorias.map((c) => (
                <tr key={c.id_categoria}>
                  <td className="px-4 py-2 border-b">{c.nombre}</td>
                  <td className="px-4 py-2 border-b">{c.descripcion}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(c)} className="text-yellow-500 font-bold mr-2" aria-label={`Editar categoría ${c.nombre}`}>Editar</button>
                    <button onClick={() => handleDelete(c.id_categoria)} className="text-red-500 font-bold" aria-label={`Eliminar categoría ${c.nombre}`}>Eliminar</button>
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
