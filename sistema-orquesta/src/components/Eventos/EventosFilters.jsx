import { Search } from 'lucide-react';
// Filtros de Eventos: sólo búsqueda (se eliminó filtro de programa a solicitud)

// Barra de filtros de Eventos alineada al patrón usado en Instrumentos/Alumnos
export default function EventosFilters({ search, setSearch }) {
  const hasAnyFilter = Boolean(search);
  const clearAll = () => setSearch('');

  return (
    <div
      className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between relative z-20"
      role="region"
      aria-label="Filtros de eventos"
      aria-describedby="eventos-filtros-descripcion"
    >
      <div className="flex flex-col md:flex-row gap-4 flex-1 items-stretch md:items-center flex-wrap">
        {/* Búsqueda */}
        <div
          className="group flex items-center gap-2 px-3 h-10 rounded-full border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-300 transition"
          role="search"
        >
          <Search className="h-4 w-4 text-gray-500 group-focus-within:text-gray-700" />
          <input
            type="text"
            placeholder="Buscar título, descripción o lugar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 focus-visible:outline-none"
            aria-label="Buscar eventos"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[10px] font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-full px-2 py-0.5"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 underline decoration-dotted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Descripción accesible */}
      <div
        className="flex items-center gap-3 text-xs text-gray-500"
        id="eventos-filtros-descripcion"
        aria-live="polite"
      >
        <span className="sr-only">Usa los filtros para refinar la lista de eventos.</span>
      </div>
    </div>
  );
}
