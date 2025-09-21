import { Edit, Trash2, ChevronUp, ChevronDown, Eye } from "lucide-react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function InstrumentosTable({
  instrumentosPage,
  selected,
  toggleSelect,
  sortBy,
  sortDir,
  toggleSort,
  openEdit,
  setConfirm,
  openDetail,
}) {
  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("nombre")}> 
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
            <th className="px-3 py-2 border-b">Categoría</th>
            <th className="px-3 py-2 border-b">Número de serie</th>
            <th className="px-3 py-2 border-b">Estado</th>
            <th className="px-3 py-2 border-b">Fecha adquisición</th>
            <th className="px-3 py-2 border-b">Ubicación</th>
            <th className="px-3 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {instrumentosPage.map((i) => (
            <tr key={i.id_instrumento} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(i.id_instrumento)}
                  onChange={() => toggleSelect(i.id_instrumento)}
                />
              </td>
              <td className="px-3 py-2">{i.nombre}</td>
              <td className="px-3 py-2">{i.categoria}</td>
              <td className="px-3 py-2">{i.numero_serie}</td>
              <td className="px-3 py-2">
                <Badge>{i.estado}</Badge>
              </td>
              <td className="px-3 py-2">{i.fecha_adquisicion?.slice(0, 10)}</td>
              <td className="px-3 py-2">{i.ubicacion}</td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => openEdit(i)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirm({ open: true, id: i.id_instrumento, name: i.nombre })}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDetail(i.id_instrumento)}
                  className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
