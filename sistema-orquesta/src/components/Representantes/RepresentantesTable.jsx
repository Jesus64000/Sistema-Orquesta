import { Pencil, Trash2, Eye, ChevronUp, ChevronDown, IdCard, Phone } from 'lucide-react';

export default function RepresentantesTable({ data, loading, onEdit, onDelete, onView, selectedIds, onToggleSelectAll, onToggleOne, sortBy, sortDir, onSort }) {
  const headerCell = (key, label) => (
    <button
      type="button"
      onClick={() => onSort && onSort(key)}
      className="group inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded"
    >
      <span>{label}</span>
      {sortBy === key ? (
        sortDir === 'asc' ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />
      ) : (
        <ChevronUp size={14} className="opacity-0 group-hover:opacity-40 transition" />
      )}
    </button>
  );

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm" role="region" aria-label="Tabla de representantes">
      <table className="w-full text-[13px] text-left border-collapse" role="grid">
        <thead className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-600 text-[11px] uppercase tracking-wide sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-3 py-2 w-[36px]">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-300"
                aria-label={allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              />
            </th>
            <th className="px-3 py-2">{headerCell('nombre','Nombre / Apellido')}</th>
            <th className="px-3 py-2">{headerCell('ci','CI')}</th>
            <th className="px-3 py-2">{headerCell('telefono_movil','Tel. Móvil')}</th>
            <th className="px-3 py-2">{headerCell('email','Email')}</th>
            <th className="px-3 py-2">{headerCell('parentesco_nombre','Parentesco')}</th>
            <th className="px-3 py-2">{headerCell('alumnos_count','Alumnos')}</th>
            <th className="px-3 py-2 w-40">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Cargando...</td></tr>
          )}
          {!loading && data.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Sin resultados</td></tr>
          )}
          {!loading && data.map(r => {
            const selected = selectedIds.includes(r.id_representante);
            return (
              <tr key={r.id_representante} className={`transition ${selected ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}> 
                <td className="px-3 py-2 align-middle">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleOne(r.id_representante)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-300"
                    aria-label={selected ? `Quitar selección de ${r.nombre}` : `Seleccionar ${r.nombre}`}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-gray-800">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    className="text-left hover:underline decoration-yellow-400 decoration-2 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
                    aria-label={`Ver detalle de ${r.nombre} ${r.apellido||''}`}
                  >
                    {(r.nombre||'') + (r.apellido? ' '+r.apellido: '')}
                  </button>
                </td>
                <td className="px-3 py-2 text-gray-600">{r.ci || <span className="text-gray-400 italic">—</span>}</td>
                <td className="px-3 py-2 text-gray-600">{r.telefono_movil || r.telefono || <span className="text-gray-400 italic">—</span>}</td>
                <td className="px-3 py-2 text-gray-600 break-all">{r.email}</td>
                <td className="px-3 py-2 text-gray-600">{r.parentesco_nombre || <span className="text-gray-400 italic">—</span>}</td>
                <td className="px-3 py-2 text-gray-600 text-center">{r.alumnos_count ?? 0}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEdit(r)}
                      className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                      title="Editar"
                      aria-label={`Editar ${r.nombre}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onView(r)}
                      className="p-1.5 rounded-lg border bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1"
                      title="Ver detalle"
                      aria-label={`Ver detalle de ${r.nombre}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(r)}
                      className="p-1.5 rounded-lg border bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                      title="Eliminar"
                      aria-label={`Eliminar ${r.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
