// sistema-orquesta/src/components/Alumno/ToggleAlumnoEstado.jsx
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAlumnoInstrumento } from "../../api/alumnos";
import ConfirmDialog from "../ConfirmDialog";

export default function ToggleAlumnoEstado({ alumnoId, estadoActual, onSuccess, alumnoNombre }) {
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
    const destino = estadoActual === "Activo" ? "Inactivo" : "Activo";
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:4000/alumnos/${alumnoId}/estado`,
        { estado: destino, usuario: "sistema" }
      );
      // El backend devuelve { message: "Estado actualizado" } actualmente, por lo que asumimos el destino
      toast.success(`Alumno ${destino === "Activo" ? "activado" : "desactivado"}`);
      onSuccess?.(destino);
    } catch (err) {
      console.error("Error cambiando estado:", err);
      const msg = err?.response?.data?.error || "Error cambiando estado del alumno";
      toast.error(msg);
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
        title={accion === "desactivar" ? "Confirmar desactivación" : "Confirmar activación"}
        message={
          accion === "desactivar"
            ? `¿Seguro que deseas desactivar al alumno ${alumnoNombre || ""}?`+ (alumnoNombre?"":"")
            : `¿Seguro que deseas activar al alumno ${alumnoNombre || ""}?`
        }
        confirmLabel={accion === "desactivar" ? "Desactivar" : "Activar"}
        confirmColor={accion === "desactivar" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await toggleEstado();
        }}
      />
    </>
  );
}
