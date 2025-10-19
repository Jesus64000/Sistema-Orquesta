import { PlusCircle, Download, Layers } from 'lucide-react';
import Button from '../ui/Button';

// Encabezado de Instrumentos alineado visualmente con el de Alumnos
// - Orden botones cuando hay selección: Exportar (success) -> Acciones (dark) -> Agregar (primary)
// - Contador de seleccionados en chip con blur y fondo blanco translúcido
// - Mantiene semántica: crear = primary (amarillo), exportar = success (verde), acciones = dark
export default function InstrumentosHeader({ onCreate, onExport, selectedCount = 0, onBulk }) {
  const count = selectedCount;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" role="region" aria-label="Encabezado instrumentos">
      {/* Título y descripción */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Instrumentos</h1>
        <p className="text-sm text-gray-500">Administra los instrumentos disponibles, su estado y asignación.</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3" aria-label="Acciones sobre instrumentos" role="group">
        {count > 0 && (
          <div
            className="flex items-center gap-2 card-90 backdrop-blur-sm rounded-full pl-3 pr-4 h-10 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-900 text-white tracking-wide"
              aria-label={`Total seleccionados: ${count}`}
            >
              {count}
            </span>
            <span className="text-xs text-gray-600" aria-hidden="true">
              seleccionado{count === 1 ? '' : 's'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {count > 0 && (
            <>
              <Button
                type="button"
                onClick={onExport}
                variant="success"
                size="md"
                aria-label="Exportar instrumentos seleccionados"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                type="button"
                onClick={onBulk}
                variant="dark"
                size="md"
                aria-label="Abrir acciones masivas"
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                Acciones
              </Button>
            </>
          )}
          <Button
            type="button"
            onClick={onCreate}
            variant="primary"
            size="md"
            aria-label="Agregar nuevo instrumento"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar Instrumento
          </Button>
        </div>
      </div>
    </div>
  );
}
