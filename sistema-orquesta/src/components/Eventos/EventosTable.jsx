import { Edit, Trash2, ChevronUp, ChevronDown, Eye } from "lucide-react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function EventosTable({
  eventosPage,
  selected,
  toggleSelect,
  toggleSelectAll,
  sortBy,
  sortDir,
  toggleSort,
  openEdit,
  setViewDetail,
  setConfirm,
}) {
  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2">
              <input
                type="checkbox"
                onChange={(e) => toggleSelectAll(e.target.checked)}
                checked={selected.length === eventosPage.length && eventosPage.length > 0 && eventosPage.length > 0}
              />
            </th>
            <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("titulo")}> 
              <div className="flex items-center gap-1">
                Título
                {sortBy === "titulo" &&
                  (sortDir === "asc" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  ))}
              </div>
            </th>
            <th className="px-3 py-2 border-b">Descripción</th>
            <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("fecha_evento")}>Fecha
              {sortBy === "fecha_evento" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="h-3 w-3 inline" />
                ) : (
                  <ChevronDown className="h-3 w-3 inline" />
                ))}
            </th>
            <th className="px-3 py-2 border-b">Hora</th>
            <th className="px-3 py-2 border-b">Lugar</th>
            <th className="px-3 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventosPage.map(ev => (
            <tr key={ev.id_evento} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(ev.id_evento)}
                  onChange={() => toggleSelect(ev.id_evento)}
                />
              </td>
              <td className="px-3 py-2">{ev.titulo}</td>
              <td className="px-3 py-2">{ev.descripcion || "-"}</td>
              <td className="px-3 py-2">{ev.fecha_evento || "-"}</td>
              <td className="px-3 py-2">
                {ev.hora_evento ? new Date(`1970-01-01T${ev.hora_evento}`).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-"}
              </td>
              <td className="px-3 py-2">{ev.lugar}</td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => openEdit(ev)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewDetail(ev)}
                  className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirm({ open: true, id: ev.id_evento, name: ev.titulo })}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
