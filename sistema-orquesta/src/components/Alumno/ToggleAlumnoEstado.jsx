// sistema-orquesta/src/components/Alumno/ToggleAlumnoEstado.jsx
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAlumnoInstrumento } from "../../api/alumnos";
import ConfirmDialog from "../ConfirmDialog";

export default function ToggleAlumnoEstado({ alumnoId, estadoActual, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accion, setAccion] = useState(null); // "activar" | "desactivar"

  const handleClick = async () => {
    if (loading) return;

    // 👉 Si está activo y queremos desactivar
    if (estadoActual === "Activo") {
      try {
        const res = await getAlumnoInstrumento(alumnoId);

        if (res.data) {
          // Si devuelve instrumento, no dejamos continuar
          toast.error(
            `El estudiante aún tiene asignado el instrumento "${res.data.nombre}". Debes devolverlo antes de desactivar.`
          );
          return;
        }
      } catch (err) {
        console.error("Error comprobando instrumento:", err);
        toast.error("Error comprobando instrumentos. Intenta de nuevo.");
        return;
      }

      setAccion("desactivar");
      setShowConfirm(true);
      return;
    }

    // 👉 Si está inactivo y queremos activar
    setAccion("activar");
    setShowConfirm(true);
  };

  const toggleEstado = async () => {
    try {
      setLoading(true);
      const resToggle = await axios.put(
        `http://localhost:4000/alumnos/${alumnoId}/estado`
      );
      const nuevoEstado = resToggle.data.estado;
      toast.success(
        `Alumno ${nuevoEstado === "Activo" ? "activado" : "desactivado"}`
      );
      onSuccess?.(nuevoEstado);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      toast.error("Error cambiando estado del alumno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-3 py-1 rounded text-sm ${
          estadoActual === "Activo"
            ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {loading ? "..." : estadoActual === "Activo" ? "Desactivar" : "Activar"}
      </button>

      {/* Modal de confirmación */}
      <ConfirmDialog
        open={showConfirm}
        title={
          accion === "desactivar" ? "Desactivar alumno" : "Activar alumno"
        }
        message={
          accion === "desactivar"
            ? "¿Seguro que deseas desactivar este alumno?"
            : "¿Seguro que deseas activar este alumno?"
        }
        confirmText={accion === "desactivar" ? "Desactivar" : "Activar"}
        confirmColor={accion === "desactivar" ? "red" : "green"}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await toggleEstado();
        }}
      />
    </>
  );
}
