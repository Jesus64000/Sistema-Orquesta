import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DesactivarAlumno({ alumnoId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 🔹 nuevo estado para errores del modal

  const handleDesactivar = async () => {
    try {
      setLoading(true);
      setErrorMsg(""); // limpiar errores anteriores

      const res = await axios.put(
        `http://localhost:4000/alumnos/${alumnoId}/desactivar`,
        { instrumentosDevueltos: confirm }
      );

      toast.success("✅ Alumno desactivado correctamente");
      onSuccess(res.data.message);

      // resetear modal
      setOpen(false);
      setConfirm(false);
    } catch (err) {
      const mensajeError =
        err.response?.data?.error || "Error al desactivar alumno";

      if (mensajeError.includes("instrumentos activos")) {
        setErrorMsg("⚠️ El alumno aún tiene instrumentos asignados. Debe devolverlos antes de continuar.");
      } else {
        setErrorMsg(mensajeError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Botón que abre el modal */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Desactivar Alumno
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ¿Seguro que deseas desactivar este alumno?
            </h2>

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                Confirmo que el alumno devolvió todos sus instrumentos
              </span>
            </label>

            {/* 🔹 Mensaje de error visible en el modal */}
            {errorMsg && (
              <p className="text-red-600 text-sm mb-3">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  setErrorMsg("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDesactivar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                disabled={loading || !confirm} // 🔹 botón deshabilitado si no se marca el check
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {loading ? "Desactivando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
