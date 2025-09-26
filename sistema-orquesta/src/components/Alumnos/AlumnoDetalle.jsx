// src/components/Alumno/AlumnoDetalle.jsx
import { useState } from "react";
import DialogShell from "../DialogShell";
import AlumnoInstrumento from "./AlumnoInstrumento";
import AlumnoHistorial from "./AlumnoHistorial";

export default function AlumnoDetalle({ alumno, onClose }) {
  const [tab, setTab] = useState("perfil");

  const tabs = [
    { key: "perfil", label: "Perfil" },
    { key: "instrumentos", label: "Instrumentos" },
    { key: "historial", label: "Historial" },
  ];

  return (
    <DialogShell
      open={!!alumno}
      onClose={onClose}
      title={`Detalle de ${alumno.nombre}`}
      size="lg"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5 border-b border-gray-200" role="tablist" aria-label="Secciones del alumno">
        {tabs.map(t => {
          const active = tab === t.key;
          const tabId = `alumno-tab-${t.key}`;
          const panelId = `alumno-panel-${t.key}`;
          return (
            <button
              key={t.key}
              id={tabId}
              onClick={() => setTab(t.key)}
              className={`relative px-4 h-10 text-sm font-medium rounded-t-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${active ? "bg-white text-gray-900 -mb-px border border-gray-200 border-b-white" : "text-gray-500 hover:text-gray-700"}`}
              aria-selected={active}
              aria-controls={panelId}
              role="tab"
              tabIndex={active ? 0 : -1}
            >
              {t.label}
              {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-500" />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`alumno-panel-${tab}`} aria-labelledby={`alumno-tab-${tab}`} className="space-y-6">
        {tab === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">{alumno.nombre}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha de nacimiento</p>
              <p className="font-medium text-gray-900">
                {alumno.fecha_nacimiento?.slice(0, 10)}{" "}
                {alumno.edad && (
                  <span className="text-gray-500">({alumno.edad} años)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Género</p>
              <p className="font-medium text-gray-900">{alumno.genero}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{alumno.telefono_contacto}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Estado</p>
              <p className="font-medium text-gray-900">{alumno.estado}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Programas</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(alumno.programas || []).map(p => (
                  <span key={p.id_programa} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                    {p.nombre}
                  </span>
                ))}
                {(!alumno.programas || alumno.programas.length === 0) && (
                  <span className="text-xs text-gray-400 italic">Sin programas</span>
                )}
              </div>
            </div>
            {alumno.representante_nombre && (
              <div className="md:col-span-2 border-t pt-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Representante</p>
                <p className="font-medium text-gray-900">{alumno.representante_nombre}</p>
                <p className="text-sm text-gray-600">
                  {alumno.representante_telefono} • {alumno.representante_email}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "instrumentos" && (
          <AlumnoInstrumento
            idAlumno={alumno.id_alumno}
            onChange={() => {}}
          />
        )}

        {tab === "historial" && (
          <AlumnoHistorial idAlumno={alumno.id_alumno} />
        )}
      </div>
    </DialogShell>
  );
}
