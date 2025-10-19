import { Search } from "lucide-react";
import TagSelect from "../TagSelect";
import React, { useMemo } from "react";

// Barra de filtros modernizada usando TagSelect y estilos coherentes con Dashboard
export default function AlumnosFilters({
  search,
  setSearch,
  fEstado,
  setFEstado,
  fPrograma,
  setFPrograma,
  programas = [],
}) {
  // Opciones memoizadas para evitar recreación en renders
  const estadoOptions = useMemo(
    () => [
      { label: "Activo", value: "Activo" },
      { label: "Inactivo", value: "Inactivo" },
      { label: "Retirado", value: "Retirado" },
      { label: "Todos", value: "" },
    ],
    []
  );

  const programaOptions = useMemo(
    () => [
      { label: "Todos", value: "" },
      ...programas.map((p) => ({ label: p.nombre, value: String(p.id_programa) })),
    ],
    [programas]
  );

  return (
  <div className="card-90 backdrop-blur-sm p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between relative z-20" role="region" aria-label="Filtros de alumnos" aria-describedby="alumnos-filtros-descripcion">
      {/* Búsqueda + filtros agrupados */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 items-stretch md:items-center flex-wrap">
        {/* Input búsqueda */}
        <div className="group flex items-center gap-2 px-3 h-10 rounded-full border card shadow-sm focus-within:ring-2 focus-within:ring-yellow-300 transition" role="search">
          <Search className="h-4 w-4 muted" />
          <input
            type="text"
            placeholder="Buscar nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-app placeholder:text-gray-400 focus-visible:outline-none"
            aria-label="Buscar por nombre o teléfono"
          />
        </div>

        {/* Estado */}
        <TagSelect
          options={estadoOptions}
          value={fEstado}
          onChange={setFEstado}
          size="mdCompact"
          accent="yellow"
          placeholder="Estado"
          menuWidth={170}
          className="focus-visible:outline-none"
        />

        {/* Programa */}
        <TagSelect
          options={programaOptions}
            value={fPrograma}
            onChange={setFPrograma}
            size="mdCompact"
            accent="grayStrong"
            placeholder="Programa"
            menuWidth={220}
            className="focus-visible:outline-none"
        />
      </div>

      {/* Resumen (opcional futuro) o espacio para filtros extendidos */}
  <div className="flex items-center gap-3 text-xs muted" id="alumnos-filtros-descripcion" aria-live="polite">
        {/* Placeholder accesible para describir filtros; se puede actualizar dinámicamente más adelante */}
        <span className="sr-only">Usa los filtros para refinar la lista de alumnos.</span>
      </div>
    </div>
  );
}
