// Utilidades de validación y helpers para InstrumentoForm
// Inspirado en alumnoFormUtils pero adaptado a campos de instrumentos

export function normalizaTexto(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

export function calcularAntiguedad(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d)) return null;
  const ahora = new Date();
  let anios = ahora.getFullYear() - d.getFullYear();
  const mDiff = ahora.getMonth() - d.getMonth();
  if (mDiff < 0 || (mDiff === 0 && ahora.getDate() < d.getDate())) anios--;
  if (anios < 0) return 0;
  return anios;
}

export function validateInstrumentoForm(form) {
  const errors = {};

  const nombre = normalizaTexto(form.nombre);
  if (!nombre) errors.nombre = "Nombre requerido";
  else if (nombre.length < 2) errors.nombre = "Mínimo 2 caracteres";

  if (!form.id_categoria) errors.id_categoria = "Selecciona una categoría";
  if (!form.id_estado) errors.id_estado = "Selecciona un estado";

  const numeroSerie = normalizaTexto(form.numero_serie || "");
  if (!numeroSerie) errors.numero_serie = "Número de serie requerido";
  else if (numeroSerie.length < 3) errors.numero_serie = "Mínimo 3 caracteres";

  if (form.fecha_adquisicion) {
    const d = new Date(form.fecha_adquisicion);
    if (isNaN(d)) errors.fecha_adquisicion = "Fecha inválida";
    else {
      const hoy = new Date();
      if (d > hoy) errors.fecha_adquisicion = "No puede ser futura";
    }
  }

  const ubicacion = normalizaTexto(form.ubicacion || "");
  if (ubicacion && ubicacion.length < 2) errors.ubicacion = "Mínimo 2 caracteres";

  return { errors, isValid: Object.keys(errors).length === 0, normalizado: { ...form, nombre, numero_serie: numeroSerie, ubicacion } };
}
