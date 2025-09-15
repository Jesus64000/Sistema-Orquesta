// sistema-orquesta/src/pages/Miembros.jsx
import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import Modal from "../components/Modal";

const miembrosMock = [
  { id: 1, nombre: "Ana López", instrumento: "Violín", estado: "Activo", ingreso: "2023-05-12" },
  { id: 2, nombre: "Carlos Pérez", instrumento: "Viola", estado: "En espera", ingreso: "2023-07-20" },
];

export default function Miembros() {
  const [search, setSearch] = useState("");
  const [miembros, setMiembros] = useState(miembrosMock);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nuevo, setNuevo] = useState({ nombre: "", instrumento: "", estado: "Activo" });

  const handleAdd = () => {
    setMiembros([...miembros, { ...nuevo, id: Date.now(), ingreso: new Date().toISOString().split("T")[0] }]);
    setNuevo({ nombre: "", instrumento: "", estado: "Activo" });
    setIsModalOpen(false);
  };

  const filtered = miembros.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.instrumento.toLowerCase().includes(search.toLowerCase()) ||
    m.estado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Gestión de Miembros</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Agregar Miembro
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm w-full sm:w-80">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar miembro..."
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
              <th className="px-4 py-2 border-b">Instrumento</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Fecha de ingreso</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{m.nombre}</td>
                <td className="px-4 py-2 border-b">{m.instrumento}</td>
                <td className="px-4 py-2 border-b">{m.estado}</td>
                <td className="px-4 py-2 border-b">{m.ingreso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar miembro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar nuevo miembro">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Instrumento"
            value={nuevo.instrumento}
            onChange={(e) => setNuevo({ ...nuevo, instrumento: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            value={nuevo.estado}
            onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option>Activo</option>
            <option>En espera</option>
            <option>Inactivo</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
}
