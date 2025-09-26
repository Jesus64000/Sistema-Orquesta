// src/components/AlumnoDetalle.jsx
import { useState } from "react";
import DialogShell from "../DialogShell";
import InstrumentoAsignacion from "./InstrumentoAsignacion";
import InstrumentoHistorial from "./InstrumentoHistorial";

export default function InstrumentoDetalle({ instrumento, onClose }) {
  const [tab, setTab] = useState("perfil");

  if (!instrumento) return null;

  const tabs = [
    { key: "perfil", label: "Perfil" },
    { key: "asignacion", label: "Asignación" },
    { key: "historial", label: "Historial" },
  ];

  return (
    <DialogShell
      open={!!instrumento}
      onClose={onClose}
      title={`Detalle de ${instrumento.nombre}`}
      size="lg"
    >
      <div className="flex items-center gap-2 mb-5 border-b border-gray-200" role="tablist" aria-label="Secciones del instrumento">
        {tabs.map(t => {
          const active = tab === t.key;
          const tabId = `instrumento-tab-${t.key}`;
          const panelId = `instrumento-panel-${t.key}`;
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

      <div role="tabpanel" id={`instrumento-panel-${tab}`} aria-labelledby={`instrumento-tab-${tab}`} className="space-y-6 text-sm">
        {tab === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">{instrumento.nombre}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Categoría</p>
              <p className="font-medium text-gray-900">{instrumento.categoria_nombre}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Número de serie</p>
              <p className="font-medium text-gray-900">{instrumento.numero_serie}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Estado</p>
              <p className="font-medium text-gray-900">{instrumento.estado_nombre}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha adquisición</p>
              <p className="font-medium text-gray-900">{instrumento.fecha_adquisicion?.slice(0, 10) || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Ubicación</p>
              <p className="font-medium text-gray-900">{instrumento.ubicacion || "—"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Asignado a</p>
              {instrumento.asignado && instrumento.asignado.nombre ? (
                <span className="inline-block font-semibold text-blue-700 text-sm bg-blue-50 rounded-full px-2.5 py-1 border border-blue-200">
                  {instrumento.asignado.nombre}
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
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
    </DialogShell>
  );
}