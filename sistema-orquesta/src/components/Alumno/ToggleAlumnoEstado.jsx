// src/components/Alumno/ToggleAlumnoEstado.jsx
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAlumnoInstrumento } from "../../api/alumnos";
import ConfirmDialog from "../ConfirmDialogalumnos";

export default function ToggleAlumnoEstado({ alumnoId, estadoActual, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accion, setAccion] = useState(null); // "activar" o "desactivar"

  const handleClick = async () => {
    if (loading) return;

    if (estadoActual === "Activo") {
      // 🔹 si va a desactivar, primero verificar instrumentos
      try {
        const res = await getAlumnoInstrumento(alumnoId);
        const data = res.data;

        const hasInstrument =
          data !== null &&
          (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

        if (hasInstrument) {
          toast.error("El alumno aún tiene instrumentos asignados. No se puede desactivar.");
          return;
        }
      } catch (err) {
        if (!err.response || err.response.status !== 404) {
          console.error("Error comprobando instrumentos:", err);
          toast.error("Error comprobando instrumentos");
          return;
        }
      }

      setAccion("desactivar");
      setShowConfirm(true);
    } else {
      // 🔹 si va a activar
      setAccion("activar");
      setShowConfirm(true);
    }
  };

  const toggleEstado = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:4000/alumnos/${alumnoId}/estado`);
      const nuevoEstado = res.data.estado;
      toast.success(`Alumno ${nuevoEstado === "Activo" ? "activado" : "desactivado"}`);
      onSuccess?.(nuevoEstado);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      toast.error("Error cambiando estado");
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
        title={accion === "desactivar" ? "Desactivar alumno" : "Activar alumno"}
        message={
          accion === "desactivar"
            ? "¿Seguro que deseas desactivar este alumno?"
            : "¿Seguro que deseas activar este alumno?"
        }
        confirmText={accion === "desactivar" ? "Desactivar" : "Activar"} // 🔹 texto dinámico
        confirmColor={accion === "desactivar" ? "red" : "green"}         // 🔹 color dinámico
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await toggleEstado();
        }}
      />
    </>
  );
}
