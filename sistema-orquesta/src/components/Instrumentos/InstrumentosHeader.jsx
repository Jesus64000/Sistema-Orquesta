import { PlusCircle, Download } from "lucide-react";
import Button from '../ui/Button';

export default function InstrumentosHeader({ onCreate, onExport }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Instrumentos</h1>
        <p className="text-sm text-gray-500">Administra los instrumentos disponibles.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onExport} variant="neutral" size="md" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button onClick={onCreate} variant="primary" size="md" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Agregar Instrumento
        </Button>
      </div>
    </div>
  );
}
