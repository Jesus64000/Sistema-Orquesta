import { useRef, useState } from "react";
import { importAlumnos } from "../../api/alumnos";
import toast from "react-hot-toast";

export default function ImportacionAdmin() {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setLoading(true);
      const res = await importAlumnos(file);
      toast.success(`Importación completada: ${res.data.created} creados, ${res.data.updated} actualizados, ${res.data.errors} errores`);
    } catch (e) {
      console.error(e);
      toast.error("Error importando archivo");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Importación masiva</h2>
      <p className="text-sm text-gray-600">Sube un archivo CSV o Excel (XLSX) con columnas: id_alumno, nombre, fecha_nacimiento (YYYY-MM-DD), genero, telefono_contacto, estado, programas (separados por “|”).</p>
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        <button disabled={loading} onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? 'Importando...' : 'Seleccionar archivo'}
        </button>
      </div>
    </div>
  );
}
