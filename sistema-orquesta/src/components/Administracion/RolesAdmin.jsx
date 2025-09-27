import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import { getRoles, createRol, updateRol, deleteRol } from "../../api/administracion/roles";

export default function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "", permisos: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error al cargar roles");
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
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
        await updateRol(editId, form);
      } else {
        await createRol(form);
      }
      setForm({ nombre: "", permisos: "" });
      setEditId(null);
      fetchRoles();
    } catch {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  const handleEdit = (r) => {
    setForm({ nombre: r.nombre, permisos: r.permisos || "" });
    setEditId(r.id_rol);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este rol?")) return;
    setLoading(true);
    try {
  await deleteRol(id);
      fetchRoles();
    } catch {
      setError("Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Roles y Permisos</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required className="border rounded px-3 py-1 w-48" />
        </div>
        <div>
          <label className="block text-xs text-yellow-500 font-semibold mb-1">Permisos</label>
          <input name="permisos" value={form.permisos} onChange={handleChange} className="border rounded px-3 py-1 w-64" placeholder="Ej: crear,editar,eliminar" />
        </div>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>{editId ? "Actualizar" : "Agregar"}</Button>
        {editId && (
          <Button type="button" variant="ghost" size="sm" onClick={() => { setEditId(null); setForm({ nombre: "", permisos: "" }); }}>Cancelar</Button>
        )}
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Permisos</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
            ) : !Array.isArray(roles) || roles.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No hay roles</td></tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id_rol}>
                  <td className="px-4 py-2 border-b">{r.nombre}</td>
                  <td className="px-4 py-2 border-b">{r.permisos}</td>
                  <td className="px-4 py-2 border-b">
                    <button onClick={() => handleEdit(r)} className="text-yellow-600 font-semibold mr-2 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(r.id_rol)} className="text-red-600 font-semibold hover:underline">Eliminar</button>
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
