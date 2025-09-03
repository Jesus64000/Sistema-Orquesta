import { useEffect, useState } from "react";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../api/configuraciones";
import { Settings, Search, Edit, Trash2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Configuraciones() {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "Admin",
    password: "",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      toast.error("Error cargando usuarios");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateUsuario(editing.id_usuario, formData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await createUsuario(formData);
        toast.success("Usuario creado correctamente");
      }
      setFormData({ nombre: "", email: "", rol: "Admin", password: "" });
      setEditing(null);
      setShowForm(false);
      loadUsuarios();
    } catch (err) {
      toast.error("Error guardando usuario");
    }
  };

  const handleEdit = (usuario) => {
    setFormData({ ...usuario, password: "" });
    setEditing(usuario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await deleteUsuario(id);
      toast.success("Usuario eliminado correctamente");
      loadUsuarios();
    } catch (err) {
      toast.error("Error eliminando usuario");
    }
  };

  const filtered = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuraciones
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Crear Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm w-full sm:w-80">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Rol</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id_usuario} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{u.nombre}</td>
                <td className="px-4 py-2 border-b">{u.email}</td>
                <td className="px-4 py-2 border-b">{u.rol}</td>
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id_usuario)}
                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Editar Usuario" : "Crear Usuario"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option>Admin</option>
                <option>Consultor</option>
              </select>
              {!editing && (
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
