import { PlusCircle } from "lucide-react";

export default function EventosHeader({ onCreate }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <p className="text-sm text-gray-500">Administra todos los eventos de la orquesta.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Agregar Evento
        </button>
      </div>
    </div>
  );
}
