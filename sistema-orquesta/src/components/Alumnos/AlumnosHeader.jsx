import { UserPlus } from "lucide-react";

export default function AlumnosHeader({ selected, onExport, onCreate }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Gestión de ddAlumnos</h1>
        <p className="text-sm text-gray-500">Administra alumnos y sus programas.</p>
      </div>
      <div className="flex items-center gap-2">
        {selected.length > 0 && (
          <button onClick={onExport} className="px-3 py-2 rounded-lg bg-green-500 text-white">
            Exportar seleccionados
          </button>
        )}
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm">
          <UserPlus className="h-4 w-4" />
          Agregar Alumno
        </button>
      </div>
    </div>
  );
}
