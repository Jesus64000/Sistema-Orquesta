import { PlusCircle } from "lucide-react";
import Button from '../ui/Button';

export default function EventosHeader({ onCreate }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <p className="text-sm text-gray-500">Administra todos los eventos de la orquesta.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onCreate} variant="primary" size="md" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Agregar Evento
        </Button>
      </div>
    </div>
  );
}
