
import React, { useEffect, useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import Button from "../ui/Button";
import { getUsuarios, createUsuario, deleteUsuario } from "../../api/administracion/usuarios";
import { getRoles } from "../../api/administracion/roles";
import UsuarioEditModal from "./UsuarioEditModal";

// Validación de email simple
function validarEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function UsuariosAdmin() {
  // Confirmación personalizada para eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "", email: "", id_rol: "" });
  // Modal de edición completa
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios();
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar usuarios");
      setUsuarios([]);
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validaciones
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.email.trim()) {
      setError("El email es obligatorio.");
      return;
    }
    if (!validarEmail(form.email)) {
      setError("El email no es válido.");
      return;
    }
    if (!form.id_rol) {
      setError("Debe seleccionar un rol.");
      return;
    }
    // Evitar duplicados (nombre o email)
    const existe = usuarios.some(u => u.email === form.email);
    if (existe) {
      setError("Ya existe un usuario con ese email.");
      return;
    }
    setLoading(true);
    try {
      await createUsuario(form);
      setSuccess("Usuario creado correctamente.");
      setForm({ nombre: "", email: "", id_rol: "" });
      fetchUsuarios();
    } catch (err) {
      setError("Error al crear: " + (err?.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setEditTarget(u);
    setEditOpen(true);
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
      await deleteUsuario(toDeleteId);
      setSuccess("Usuario eliminado correctamente.");
      setToDeleteId(null);
      setConfirmOpen(false);
      fetchUsuarios();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
  <form onSubmit={handleSubmit} className="mb-2 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange} required className="border rounded px-3 py-1 w-64" type="email" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Rol</label>
          <select name="id_rol" value={form.id_rol} onChange={handleChange} required className="border rounded px-3 py-1 w-40 bg-app text-app">
            <option value="">Seleccione</option>
            {roles.map((r) => {
              const nivel = (r && r.permisos && typeof r.permisos.$nivel === 'number') ? r.permisos.$nivel : 2;
              return (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre} {`(nivel ${nivel})`}</option>
              );
            })}
          </select>
        </div>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Agregar
        </Button>
      </form>
      <p className="text-[11px] muted mb-4">El nivel proviene del rol: 1=Acceso a Administración (según permisos), 2=Sin Administración.</p>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="overflow-x-auto">
        <ConfirmDialog
          open={confirmOpen}
          title="Eliminar usuario"
          message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
          onCancel={() => { setConfirmOpen(false); setToDeleteId(null); }}
          onConfirm={confirmDelete}
          confirmLabel="Eliminar"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Rol</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4 table-empty">Cargando...</td></tr>
            ) : !Array.isArray(usuarios) || usuarios.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 table-empty">No hay usuarios</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td className="px-4 py-2 border-b text-app">{u.nombre}</td>
                  <td className="px-4 py-2 border-b text-app">{u.email}</td>
                  <td className="px-4 py-2 border-b text-app">{u.rol_nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(u)} className="text-yellow-600 font-semibold mr-2 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(u.id_usuario)} className="text-red-600 font-semibold hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {editOpen && (
          <UsuarioEditModal
            open={editOpen}
            onClose={() => { setEditOpen(false); setEditTarget(null); }}
            usuario={editTarget}
            roles={roles}
            onSaved={() => { setEditOpen(false); setEditTarget(null); fetchUsuarios(); }}
          />
        )}
      </div>
    </div>
  );
}
