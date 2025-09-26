import { UserPlus, Layers, Download } from "lucide-react";
import React from "react";

// Encabezado modernizado: gradientes suaves, botones redondeados full, chip de selección.
// Mantiene la semántica de colores (crear = amarillo, exportar = verde, acciones = neutro oscuro)
export default function AlumnosHeader({ selected = [], onExport, onCreate, onOpenActions }) {
  const count = selected.length;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Título */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Alumnos</h1>
        <p className="text-sm text-gray-500">Administra alumnos, estados y programas asociados.</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3" aria-label="Acciones sobre alumnos" role="group">
        {count > 0 && (
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full pl-3 pr-4 h-10 shadow-sm" role="status" aria-live="polite">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-900 text-white tracking-wide" aria-label={`Total seleccionados: ${count}`}>{count}</span>
            <span className="text-xs text-gray-600" aria-hidden="true">seleccionado{count === 1 ? "" : "s"}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {count > 0 && (
            <>
              <button
                type="button"
                onClick={onExport}
                className="group inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border border-emerald-600 shadow-sm hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition"
                aria-label="Exportar alumnos seleccionados"
              >
                <Download className="h-4 w-4 opacity-90 group-hover:opacity-100" />
                <span>Exportar</span>
              </button>
              <button
                type="button"
                onClick={onOpenActions}
                className="group inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-gray-800 to-gray-900 text-white border border-gray-800 shadow-sm hover:from-black hover:to-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition"
                aria-label="Abrir acciones masivas"
              >
                <Layers className="h-4 w-4 opacity-90 group-hover:opacity-100" />
                <span>Acciones</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-yellow-300 to-yellow-400 text-gray-900 border border-yellow-400 shadow-sm hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition"
            aria-label="Agregar nuevo alumno"
          >
            <UserPlus className="h-4 w-4 opacity-90 group-hover:opacity-100" />
            <span>Agregar Alumno</span>
          </button>
        </div>
      </div>
    </div>
  );
}
