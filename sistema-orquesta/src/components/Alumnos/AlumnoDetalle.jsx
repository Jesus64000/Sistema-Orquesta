// src/components/Alumno/AlumnoDetalle.jsx
import { useState } from "react";
import DialogShell from "../DialogShell";
import Pill from "../ui/Pill";
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
                  <Pill key={p.id_programa} tone="neutral" size="xs">{p.nombre}</Pill>
                ))}
                {(!alumno.programas || alumno.programas.length === 0) && (
                  <span className="text-xs text-gray-400 italic">Sin programas</span>
                )}
              </div>
            </div>
            {(alumno.representantes && alumno.representantes.length > 0) && (
              <div className="md:col-span-2 border-t pt-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Representantes</p>
                <ul className="space-y-2">
                  {alumno.representantes.map(r => (
                    <li key={r.id_representante} className="flex flex-col md:flex-row md:items-center md:gap-3 p-2 rounded border border-gray-100 bg-gray-50">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{r.nombre}</span>
                        {r.parentesco_nombre && (
                          <span className="text-gray-500 text-sm ml-2">({r.parentesco_nombre}{r.principal ? ' - Principal' : ''})</span>
                        )}
                        {!r.parentesco_nombre && r.principal && (
                          <span className="text-gray-500 text-sm ml-2">(Principal)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1 mt-1 md:mt-0">
                        {r.telefono_movil && <span>Móvil: <span className="font-medium">{r.telefono_movil}</span></span>}
                        {r.email && <span className="text-gray-500">{r.email}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(!alumno.representantes || alumno.representantes.length === 0) && alumno.representante_nombre && (
              <div className="md:col-span-2 border-t pt-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Representante</p>
                <div className="p-2 rounded border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-3">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{alumno.representante_nombre}</span>
                    {alumno.parentesco_nombre && (
                      <span className="text-gray-500 text-sm ml-2">({alumno.parentesco_nombre})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1 mt-1 md:mt-0">
                    {alumno.representante_telefono_movil && <span>Móvil: <span className="font-medium">{alumno.representante_telefono_movil}</span></span>}
                    {alumno.representante_email && <span className="text-gray-500">{alumno.representante_email}</span>}
                  </div>
                </div>
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
