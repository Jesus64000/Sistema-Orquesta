// src/components/AlumnoDetalle.jsx
import { useState } from "react";
import InstrumentoAsignacion from "./InstrumentoAsignacion";
import InstrumentoHistorial from "./InstrumentoHistorial";

export default function InstrumentoDetalle({ instrumento, onClose }) {
  const [tab, setTab] = useState("perfil");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Detalle de {instrumento.nombre}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {["perfil", "asignacion", "historial"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium ${
                tab === t
                  ? "border-b-2 border-yellow-400 text-yellow-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "perfil"
                ? "Perfil"
                : t === "asignacion"
                ? "Asignación"
                : "Historial"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "perfil" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="font-medium">{instrumento.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Categoría</p>
                <p className="font-medium">{instrumento.categoria}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Número de serie</p>
                <p className="font-medium">{instrumento.numero_serie}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="font-medium">{instrumento.estado}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha adquisición</p>
                <p className="font-medium">
                  {instrumento.fecha_adquisicion?.slice(0, 10) || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="font-medium">{instrumento.ubicacion || "—"}</p>
              </div>
            </div>
          )}

          {tab === "asignacion" && (
            <InstrumentoAsignacion instrumento={instrumento} />
          )}

          {tab === "historial" && (
            <InstrumentoHistorial idInstrumento={instrumento.id_instrumento} />
          )}
        </div>
      </div>
    </div>
  );
}
