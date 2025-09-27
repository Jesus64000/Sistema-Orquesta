import { Edit, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';

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
  const allPageIds = eventosPage.map(ev => ev.id_evento);
  const pageAllSelected = allPageIds.length > 0 && allPageIds.every(id => selected.includes(id));
  const somePageSelected = allPageIds.some(id => selected.includes(id));

  const ariaSort = (col) => (sortBy === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');

  const ThSortable = ({ col, children, className = '' }) => (
    <th
      scope="col"
      className={`px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10 align-middle ${className}`}
      aria-sort={ariaSort(col)}
    >
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="group inline-flex items-center gap-1 text-left font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded"
      >
        <span>{children}</span>
        {sortBy === col && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        {sortBy !== col && (
          <span className="opacity-0 group-hover:opacity-60 transition text-[10px] text-gray-400">↕</span>
        )}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm relative">
      <table className="w-full text-sm text-left border-collapse" role="grid">
        <thead>
          <tr className="text-gray-600">
            <th className="px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
              <input
                type="checkbox"
                aria-label="Seleccionar todos los eventos de la página"
                onChange={(e) => toggleSelectAll(e.target.checked)}
                checked={pageAllSelected}
                ref={el => {
                  if (el) el.indeterminate = !pageAllSelected && somePageSelected;
                }}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
              />
            </th>
            <ThSortable col="titulo">Título</ThSortable>
            <th className="px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10">Descripción</th>
            <ThSortable col="fecha_evento" className="w-32">Fecha</ThSortable>
            <th className="px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10 w-24">Hora</th>
            <th className="px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10">Lugar</th>
            <th className="px-3 py-2 border-b bg-white/70 backdrop-blur sticky top-0 z-10 w-32">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventosPage.map(ev => {
            const checked = selected.includes(ev.id_evento);
            return (
              <tr
                key={ev.id_evento}
                className={`hover:bg-emerald-50/40 focus-within:bg-emerald-50/60 transition ${checked ? 'bg-emerald-50/60' : ''}`}
              >
                <td className="px-3 py-2 align-middle">
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar evento ${ev.titulo}`}
                    checked={checked}
                    onChange={() => toggleSelect(ev.id_evento)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
                  />
                </td>
                <td className="px-3 py-2 align-middle font-medium text-gray-800">{ev.titulo}</td>
                <td className="px-3 py-2 align-middle text-gray-600">{ev.descripcion || '-'}</td>
                <td className="px-3 py-2 align-middle tabular-nums font-mono text-[13px] text-gray-700">{ev.fecha_evento || '-'}</td>
                <td className="px-3 py-2 align-middle text-gray-700">
                  {ev.hora_evento ? new Date(`1970-01-01T${ev.hora_evento}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                </td>
                <td className="px-3 py-2 align-middle text-gray-700">{ev.lugar}</td>
                <td className="px-2 py-1 align-middle">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      aria-label={`Editar ${ev.titulo}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewDetail(ev)}
                      className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 hover:bg-yellow-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                      aria-label={`Ver detalles de ${ev.titulo}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, id: ev.id_evento, name: ev.titulo })}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      aria-label={`Eliminar ${ev.titulo}`}
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
