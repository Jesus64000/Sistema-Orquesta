import { Pencil, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';

export default function PersonalTable({ data, loading, onEdit, onDelete, onView, selectedIds, onToggleSelectAll, onToggleOne, sortBy, sortDir, onSort }) {
  const headerCell = (key, label) => (
    <button
      type="button"
      onClick={() => onSort && onSort(key)}
      className="group inline-flex items-center gap-1 font-medium muted hover:text-app focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded"
    >
      <span>{label}</span>
      {sortBy === key ? (
        sortDir === 'asc' ? <ChevronUp size={14} className="muted" /> : <ChevronDown size={14} className="muted" />
      ) : (
        <ChevronUp size={14} className="opacity-0 group-hover:opacity-40 transition" />
      )}
    </button>
  );

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="overflow-x-auto card rounded-2xl shadow-sm" role="region" aria-label="Tabla de personal">
      <table className="w-full text-[13px] text-left border-collapse" role="grid">
        <thead className="card-90 muted text-[11px] uppercase tracking-wide sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-3 py-2 w-[36px]">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border text-yellow-500 focus:ring-yellow-300"
                aria-label={allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              />
            </th>
            <th className="px-3 py-2">{headerCell('nombre','Nombre')}</th>
            <th className="px-3 py-2">{headerCell('ci','CI')}</th>
            <th className="px-3 py-2">{headerCell('email','Email')}</th>
            <th className="px-3 py-2">{headerCell('telefono','Teléfono')}</th>
            <th className="px-3 py-2">{headerCell('programa','Programa')}</th>
            <th className="px-3 py-2">{headerCell('cargo','Cargo')}</th>
            <th className="px-3 py-2">{headerCell('carga_horaria','Horas')}</th>
            <th className="px-3 py-2">{headerCell('estado','Estado')}</th>
            <th className="px-3 py-2 w-40">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={10} className="px-4 py-10 text-center muted">Cargando...</td></tr>
          )}
          {!loading && data.length === 0 && (
            <tr><td colSpan={10} className="px-4 py-10 text-center muted">Sin resultados</td></tr>
          )}
          {!loading && data.map(r => {
            const selected = selectedIds.includes(r.id_personal);
            return (
              <tr key={r.id_personal} className={`transition ${selected ? 'bg-yellow-50' : 'hover:card-90'}`}>
                <td className="px-3 py-2 align-middle">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleOne(r.id_personal)}
                    className="h-4 w-4 rounded border text-yellow-500 focus:ring-yellow-300"
                    aria-label={selected ? `Quitar selección de ${r.nombres}` : `Seleccionar ${r.nombres}`}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-app">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    className="text-left hover:underline decoration-yellow-400 decoration-2 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
                    aria-label={`Ver detalle de ${r.nombres} ${r.apellidos||''}`}
                  >
                    {(r.nombres||'') + (r.apellidos? ' '+r.apellidos: '')}
                  </button>
                </td>
                <td className="px-3 py-2 muted">{r.ci || <span className="muted italic">—</span>}</td>
                <td className="px-3 py-2 muted break-all">{r.email}</td>
                <td className="px-3 py-2 muted">{r.telefono || <span className="muted italic">—</span>}</td>
                <td className="px-3 py-2 muted">{r.programa || <span className="muted italic">—</span>}</td>
                <td className="px-3 py-2 muted">{r.cargo || <span className="muted italic">—</span>}</td>
                <td className="px-3 py-2 muted text-center">{r.carga_horaria ?? 0}</td>
                <td className="px-3 py-2 muted">{r.estado}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(r)}
                        className="p-1.5 rounded-lg border card-90 text-app hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                        title="Editar"
                        aria-label={`Editar ${r.nombres}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onView(r)}
                      className="p-1.5 rounded-lg border bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1"
                      title="Ver detalle"
                      aria-label={`Ver detalle de ${r.nombres}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(r)}
                        className="p-1.5 rounded-lg border card-90 text-app hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                        title="Eliminar"
                        aria-label={`Eliminar ${r.nombres}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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
