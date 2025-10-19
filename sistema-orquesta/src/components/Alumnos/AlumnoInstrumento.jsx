// src/components/Alumno/AlumnoInstrumento.jsx
import { useEffect, useState } from "react";
import { http } from "../../api/http";
import toast from "react-hot-toast";
import { getAlumnoInstrumento } from "../../api/alumnos";

export default function AlumnoInstrumento({ idAlumno }) {
  const [instrumento, setInstrumento] = useState(null);

  const loadInstrumento = async () => {
    if (!idAlumno) return; // 👈 validamos aquí
    try {
      const res = await getAlumnoInstrumento(idAlumno);
      setInstrumento(res.data || null);
    } catch {
      toast.error("Error cargando instrumento");
    }
  };

  useEffect(() => {
    loadInstrumento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno]);

  if (!idAlumno) return null; // 👈 validamos al renderizar

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Instrumento Asignado</h4>
      {instrumento ? (
        <div className="p-3 rounded card-90 border shadow-sm">
          <p><span className="font-medium">Nombre:</span> {instrumento.nombre}</p>
          <p><span className="font-medium">Categoría:</span> {instrumento.categoria}</p>
          <p><span className="font-medium">N° Serie:</span> {instrumento.numero_serie}</p>
          <p><span className="font-medium">Estado:</span> {instrumento.estado_instrumento}</p>
          <p><span className="font-medium">Fecha asignación:</span> {instrumento.fecha_asignacion?.slice(0, 10)}</p>

          <button
            onClick={async () => {
              try {
                await http.delete(
                  `/alumnos/${idAlumno}/instrumento`
                );
                toast.success("Instrumento devuelto");
                setInstrumento(null); // 🔄 refrescar UI
              } catch {
                toast.error("Error devolviendo instrumento");
              }
            }}
            className="mt-3 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Devolver instrumento
          </button>
        </div>
      ) : (
        <p className="text-sm muted">Sin instrumento asignado</p>
      )}
    </div>
  );
}
