import React, { useEffect, useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { getProgramas, createPrograma, updatePrograma, deletePrograma } from "../../api/administracion/programas";
import Button from "../ui/Button";
// Validación de nombre





export default function ProgramasAdmin() {
  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Enviar formulario para agregar o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        // Actualizar
        await updatePrograma(editId, form);
        setSuccess("Programa actualizado correctamente");
      } else {
        // Crear
        await createPrograma(form);
        setSuccess("Programa agregado correctamente");
      }
      setForm({ nombre: "", descripcion: "" });
      setEditId(null);
      fetchProgramas();
    } catch {
      setError("Error al guardar el programa");
    } finally {
      setLoading(false);
    }
  };

  // Editar un programa
  const handleEdit = (programa) => {
    setEditId(programa.id_programa);
    setForm({ nombre: programa.nombre, descripcion: programa.descripcion || "" });
    setError("");
    setSuccess("");
  };

  // Eliminar (abre confirmación)
  const handleDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setLoading(true);
    try {
  await deletePrograma(toDeleteId);
      setSuccess("Programa eliminado correctamente");
      setToDeleteId(null);
      setConfirmOpen(false);
      fetchProgramas();
    } catch {
      setError("Error al eliminar el programa");
    } finally {
      setLoading(false);
    }
  };

  // Cargar programas al montar
  useEffect(() => {
    fetchProgramas();

  }, []);
  // Estado para diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [programas, setProgramas] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil((programas?.length || 0) / rowsPerPage) || 1;
  const paginatedProgramas = programas.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1); // Reiniciar página al cambiar datos
  }, [programas, rowsPerPage]);

  const fetchProgramas = async () => {
    setLoading(true);
    try {
      const res = await getProgramas();
      setProgramas(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch {
      setError("Error al cargar programas");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Programas</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end" aria-live="polite">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="nombre-programa">Nombre</label>
          <input
            id="nombre-programa"
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
          <label className="block text-xs text-yellow-500 font-semibold mb-1" htmlFor="descripcion-programa">Descripción</label>
          <input
            id="descripcion-programa"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="border rounded px-3 py-1 w-64"
          />
        </div>
        <Button type="submit" variant="primary" loading={loading} aria-busy={loading}>
          {editId ? "Actualizar" : "Agregar"}
        </Button>
        {editId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "" }); setError(""); setSuccess(""); }}
          >Cancelar</Button>
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
          title="Eliminar programa"
          message="¿Estás seguro de que deseas eliminar este programa? Esta acción no se puede deshacer."
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
            ) : !Array.isArray(programas) || programas.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay programas</td></tr>
            ) : (
              paginatedProgramas.map((p) => (
                <tr key={p.id_programa}>
                  <td className="px-4 py-2 border-b">{p.nombre}</td>
                  <td className="px-4 py-2 border-b">{p.descripcion}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(p)} className="text-yellow-600 font-semibold hover:underline mr-2" aria-label={`Editar programa ${p.nombre}`}>Editar</button>
                    <button onClick={() => handleDelete(p.id_programa)} className="text-red-600 font-semibold hover:underline" aria-label={`Eliminar programa ${p.nombre}`}>Eliminar</button>
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
