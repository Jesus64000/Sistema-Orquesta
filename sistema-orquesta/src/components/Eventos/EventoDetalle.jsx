// sistema-orquesta/src/components/Eventos/EventoDetalle.jsx
import Modal from "../Modal";

export default function EventoDetalle({ evento, onClose }) {
  if (!evento) return null;

  let fecha = "Fecha no disponible";
  let hora = "Hora no disponible";

  if (evento.fecha_evento) {
    const dt = new Date(evento.fecha_evento.replace(" ", "T"));
    fecha = dt.toLocaleDateString(); // solo la fecha
    hora = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // solo hora y minutos
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
          <span className="font-semibold">Descripción:</span> {evento.descripcion || "Sin descripción"}
        </p>
      </div>
    </Modal>
  );
}
