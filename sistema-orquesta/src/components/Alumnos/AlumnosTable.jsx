import React, { memo, useMemo, useRef, useEffect } from "react";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";
import Pill from "../ui/Pill";

// Program badge reutiliza Pill tono neutral
const ProgramBadge = ({ children }) => (
  <Pill tone="neutral" size="xs" className="hover:from-gray-100 hover:to-gray-200 transition">{children}</Pill>
);

// EstadoPill delega al Pill base
const EstadoPill = ({ estado, loading = false }) => {
  const map = {
    Activo: { tone: "green", dot: "bg-emerald-500" },
    Inactivo: { tone: "gray", dot: "bg-gray-400" },
    Retirado: { tone: "red", dot: "bg-red-500" },
  };
  const m = map[estado] || map.Inactivo;
  return (
    <Pill
      tone={m.tone}
      size="xs"
      leadingDot={!loading ? m.dot : undefined}
      loading={loading}
      aria-live={loading ? "polite" : undefined}
      className={loading ? "opacity-70" : ""}
    >
      {estado}
    </Pill>
  );
};

// Cabecera simple
const HeadTH = ({ children, className = "" }) => (
  <th scope="col" className={`px-3 py-2 font-semibold ${className}`}>{children}</th>
);

// Cabecera ordenable accesible
const SortableTH = ({ label, col, sortBy, sortDir, onToggle }) => {
  const ariaSort = sortBy === col ? (sortDir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="px-3 py-2 font-semibold cursor-pointer select-none group"
      onClick={() => onToggle(col)}
      role="columnheader"
    >
      <div className="flex items-center gap-1">
        <span className="group-hover:text-gray-900">{label}</span>
        {sortBy === col && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </div>
    </th>
  );
};

// Fila memoizada
const AlumnoRow = memo(function AlumnoRow({ a, isSelected, toggleSelect, openDetail, handleEstadoClick, checkingId, openEdit, isUpdating }) {
  return (
    <tr
      role="row"
      className={`transition cursor-default ${isSelected ? "bg-yellow-50" : "hover:bg-gray-50"}`}
      aria-busy={isUpdating ? "true" : undefined}
    >
      <td className="px-3 py-2 align-middle" role="cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(a.id_alumno)}
          className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-300"
          aria-label={isSelected ? `Quitar selección de ${a.nombre}` : `Seleccionar ${a.nombre}`}
        />
      </td>
      <td className="px-3 py-2 font-medium text-gray-800" role="cell">
        <button
          type="button"
          onClick={() => openDetail(a)}
          className="text-left hover:underline decoration-yellow-400 decoration-2 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
          aria-label={`Ver detalle de ${a.nombre}`}
        >
          {a.nombre}
        </button>
      </td>
      <td className="px-3 py-2 text-gray-600" role="cell">{a.edad} <span className="text-[10px] uppercase tracking-wide text-gray-400">años</span></td>
      <td className="px-3 py-2 text-gray-600 whitespace-nowrap" role="cell">{a.fecha_nacimiento?.slice(0, 10)}</td>
      <td className="px-3 py-2 text-gray-600" role="cell">{a.genero}</td>
      <td className="px-3 py-2 text-gray-600" role="cell">{a.telefono_contacto}</td>
      <td className="px-3 py-2" role="cell">
        {a.representante_nombre ? (
          <div className="flex flex-col leading-tight max-w-[180px]">
            <span className="font-medium text-gray-800">
              {a.representante_nombre}
              {a.parentesco_nombre && (
                <span className="text-[11px] font-normal text-gray-500"> ({a.parentesco_nombre})</span>
              )}
            </span>
            {a.representante_telefono_movil && (
              <span className="text-[11px] text-gray-600">{a.representante_telefono_movil}</span>
            )}
            {/* Email removido según requerimiento */}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400 italic">Sin representante</span>
        )}
      </td>
      <td className="px-3 py-2" role="cell">
        <button
          type="button"
          onClick={() => handleEstadoClick(a)}
          disabled={checkingId === a.id_alumno || isUpdating}
          className={`focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full ${checkingId === a.id_alumno || isUpdating ? "opacity-60 cursor-wait" : ""}`}
          title="Cambiar estado"
          aria-label={`Cambiar estado de ${a.nombre}`}
        >
          <EstadoPill estado={a.estado} loading={isUpdating} />
        </button>
      </td>
      <td className="px-3 py-2" role="cell">
        <div className="flex flex-wrap gap-1.5">
          {(a.programas || []).map((p) => (
            <ProgramBadge key={p.id_programa}>{p.nombre}</ProgramBadge>
          ))}
          {(!a.programas || a.programas.length === 0) && (
            <span className="text-[11px] text-gray-400 italic">Sin programas</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2" role="cell">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(a)}
            disabled={isUpdating}
            className={`p-1.5 rounded-lg border bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Editar"
            aria-label={`Editar ${a.nombre}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEstadoClick(a)}
            disabled={checkingId === a.id_alumno || isUpdating}
            className={`px-2 h-8 inline-flex items-center rounded-full text-[11px] font-medium border transition ${
              a.estado === "Activo"
                ? "bg-gradient-to-b from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200"
                : "bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200"
            } ${(checkingId === a.id_alumno || isUpdating) ? "opacity-60 cursor-wait" : ""}`}
            title={a.estado === "Activo" ? "Desactivar" : "Activar"}
            aria-label={`${a.estado === "Activo" ? "Desactivar" : "Activar"} ${a.nombre}`}
          >
            {(checkingId === a.id_alumno || isUpdating) ? "..." : a.estado === "Activo" ? "Desactivar" : "Activar"}
          </button>
          <button
            onClick={() => openDetail(a)}
            disabled={isUpdating}
            className={`px-2 h-8 inline-flex items-center rounded-full text-[11px] font-medium border bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Ver detalle"
            aria-label={`Ver detalle de ${a.nombre}`}
          >
            Ver
          </button>
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.checkingId === next.checkingId &&
    prev.isUpdating === next.isUpdating &&
    prev.a.estado === next.a.estado &&
    prev.a.nombre === next.a.nombre &&
    prev.a.edad === next.a.edad &&
    prev.a.fecha_nacimiento === next.a.fecha_nacimiento &&
    prev.a.genero === next.a.genero &&
    prev.a.telefono_contacto === next.a.telefono_contacto &&
    (prev.a.programas?.length || 0) === (next.a.programas?.length || 0)
  );
});

export default function AlumnosTable({
  alumnosPage,
  alumnosFiltrados,
  selected,
  toggleSelect,
  toggleSelectAllFiltered,
  sortBy,
  sortDir,
  toggleSort,
  openEdit,
  handleEstadoClick,
  checkingId,
  updatingId,
  openDetail,
}) {
  // Live region para anunciar cambios de estado individuales
  const estadoLiveRef = useRef(null);
  const lastEstadoRef = useRef({});

  useEffect(() => {
    // Construir un mapa id->estado actual
    const map = {};
    (alumnosFiltrados || []).forEach(a => { map[a.id_alumno] = a.estado; });

    // Comparar con lastEstadoRef y anunciar cambios (excepto durante animación de updatingId)
    Object.entries(map).forEach(([id, estado]) => {
      const prev = lastEstadoRef.current[id];
      if (prev && prev !== estado) {
        if (estadoLiveRef.current) {
          estadoLiveRef.current.textContent = `Alumno ${id} ahora ${estado}`;
        }
      }
    });
    lastEstadoRef.current = map;
  }, [alumnosFiltrados]);

  const totalFiltered = alumnosFiltrados?.length || 0;
  const selectedInFiltered = useMemo(() => (alumnosFiltrados || []).filter(a => selected.includes(a.id_alumno)).length, [alumnosFiltrados, selected]);
  const allFilteredSelected = totalFiltered > 0 && selectedInFiltered === totalFiltered;
  const isIndeterminate = selectedInFiltered > 0 && selectedInFiltered < totalFiltered;

  return (
    <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm" role="region" aria-label="Tabla de alumnos">
      {/* Región aria-live para cambios de estado */}
      <div ref={estadoLiveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      <table className="w-full text-[13px] text-left border-collapse" role="table">
        <thead className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-600 text-[11px] uppercase tracking-wide sticky top-0 z-10 shadow-sm" role="rowgroup">
          <tr role="row">
            <th scope="col" className="px-3 py-2 align-middle w-[36px]">
              <input
                type="checkbox"
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                checked={allFilteredSelected}
                onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-300"
                aria-label={allFilteredSelected ? "Deseleccionar todos" : "Seleccionar todos"}
              />
            </th>
            <SortableTH label="Nombre" col="nombre" sortBy={sortBy} sortDir={sortDir} onToggle={toggleSort} />
            <HeadTH>Edad</HeadTH>
            <HeadTH className="whitespace-nowrap">Nacimiento</HeadTH>
            <HeadTH>Género</HeadTH>
            <HeadTH>Teléfono</HeadTH>
            <HeadTH>Representante</HeadTH>
            <HeadTH>Estado</HeadTH>
            <HeadTH>Programas</HeadTH>
            <HeadTH>Acciones</HeadTH>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {alumnosPage.map(a => (
            <AlumnoRow
              key={a.id_alumno}
              a={a}
              isSelected={selected.includes(a.id_alumno)}
              toggleSelect={toggleSelect}
              openDetail={openDetail}
              handleEstadoClick={handleEstadoClick}
              checkingId={checkingId}
              openEdit={openEdit}
              isUpdating={updatingId === a.id_alumno}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
// EOF
