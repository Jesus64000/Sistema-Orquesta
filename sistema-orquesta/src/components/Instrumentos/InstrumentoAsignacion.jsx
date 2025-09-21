// src/components/InstrumentoAsignacion.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function InstrumentoAsignacion({ instrumento }) {
  const [asignado, setAsignado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoId, setAlumnoId] = useState("");

  // 🔄 Cargar asignación actual del instrumento
  const loadAsignacion = async () => {
    try {
      // Traer todos los alumnos y filtrar el que tiene este instrumento asignado
      const res = await fetch("http://localhost:4000/alumnos");
      const data = await res.json();
      const asignacion = data.find(alumno =>
        alumno.instrumentos?.some(i => i.id_instrumento === instrumento.id_instrumento)
      );
      setAsignado(asignacion || null); // null si está libre
    } catch (err) {
      console.error("Error cargando asignación:", err);
      setAsignado(null);
    }
  };

  // 🔄 Cargar lista de alumnos
  const loadAlumnos = async () => {
    try {
      const res = await fetch("http://localhost:4000/alumnos");
      if (!res.ok) throw new Error("Error cargando alumnos");
      const data = await res.json();
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

  // ✅ Asignar instrumento
  const asignar = async () => {
    if (!alumnoId) return toast.error("Selecciona un alumno");

    // Verificar si ya está asignado
    if (asignado) {
      return toast.error(`Este instrumento ya está asignado a ${asignado.nombre}`);
    }

    try {
      const res = await fetch(
        `http://localhost:4000/alumnos/${alumnoId}/instrumento`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_instrumento: instrumento.id_instrumento }),
        }
      );
      if (!res.ok) throw new Error("Error en asignación");

      toast.success("Instrumento asignado correctamente");

      // 🔄 Refrescar asignación inmediatamente
      await loadAsignacion();
      setAlumnoId("");
    } catch {
      toast.error("No se pudo asignar el instrumento");
    }
  };

  // ✅ Devolver instrumento
  const devolver = async () => {
    if (!asignado?.id_alumno) return toast.error("No hay asignación activa");

    try {
      const res = await fetch(
        `http://localhost:4000/alumnos/${asignado.id_alumno}/instrumento`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error al devolver el instrumento");

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
        <div className="p-3 border rounded-lg bg-red-50">
          <p className="text-sm text-gray-700">
            Este instrumento ya está asignado a: <b>{asignado.nombre}</b>
          </p>
          <button
            onClick={devolver}
            className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Devolver instrumento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <select
            className="w-full border rounded-lg p-2 text-sm"
            value={alumnoId}
            onChange={(e) => setAlumnoId(e.target.value)}
          >
            <option value="">Seleccionar alumno</option>
            {alumnos.map((a) => (
              <option key={a.id_alumno} value={a.id_alumno}>
                {a.nombre}
              </option>
            ))}
          </select>
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