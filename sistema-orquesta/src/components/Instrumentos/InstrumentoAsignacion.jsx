// src/components/InstrumentoAsignacion.jsx
import { useEffect, useMemo, useState } from "react";
import { http } from "../../api/http";
import toast from "react-hot-toast";
import SearchableSelect from "../ui/SearchableSelect";

export default function InstrumentoAsignacion({ instrumento }) {
  const [asignado, setAsignado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoId, setAlumnoId] = useState("");

  // 🔄 Cargar asignación actual del instrumento
  const loadAsignacion = async () => {
    try {
      // Traer el detalle del instrumento, que incluye el alumno asignado completo
  const res = await http.get(`/instrumentos/${instrumento.id_instrumento}`);
  const data = res.data;
      setAsignado(data.asignado || null);
    } catch (err) {
      console.error("Error cargando asignación:", err);
      setAsignado(null);
    }
  };

  // 🔄 Cargar lista de alumnos
  const loadAlumnos = async () => {
    try {
  const res = await http.get(`/alumnos`);
  const data = res.data;
      setAlumnos(data);
    } catch {
      setAlumnos([]);
    }
  };

  useEffect(() => {
    loadAsignacion();
    loadAlumnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrumento.id_instrumento]);

  const alumnoOptions = useMemo(() => (
    alumnos.map(a => ({ label: a.nombre, value: String(a.id_alumno) }))
  ), [alumnos]);

  // ✅ Asignar instrumento
  const asignar = async () => {
    if (!alumnoId) return toast.error("Selecciona un alumno");

    // Verificar si ya está asignado
    if (asignado) {
      return toast.error(`Este instrumento ya está asignado a ${asignado.nombre}`);
    }

    try {
      await http.post(
        `/alumnos/${alumnoId}/instrumento`,
        { id_instrumento: instrumento.id_instrumento }
      );

      toast.success("Instrumento asignado correctamente");

      // 🔄 Refrescar asignación inmediatamente
      await loadAsignacion();
      setAlumnoId("");
    } catch (e) {
      const msg = e?.response?.data?.error || "No se pudo asignar el instrumento";
      toast.error(msg);
    }
  };

  // ✅ Devolver instrumento
  const devolver = async () => {
    if (!asignado?.id_alumno) return toast.error("No hay asignación activa");

    try {
      await http.delete(
        `/alumnos/${asignado.id_alumno}/instrumento`
      );

      toast.success("Instrumento devuelto correctamente");

      // 🔄 Refrescar asignación inmediatamente
      await loadAsignacion();
    } catch {
      toast.error("No se pudo devolver el instrumento");
    }
  };

  return (
    <div className="space-y-4">
      {asignado ? (
        <div className="p-3 rounded card-90 border">
          <h4 className="font-semibold mb-2">Alumno asignado</h4>
          <div className="space-y-1 text-sm text-app">
            <p><span className="font-medium">Nombre:</span> {asignado.nombre}</p>
            {asignado.genero && <p><span className="font-medium">Género:</span> {asignado.genero}</p>}
            {asignado.telefono_contacto && <p><span className="font-medium">Teléfono:</span> {asignado.telefono_contacto}</p>}
            {asignado.estado && <p><span className="font-medium">Estado:</span> {asignado.estado}</p>}
            {asignado.programas && Array.isArray(asignado.programas) && asignado.programas.length > 0 && (
              <p><span className="font-medium">Programas:</span> {asignado.programas.map(p => p.nombre).join(', ')}</p>
            )}
          </div>
          <button
            onClick={devolver}
            className="mt-3 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Devolver instrumento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <SearchableSelect
            options={alumnoOptions}
            value={alumnoId}
            onChange={setAlumnoId}
            placeholder="Escribe para buscar alumno"
            className="w-full"
          />
          <button
            onClick={asignar}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Asignar instrumento
          </button>
        </div>
      )}
    </div>
  );
}