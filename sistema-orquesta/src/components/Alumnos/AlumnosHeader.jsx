import { UserPlus, Download, Settings } from "lucide-react";
import { useState } from "react";

function Menu({ open, children }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20">
      {children}
    </div>
  );
}

export default function AlumnosHeader({ selected, onCreate, onExportFormat, onMassActions }) {
  const [openExport, setOpenExport] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
  <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
        <p className="text-sm text-gray-500">Administra alumnos y sus programas.</p>
      </div>
      <div className="flex items-center gap-2 relative">
        {selected.length > 0 && (
          <>
            <button onClick={() => setOpenExport(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white">
              <Download className="h-4 w-4" /> Exportar
            </button>
            <Menu open={openExport}>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setOpenExport(false); onExportFormat?.('csv'); }}>CSV</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setOpenExport(false); onExportFormat?.('xlsx'); }}>Excel (XLSX)</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setOpenExport(false); onExportFormat?.('pdf'); }}>PDF</button>
            </Menu>

            <button
              onClick={() => onMassActions?.('estado')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white"
            >
              <Settings className="h-4 w-4" /> Acciones
            </button>
          </>
        )}
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm">
          <UserPlus className="h-4 w-4" />
          Agregar Alumno
        </button>
      </div>
    </div>
  );
}
