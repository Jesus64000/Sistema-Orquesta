import React, { memo, useRef, useEffect } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import Pill from '../ui/Pill';

// Map estado -> estilo
const EstadoPill = ({ estado }) => {
  const map = {
    Disponible: { tone: 'green', dot: 'bg-emerald-500' },
    Asignado: { tone: 'yellow', dot: 'bg-yellow-500' },
    Mantenimiento: { tone: 'blue', dot: 'bg-blue-500' },
    Retirado: { tone: 'red', dot: 'bg-red-500' },
  };
  const m = map[estado] || { tone: 'gray', dot: 'bg-gray-400' };
  return <Pill tone={m.tone} size="xs" leadingDot={m.dot}>{estado}</Pill>;
};

const HeadTH = ({ children, className='' }) => (
  <th scope="col" className={`px-3 py-2 font-semibold text-[11px] uppercase tracking-wide ${className}`}>{children}</th>
);

const SortableTH = ({ label, col, sortBy, sortDir, onToggle }) => {
  const ariaSort = sortBy === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="px-3 py-2 font-semibold cursor-pointer select-none group text-[11px] uppercase tracking-wide"
      onClick={() => onToggle(col)}
      role="columnheader"
    >
      <div className="flex items-center gap-1">
        <span className="group-hover:text-app">{label}</span>
        {sortBy === col && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </div>
    </th>
  );
};

const InstrumentoRow = memo(function InstrumentoRow({ i, isSelected, toggleSelect, openEdit, setConfirm, openDetail }) {
  return (
    <tr className={`transition cursor-default text-app ${isSelected ? 'bg-yellow-50' : 'hover:card-90'} border-b last:border-b-0`}> 
      <td className="px-3 py-2 align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(i.id_instrumento)}
          className="h-4 w-4 rounded border text-yellow-500 focus:ring-yellow-300"
          aria-label={isSelected ? `Quitar selección de ${i.nombre}` : `Seleccionar ${i.nombre}`}
        />
      </td>
      <td className="px-3 py-2 font-medium text-app">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openDetail(i.id_instrumento)}
            className="text-left hover:underline decoration-yellow-400 decoration-2 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
            aria-label={`Ver detalle de ${i.nombre}`}
          >
            {i.nombre}
          </button>
          {i.asignado && i.asignado.nombre && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] card-90 text-app border" title={`Asignado a ${i.asignado.nombre}`}>Asignado</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 muted">{i.categoria_nombre}</td>
      <td className="px-3 py-2 muted">{i.numero_serie}</td>
      <td className="px-3 py-2"><EstadoPill estado={i.estado_nombre} /></td>
      <td className="px-3 py-2">
        {i.asignado && i.asignado.nombre ? (
          <span className="text-[11px] font-medium text-app">{i.asignado.nombre}</span>
        ) : (
          <span className="text-[11px] muted italic">—</span>
        )}
      </td>
      <td className="px-3 py-2 muted whitespace-nowrap">{i.fecha_adquisicion?.slice(0,10)}</td>
      <td className="px-3 py-2 muted">{i.ubicacion}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(i)}
            className="p-1.5 rounded-lg border card-90 text-app hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
            title="Editar"
            aria-label={`Editar ${i.nombre}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setConfirm({ open: true, id: i.id_instrumento, name: i.nombre })}
            className="p-1.5 rounded-lg border card-90 text-app hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
            title="Eliminar"
            aria-label={`Eliminar ${i.nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDetail(i.id_instrumento)}
            className="p-1.5 rounded-lg border bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1"
            title="Ver detalle"
            aria-label={`Ver detalle de ${i.nombre}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.i.estado_nombre === next.i.estado_nombre &&
    prev.i.nombre === next.i.nombre &&
    prev.i.numero_serie === next.i.numero_serie &&
    prev.i.ubicacion === next.i.ubicacion &&
    (prev.i.asignado?.nombre || '') === (next.i.asignado?.nombre || '')
  );
});

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
  toggleSelectAllFiltered,
  totalFiltered,
}) {
  const liveRef = useRef(null);
  const lastEstadoMap = useRef({});

  useEffect(() => {
    const map = {};
    instrumentosPage.forEach(i => { map[i.id_instrumento] = i.estado_nombre; });
    Object.entries(map).forEach(([id, estado]) => {
      if (lastEstadoMap.current[id] && lastEstadoMap.current[id] !== estado) {
        if (liveRef.current) liveRef.current.textContent = `Instrumento ${id} ahora ${estado}`;
      }
    });
    lastEstadoMap.current = map;
  }, [instrumentosPage]);

  // Selección agregada
  const selectedCount = selected.length;
  const allFilteredSelected = totalFiltered > 0 && selectedCount === totalFiltered;
  const someSelected = selectedCount > 0 && !allFilteredSelected;
  // Indeterminate si hay selección parcial (no todo filtrado)
  const isIndeterminate = someSelected;

  const onMasterChange = (e) => {
    const checked = e.target.checked;
    toggleSelectAllFiltered?.(checked);
  };

  return (
  <div className="overflow-x-auto card border rounded-2xl shadow-sm" role="region" aria-label="Tabla de instrumentos">
      <div ref={liveRef} aria-live="polite" className="sr-only" />
      <table className="w-full text-[13px] text-left border-collapse" role="table">
        <thead className="card-90 muted text-[11px] uppercase tracking-wide sticky top-0 z-10 shadow-sm" role="rowgroup">
          <tr role="row">
            <th className="px-3 py-2 w-[36px]">
              <input
                type="checkbox"
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                checked={allFilteredSelected}
                onChange={onMasterChange}
                className="h-4 w-4 rounded border text-yellow-500 focus:ring-yellow-300"
                aria-label={allFilteredSelected ? 'Deseleccionar todos los filtrados' : 'Seleccionar todos los filtrados'}
              />
            </th>
            <SortableTH label="Nombre" col="nombre" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
            <HeadTH>Categoría</HeadTH>
            <HeadTH>Número de serie</HeadTH>
            <HeadTH>Estado</HeadTH>
            <HeadTH>Asignado a</HeadTH>
            <HeadTH>Adquisición</HeadTH>
            <HeadTH>Ubicación</HeadTH>
            <HeadTH>Acciones</HeadTH>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {instrumentosPage.map(i => (
            <InstrumentoRow
              key={i.id_instrumento}
              i={i}
              isSelected={selected.includes(i.id_instrumento)}
              toggleSelect={(idOrObj) => {
                // soportar bulk replace
                if (typeof idOrObj === 'object' && idOrObj.bulkReplace) {
                  // hack: reutilizamos toggleSelect para reemplazo completo
                  // Nota: la página padre debe interpretar correctamente si recibe un objeto
                  toggleSelect(idOrObj);
                } else {
                  toggleSelect(i.id_instrumento);
                }
              }}
              openEdit={openEdit}
              setConfirm={setConfirm}
              openDetail={openDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
