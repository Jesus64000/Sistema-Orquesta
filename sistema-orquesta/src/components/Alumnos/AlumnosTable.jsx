import { Edit, ChevronUp, ChevronDown } from "lucide-react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function AlumnosTable({
  alumnosPage,
  selected,
  toggleSelect,
  sortBy,
  sortDir,
  toggleSort,
  openEdit,
  handleEstadoClick,
  checkingId,
  openDetail,
}) {
  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2"></th>
            <th
              className="px-3 py-2 border-b cursor-pointer"
              onClick={() => toggleSort("nombre")}
            >
              <div className="flex items-center gap-1">
                Nombre
                {sortBy === "nombre" &&
                  (sortDir === "asc" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  ))}
              </div>
            </th>
            <th className="px-3 py-2 border-b">Edad</th>
            <th className="px-3 py-2 border-b">Fecha nacimiento</th>
            <th className="px-3 py-2 border-b">Género</th>
            <th className="px-3 py-2 border-b">Teléfono</th>
            <th className="px-3 py-2 border-b">Representante</th>
            <th className="px-3 py-2 border-b">Estado</th>
            <th className="px-3 py-2 border-b">Programas</th>
            <th className="px-3 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnosPage.map((a) => (
            <tr key={a.id_alumno} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(a.id_alumno)}
                  onChange={() => toggleSelect(a.id_alumno)}
                />
              </td>
              <td className="px-3 py-2">{a.nombre}</td>
              <td className="px-3 py-2">{a.edad} años</td>
              <td className="px-3 py-2">{a.fecha_nacimiento?.slice(0, 10)}</td>
              <td className="px-3 py-2">{a.genero}</td>
              <td className="px-3 py-2">{a.telefono_contacto}</td>
              <td className="px-3 py-2">
                {a.representante_nombre ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{a.representante_nombre}</span>
                    <span className="text-xs text-gray-500">
                      {a.representante_telefono}
                    </span>
                    <span className="text-xs text-gray-400">
                      {a.representante_email}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin representante</span>
                )}
              </td>
              <td className="px-3 py-2">{a.estado}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {(a.programas || []).map((p) => (
                    <Badge key={p.id_programa}>{p.nombre}</Badge>
                  ))}
                  {(!a.programas || a.programas.length === 0) && (
                    <span className="text-xs text-gray-400">Sin programas</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEstadoClick(a)}
                  disabled={checkingId === a.id_alumno}
                  className={`p-1.5 rounded-lg border ${
                    a.estado === "Activo"
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  } ${checkingId === a.id_alumno ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {checkingId === a.id_alumno ? "..." : (a.estado === "Activo" ? "Desactivar" : "Activar")}
                </button>
                <button
                  onClick={() => openDetail(a)}
                  className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
