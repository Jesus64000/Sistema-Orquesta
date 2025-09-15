// sistema-orquesta/src/pages/Eventos.jsx
import { useEffect, useState } from "react";
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../api/eventos";
import { ClipboardList, Search, Edit, Trash2, PlusCircle } from "lucide-react";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_evento: "",
    lugar: "",
  });
  const [editing, setEditing] = useState(null);

  // 🔹 Cargar eventos al entrar
  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    const res = await getEventos();
    setEventos(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateEvento(editing.id_evento, formData);
    } else {
      await createEvento(formData);
    }
    setFormData({ titulo: "", descripcion: "", fecha_evento: "", lugar: "" });
    setEditing(null);
    setShowForm(false);
    loadEventos();
  };

  const handleEdit = (evento) => {
    setFormData(evento);
    setEditing(evento);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este evento?")) {
      await deleteEvento(id);
      loadEventos();
    }
  };

  // 🔹 Filtrar resultados
  const filtered = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      e.lugar.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm w-full sm:w-80">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar evento..."
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
              <th className="px-4 py-2 border-b">Título</th>
              <th className="px-4 py-2 border-b">Fecha</th>
              <th className="px-4 py-2 border-b">Lugar</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id_evento} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{e.titulo}</td>
                <td className="px-4 py-2 border-b">
                  {e.fecha_evento?.slice(0, 10)}
                </td>
                <td className="px-4 py-2 border-b">{e.lugar}</td>
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    onClick={() => handleEdit(e)}
                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id_evento)}
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
                  No se encontraron eventos
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
              {editing ? "Editar Evento" : "Crear Evento"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Título"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={formData.fecha_evento}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_evento: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Lugar"
                value={formData.lugar}
                onChange={(e) =>
                  setFormData({ ...formData, lugar: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
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
