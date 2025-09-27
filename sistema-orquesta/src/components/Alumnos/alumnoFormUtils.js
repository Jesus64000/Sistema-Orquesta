// Utilidades compartidas para AlumnoForm
// Centraliza validaciones y normalización para facilitar testeo y reutilización.

export function normalizaTelefono(raw) {
  if (!raw) return "";
  let cleaned = raw.replace(/[^+\d]/g, '');
  if (cleaned.startsWith('+')) cleaned = '+' + cleaned.slice(1).replace(/\+/g, '');
  else cleaned = cleaned.replace(/\+/g, '');
  return cleaned;
}

export function validateAlumnoForm(fd) {
  const e = {};
  if (!fd.nombre || fd.nombre.trim().length < 2) e.nombre = "Nombre mínimo 2 caracteres";
  if (!fd.fecha_nacimiento) e.fecha_nacimiento = "Fecha requerida"; else {
    const d = new Date(fd.fecha_nacimiento + 'T00:00:00');
    if (isNaN(d.getTime())) e.fecha_nacimiento = "Fecha inválida"; else if (d > new Date()) e.fecha_nacimiento = "No puede ser futura";
  }
  if (!Array.isArray(fd.programa_ids) || fd.programa_ids.length === 0) e.programa_ids = "Selecciona al menos un programa";
  if (fd.programa_ids && fd.programa_ids.length > 2) e.programa_ids = "Máximo 2 programas";
  if (fd.telefono_contacto) {
    const cleaned = fd.telefono_contacto.replace(/[^+\d]/g, '');
    if (cleaned.replace(/\D/g, '').length < 7) e.telefono_contacto = "Teléfono demasiado corto";
  }
  return e;
}
