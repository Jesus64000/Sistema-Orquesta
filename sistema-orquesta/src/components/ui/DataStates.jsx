// Componente reutilizable para manejar estados de datos: loading, error, emptyFiltered, emptyNone.
// Uso básico:
// <DataStates
//   loading={loading}
//   error={loadError}
//   hasData={items.length > 0}
//   filteredCount={filtered.length}
//   onRetry={loadData}
//   onClearFilters={() => setSearch('')}
//   showSkeletonRows={6}
//   entityName="instrumentos"
// />

export default function DataStates({
  loading,
  error,
  hasData,
  filteredCount,
  onRetry,
  onHideError,
  onClearFilters,
  showSkeletonRows = 6,
  entitySingular = 'registro',
  entityPlural = 'registros',
  entityIcon = '📄',
  emptyCtaLabel = null,
  onEmptyCta,
  filtersActive,
  skeletonCols = 4,
  emptyInitialTitle,
  emptyInitialMessage,
}) {
  // Skeleton (solo cuando carga inicial y no hay datos todavía)
  if (loading && !hasData && !error) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4" aria-label={`Cargando ${entityPlural}`}>
        {Array.from({ length: showSkeletonRows }).map((_, i) => (
          <div key={i} className={`grid gap-4 animate-pulse`} style={{ gridTemplateColumns: `repeat(${skeletonCols}, minmax(0,1fr))` }}>
            {Array.from({ length: skeletonCols }).map((__, c) => (
              <div key={c} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
          <span className="h-3 w-3 animate-spin rounded-full border-t-2 border-b-2 border-yellow-400"></span>
          Cargando {entityPlural}...
        </div>
      </div>
    );
  }

  // Error de carga
  if (!loading && error) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-200 text-red-600 text-xl font-bold">!</div>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-800">No se pudieron cargar los datos</h3>
          <p className="text-sm text-gray-500 max-w-sm">Ocurrió un problema al intentar obtener la lista de {entityPlural}. Verifica tu conexión o reintenta.</p>
        </div>
        <div className="flex gap-3">
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-yellow-300 to-yellow-400 text-gray-900 border border-yellow-400 shadow-sm hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1">Reintentar</button>
          )}
          {onHideError && (
            <button onClick={onHideError} className="inline-flex items-center h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm hover:from-gray-100 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1">Ocultar</button>
          )}
        </div>
      </div>
    );
  }

  // Lista vacía pero con filtros activos => sin resultados
  if (!loading && !error && hasData && filteredCount === 0) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
            <span className="text-2xl">{entityIcon}</span>
          </div>
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold flex items-center justify-center border border-yellow-300">0</div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-800">Sin resultados</h3>
          <p className="text-sm text-gray-500 max-w-xs">Ajusta la búsqueda o limpia los filtros para ver más {entityPlural}.</p>
        </div>
        {filtersActive && onClearFilters && (
          <button onClick={onClearFilters} className="inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium bg-gradient-to-b from-gray-800 to-gray-900 text-white border border-gray-800 shadow-sm hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1">Limpiar filtros</button>
        )}
      </div>
    );
  }

  // Lista totalmente vacía (sin registros aún)
  if (!loading && !error && !hasData && filteredCount === 0) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
          <span className="text-2xl">{entityIcon}</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-800">{emptyInitialTitle || `Aún no hay ${entityPlural}`}</h3>
          <p className="text-sm text-gray-500 max-w-xs">{emptyInitialMessage || `Crea el primer ${entitySingular} para comenzar.`}</p>
        </div>
        {emptyCtaLabel && onEmptyCta && (
          <button onClick={onEmptyCta} className="inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium bg-gradient-to-b from-green-600 to-green-700 text-white border border-green-600 shadow-sm hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1">{emptyCtaLabel}</button>
        )}
      </div>
    );
  }

  return null;
}
