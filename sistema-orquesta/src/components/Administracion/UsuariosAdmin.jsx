
import React, { useEffect, useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import Button from "../ui/Button";
import { getUsuarios, deleteUsuario } from "../../api/administracion/usuarios";
import { getRoles } from "../../api/administracion/roles";
import UsuarioEditModal from "./UsuarioEditModal";
import AddUserModal from "./AddUserModal";

// Validación de email simple
// validarEmail ya no se usa en esta vista (creación via modal)

export default function UsuariosAdmin() {
  // Confirmación personalizada para eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  // creación se maneja con modal, sin form inline
  const [addOpen, setAddOpen] = useState(false);
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

  // creación ahora via modal AddUserModal

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <Button type="button" variant="primary" onClick={()=>setAddOpen(true)}>+ Nuevo usuario</Button>
      </div>
  <p className="text-[11px] muted mb-4">El nivel se define por usuario: 1 = Acceso a Administración (según permisos otorgados), 2 = Sin acceso a Administración.</p>
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
        {addOpen && (
          <AddUserModal
            open={addOpen}
            onClose={()=>setAddOpen(false)}
            usuarios={usuarios}
            onCreated={()=>{ setAddOpen(false); fetchUsuarios(); }}
          />
        )}
      </div>
    </div>
  );
}
