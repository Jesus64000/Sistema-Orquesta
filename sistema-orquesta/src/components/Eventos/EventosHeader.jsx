import { PlusCircle, Download, Layers } from "lucide-react";
import Button from '../ui/Button';

// Header de Eventos con estilo unificado (similar a Alumnos/Instrumentos)
// Props:
// - selected: array de ids seleccionados
// - onCreate: abrir formulario
// - onExport: abrir export modal
// - onOpenActions: abrir acciones masivas
export default function EventosHeader({ selected = [], onCreate, onExport, onOpenActions }) {
  const count = selected.length;
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" role="region" aria-label="Encabezado eventos">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Eventos</h1>
        <p className="text-sm text-gray-500">Administra todos los eventos programados y su información.</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3" aria-label="Acciones sobre eventos" role="group">
        {count > 0 && (
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full pl-3 pr-4 h-10 shadow-sm" role="status" aria-live="polite">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-900 text-white tracking-wide" aria-label={`Total seleccionados: ${count}`}>{count}</span>
            <span className="text-xs text-gray-600" aria-hidden="true">seleccionado{count === 1 ? '' : 's'}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {count > 0 && (
            <>
              <Button type="button" onClick={onExport} variant="success" size="md" aria-label="Exportar eventos seleccionados" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button type="button" onClick={onOpenActions} variant="dark" size="md" aria-label="Abrir acciones masivas" className="gap-2">
                <Layers className="h-4 w-4" />
                Acciones
              </Button>
            </>
          )}
          <Button type="button" onClick={onCreate} variant="primary" size="md" aria-label="Agregar nuevo evento" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Agregar Evento
          </Button>
        </div>
      </div>
    </div>
  );
}
