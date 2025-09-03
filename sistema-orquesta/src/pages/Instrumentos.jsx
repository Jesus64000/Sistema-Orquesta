import { useEffect, useState } from "react";
import {
  getInstrumentos,
  createInstrumento,
  updateInstrumento,
  deleteInstrumento,
} from "../api/instrumentos";
import { getProgramas } from "../api/programas";
import { Music2, Search, Edit, Trash2, PlusCircle } from "lucide-react";

export default function Instrumentos() {
  const [instrumentos, setInstrumentos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Cuerda",
    numero_serie: "",
    estado: "Disponible",
    fecha_adquisicion: "",
    ubicacion: "",
  });
  const [editing, setEditing] = useState(null);

  // 🔹 Cargar datos al iniciar
  useEffect(() => {
    loadInstrumentos();
    loadProgramas();
  }, []);

  const loadInstrumentos = async () => {
    const res = await getInstrumentos();
    setInstrumentos(res.data);
  };

  const loadProgramas = async () => {
    const res = await getProgramas();
    setProgramas(res.data);
  };

  // 🔹 Guardar instrumento
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateInstrumento(editing.id_instrumento, formData);
    } else {
      await createInstrumento(formData);
    }
    resetForm();
    loadInstrumentos();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      categoria: "Cuerda",
      numero_serie: "",
      estado: "Disponible",
      fecha_adquisicion: "",
      ubicacion: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  // 🔹 Editar
  const handleEdit = (instrumento) => {
    setFormData(instrumento);
    setEditing(instrumento);
    setShowForm(true);
  };

  // 🔹 Eliminar
  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este instrumento?")) {
      await deleteInstrumento(id);
      loadInstrumentos();
    }
  };

  // 🔹 Filtrar búsqueda
  const filtered = instrumentos.filter(
    (i) =>
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      i.categoria.toLowerCase().includes(search.toLowerCase()) ||
      i.estado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Gestión de Instrumentos</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Agregar Instrumento
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm w-full sm:w-80">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar instrumento..."
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
              <th className="px-4 py-2 border-b">Categoría</th>
              <th className="px-4 py-2 border-b">Número de serie</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Fecha adquisición</th>
              <th className="px-4 py-2 border-b">Ubicación</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id_instrumento} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{i.nombre}</td>
                <td className="px-4 py-2 border-b">{i.categoria}</td>
                <td className="px-4 py-2 border-b">{i.numero_serie}</td>
                <td className="px-4 py-2 border-b">{i.estado}</td>
                <td className="px-4 py-2 border-b">
                  {i.fecha_adquisicion?.slice(0, 10)}
                </td>
                <td className="px-4 py-2 border-b">{i.ubicacion}</td>
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    onClick={() => handleEdit(i)}
                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(i.id_instrumento)}
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
                  No se encontraron instrumentos
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
              {editing ? "Editar Instrumento" : "Agregar Instrumento"}
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
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option>Cuerda</option>
                <option>Viento</option>
                <option>Percusión</option>
                <option>Mobiliario</option>
                <option>Teclado</option>
              </select>
              <input
                type="text"
                placeholder="Número de serie"
                value={formData.numero_serie}
                onChange={(e) =>
                  setFormData({ ...formData, numero_serie: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option>Disponible</option>
                <option>Asignado</option>
                <option>Mantenimiento</option>
                <option>Baja</option>
              </select>
              <input
                type="date"
                value={formData.fecha_adquisicion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_adquisicion: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Ubicación"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              />
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
