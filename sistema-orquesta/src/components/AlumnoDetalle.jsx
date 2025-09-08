// src/components/AlumnoDetalle.jsx
import { useState } from "react";
import AlumnoInstrumento from "./AlumnoInstrumento";
import AlumnoHistorial from "./AlumnoHistorial";

export default function AlumnoDetalle({ alumno, onClose }) {
  const [tab, setTab] = useState("perfil");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Detalle de {alumno.nombre}
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
          {["perfil", "instrumentos", "historial"].map((t) => (
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
                : t === "instrumentos"
                ? "Instrumentos"
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
                <p className="font-medium">{alumno.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                <p className="font-medium">
                  {alumno.fecha_nacimiento?.slice(0, 10)}{" "}
                  {alumno.edad && (
                    <span className="text-gray-500">
                      ({alumno.edad} años)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Género</p>
                <p className="font-medium">{alumno.genero}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="font-medium">{alumno.telefono_contacto}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="font-medium">{alumno.estado}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500">Programas</p>
                <div className="flex flex-wrap gap-2">
                  {(alumno.programas || []).map((p) => (
                    <span
                      key={p.id_programa}
                      className="px-2 py-1 rounded-full text-xs bg-gray-100 border"
                    >
                      {p.nombre}
                    </span>
                  ))}
                  {(!alumno.programas ||
                    alumno.programas.length === 0) && (
                    <span className="text-xs text-gray-400">
                      Sin programas
                    </span>
                  )}
                </div>
              </div>
              {alumno.representante_nombre && (
                <div className="md:col-span-2 border-t pt-3">
                  <p className="text-xs text-gray-500">Representante</p>
                  <p className="font-medium">{alumno.representante_nombre}</p>
                  <p className="text-sm text-gray-600">
                    {alumno.representante_telefono} •{" "}
                    {alumno.representante_email}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "instrumentos" && (
            <AlumnoInstrumento 
              idAlumno={alumno.id_alumno}
              onChange={() => {}}e
            />
          )}


          {tab === "historial" && (
            <AlumnoHistorial idAlumno={alumno.id_alumno} />
          )}
        </div>
      </div>
    </div>
  );
}
