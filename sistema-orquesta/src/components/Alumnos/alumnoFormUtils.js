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
  let fechaNacimientoDate = null;
  // Nombre: solo letras (incluye acentos) y espacios, mínimo 2 caracteres significativos
  if (!fd.nombre || fd.nombre.trim().length < 2) {
    e.nombre = "Nombre mínimo 2 caracteres";
  } else {
    const nombre = String(fd.nombre).trim();
    if (!/^[\p{L} ]+$/u.test(nombre)) {
      e.nombre = "Solo letras y espacios";
    }
  }
  // CI opcional: si se provee, numérica de al menos 6
  if (fd.ci) {
    const ciStr = String(fd.ci).trim();
    if (!/^\d{6,}$/.test(ciStr)) {
      e.ci = "CI numérica (mínimo 6 dígitos)";
    }
  }
  if (!fd.fecha_nacimiento) e.fecha_nacimiento = "Fecha requerida"; else {
    const d = new Date(fd.fecha_nacimiento + 'T00:00:00');
    if (isNaN(d.getTime())) e.fecha_nacimiento = "Fecha inválida"; else if (d > new Date()) e.fecha_nacimiento = "No puede ser futura"; else fechaNacimientoDate = d;
  }
  if (!Array.isArray(fd.programa_ids) || fd.programa_ids.length === 0) e.programa_ids = "Selecciona al menos un programa";
  if (fd.programa_ids && fd.programa_ids.length > 2) e.programa_ids = "Máximo 2 programas";
  if (fd.telefono_contacto) {
    const raw = String(fd.telefono_contacto).trim();
    // Solo dígitos y opcional '+' al inicio
    if (!/^\+?\d+$/.test(raw)) {
      e.telefono_contacto = "Solo dígitos; '+' solo al inicio";
    } else if (raw.replace(/\D/g, '').length < 7) {
      e.telefono_contacto = "Teléfono demasiado corto";
    }
  }
  // Regla de negocio: menores de 18 años requieren al menos un representante principal
  if (fechaNacimientoDate) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
    const m = hoy.getMonth() - fechaNacimientoDate.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimientoDate.getDate())) edad--;
    if (edad < 18) {
      const tienePrincipal = Array.isArray(fd.representantes_links) && fd.representantes_links.some(r => r.principal);
      if (!tienePrincipal) e.id_representante = "Requerido representante principal (menor de edad)";
    }
  }
  return e;
}
