import { useEffect, useState } from "react";
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  deleteAlumno,
} from "../api/alumnos";
import { UserPlus, Search, Edit, Trash2 } from "lucide-react";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    id_programa: 1,
    estado: "Activo",
  });
  const [editing, setEditing] = useState(null);

  // 🔹 Cargar alumnos al entrar
  useEffect(() => {
    loadAlumnos();
  }, []);

  const loadAlumnos = async () => {
    const res = await getAlumnos();
    setAlumnos(res.data);
  };

  // 🔹 Manejo de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateAlumno(editing.id_alumno, formData);
    } else {
      await createAlumno(formData);
    }
    setFormData({
      nombre: "",
      fecha_nacimiento: "",
      genero: "Masculino",
      telefono_contacto: "",
      id_programa: 1,
      estado: "Activo",
    });
    setEditing(null);
    setShowForm(false);
    loadAlumnos();
  };

  // 🔹 Editar alumno
  const handleEdit = (alumno) => {
    setFormData(alumno);
    setEditing(alumno);
    setShowForm(true);
  };

  // 🔹 Eliminar alumno
  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este alumno?")) {
      await deleteAlumno(id);
      loadAlumnos();
    }
  };

  // 🔹 Filtrar resultados
  const filtered = alumnos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.estado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Agregar Alumno
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm w-full sm:w-80">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar alumno..."
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
              <th className="px-4 py-2 border-b">Fecha de nacimiento</th>
              <th className="px-4 py-2 border-b">Género</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Programa</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id_alumno} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{m.nombre}</td>
                <td className="px-4 py-2 border-b">
                  {m.fecha_nacimiento?.slice(0, 10)}
                </td>
                <td className="px-4 py-2 border-b">{m.genero}</td>
                <td className="px-4 py-2 border-b">{m.telefono_contacto}</td>
                <td className="px-4 py-2 border-b">{m.programa_nombre}</td>
                <td className="px-4 py-2 border-b">{m.estado}</td>
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    onClick={() => handleEdit(m)}
                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id_alumno)}
                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No se encontraron alumnos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Editar Alumno" : "Agregar Alumno"}
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
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_nacimiento: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <select
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
              <input
                type="text"
                placeholder="Teléfono"
                value={formData.telefono_contacto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefono_contacto: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg"
              />
              <select
                value={formData.id_programa}
                onChange={(e) =>
                  setFormData({ ...formData, id_programa: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value={1}>Programa Infantil</option>
                <option value={2}>Programa Juvenil</option>
                <option value={3}>Cátedra de Viento</option>
              </select>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Retirado</option>
              </select>
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
