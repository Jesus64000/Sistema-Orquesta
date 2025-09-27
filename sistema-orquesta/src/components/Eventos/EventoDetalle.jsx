// sistema-orquesta/src/components/Eventos/EventoDetalle.jsx
import Modal from "../Modal";
import { History } from 'lucide-react';

export default function EventoDetalle({ evento, onClose, onOpenHistorial }) {
  if (!evento) return null;

  // Fecha
  let fecha = "Fecha no disponible";
  if (evento.fecha_evento) {
    const [year, month, day] = evento.fecha_evento.split("-");
    const dt = new Date(year, month - 1, day); // mes base 0
    fecha = dt.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Hora bonita en español
  let hora = "Hora no disponible";
  if (evento.hora_evento) {
    const [h, m] = evento.hora_evento.split(":");
    const dt = new Date();
    dt.setHours(h, m);
    hora = dt.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <Modal title="Detalle del Evento" onClose={onClose}>
      <div className="space-y-3">
        <p>
          <span className="font-semibold">Nombre:</span> {evento.titulo}
        </p>
        <p>
          <span className="font-semibold">Fecha:</span> {fecha}
        </p>
        <p>
          <span className="font-semibold">Hora:</span> {hora}
        </p>
        <p>
          <span className="font-semibold">Lugar:</span> {evento.lugar}
        </p>
        <p>
          <span className="font-semibold">Descripción:</span>{" "}
          {evento.descripcion || "Sin descripción"}
        </p>
        {evento.estado && (
          <p>
            <span className="font-semibold">Estado:</span> {evento.estado}
          </p>
        )}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenHistorial?.(evento)}
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:underline decoration-dotted focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-full px-3 py-1 bg-emerald-50 border border-emerald-200 shadow-sm"
          >
            <History className="h-3.5 w-3.5" /> Historial de cambios
          </button>
        </div>
      </div>
    </Modal>
  );
}
