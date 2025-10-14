import { Plus, Layers, Download } from 'lucide-react';

export default function RepresentantesHeader({ onCreate, selected = [], onExport, onOpenActions }) {
  const count = selected.length;
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Representantes</h1>
        <p className="text-sm text-gray-500">Gestiona padres / tutores y su relación con alumnos.</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3" aria-label="Acciones representantes" role="group">
        {count > 0 && (
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full pl-3 pr-4 h-10 shadow-sm" role="status" aria-live="polite">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-900 text-white tracking-wide" aria-label={`Total seleccionados: ${count}`}>{count}</span>
            <span className="text-xs text-gray-600" aria-hidden="true">seleccionado{count === 1 ? '' : 's'}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {count > 0 && (
            <>
              {onExport && (
                <button
                  type="button"
                  onClick={onExport}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              )}
              {onOpenActions && (
                <button
                  type="button"
                  onClick={onOpenActions}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-medium shadow-sm"
                >
                  <Layers className="h-4 w-4" />
                  Acciones
                </button>
              )}
            </>
          )}
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold shadow-sm border border-yellow-500"
            >
              <Plus className="h-4 w-4" />
              Nuevo representante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
