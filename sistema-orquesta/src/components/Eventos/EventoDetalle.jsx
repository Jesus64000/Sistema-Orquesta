// sistema-orquesta/src/components/Eventos/EventoDetalle.jsx
import Modal from "../Modal";

export default function EventoDetalle({ evento, onClose }) {
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
      </div>
    </Modal>
  );
}
