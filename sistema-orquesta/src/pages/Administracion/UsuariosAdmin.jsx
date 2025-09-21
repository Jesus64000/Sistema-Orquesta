import React, { useEffect, useState } from "react";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../../api/administracion/usuarios";
import { getRoles } from "../../api/administracion/roles";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "", email: "", id_rol: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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
    setLoading(true);
    try {
      if (editId) {
        await updateUsuario(editId, form);
      } else {
        await createUsuario(form);
      }
      setForm({ nombre: "", email: "", id_rol: "" });
      setEditId(null);
      fetchUsuarios();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setForm({ nombre: u.nombre, email: u.email, id_rol: u.id_rol });
    setEditId(u.id_usuario);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    try {
  await deleteUsuario(id);
      fetchUsuarios();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
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
          <select name="id_rol" value={form.id_rol} onChange={handleChange} required className="border rounded px-3 py-1 w-40">
            <option value="">Seleccione</option>
            {roles.map((r) => (
              <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre: "", email: "", rol: "" }); }} className="ml-2 text-xs text-gray-500 underline">Cancelar</button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Rol</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(usuarios) || usuarios.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No hay usuarios</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td className="px-4 py-2 border-b">{u.nombre}</td>
                  <td className="px-4 py-2 border-b">{u.email}</td>
                  <td className="px-4 py-2 border-b">{u.rol_nombre}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(u)} className="text-yellow-500 font-bold mr-2">Editar</button>
                    <button onClick={() => handleDelete(u.id_usuario)} className="text-red-500 font-bold">Eliminar</button>
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
