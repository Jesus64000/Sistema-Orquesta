// Utilidad de validación para formulario de Evento
// Reglas:
// - titulo: obligatorio, min 3 caracteres
// - fecha_evento: obligatorio, formato YYYY-MM-DD, no pasada
// - hora_evento: obligatorio, formato HH:MM (00-23:00-59)
// - lugar: obligatorio, min 3 caracteres
// - descripcion: opcional, trim
// - estado: opcional en create; si presente debe ser uno de PROGRAMADO|EN_CURSO|FINALIZADO|CANCELADO
// Devuelve: { valid:boolean, errors: {campo:string}, normalized: objeto normalizado }

const ESTADOS_VALIDOS = ['PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO'];

export function validateEventoForm(input) {
  const errors = {};
  const out = { ...input };

  const todayStr = new Date().toISOString().slice(0,10);

  // Helper
  const isValidDate = (s) => /^(\d{4})-(\d{2})-(\d{2})$/.test(s);
  const isValidTime = (s) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);

  // titulo
  if (!out.titulo || !out.titulo.trim()) {
    errors.titulo = 'Título requerido';
  } else if (out.titulo.trim().length < 3) {
    errors.titulo = 'Mínimo 3 caracteres';
  } else {
    out.titulo = out.titulo.trim();
  }

  // fecha_evento
  if (!out.fecha_evento) {
    errors.fecha_evento = 'Fecha requerida';
  } else if (!isValidDate(out.fecha_evento)) {
    errors.fecha_evento = 'Formato de fecha inválido';
  } else if (out.fecha_evento < todayStr) {
    errors.fecha_evento = 'La fecha no puede estar en el pasado';
  }

  // hora_evento
  if (!out.hora_evento) {
    errors.hora_evento = 'Hora requerida';
  } else if (!isValidTime(out.hora_evento)) {
    errors.hora_evento = 'Formato hora inválido (HH:MM)';
  }

  // lugar
  if (!out.lugar || !out.lugar.trim()) {
    errors.lugar = 'Lugar requerido';
  } else if (out.lugar.trim().length < 3) {
    errors.lugar = 'Mínimo 3 caracteres';
  } else {
    out.lugar = out.lugar.trim();
  }

  // descripcion (opcional)
  if (out.descripcion) {
    out.descripcion = out.descripcion.trim();
  }

  // estado (opcional pero si viene validar)
  if (out.estado != null && out.estado !== '') {
    const upper = String(out.estado).toUpperCase();
    if (!ESTADOS_VALIDOS.includes(upper)) {
      errors.estado = 'Estado inválido';
    } else {
      out.estado = upper;
    }
  }
  // default estado si no viene
  if (!out.estado) {
    out.estado = 'PROGRAMADO';
  }

  return { valid: Object.keys(errors).length === 0, errors, normalized: out };
}

export default validateEventoForm;
