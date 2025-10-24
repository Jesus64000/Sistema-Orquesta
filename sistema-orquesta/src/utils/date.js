// Utilidades simples para manejo de fechas en inputs/detalles

// Devuelve 'YYYY-MM-DD' para inputs type="date"
export function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    // Si viene como ISO 'YYYY-MM-DDTHH:mm:ss.sssZ', tomar solo la parte de fecha
    if (value.includes('T')) return value.slice(0, 10);
    // Si ya viene como 'YYYY-MM-DD'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // Intentar parsear y normalizar
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return '';
  }
  if (value instanceof Date) {
    if (isNaN(value)) return '';
    return value.toISOString().slice(0, 10);
  }
  return '';
}

// Devuelve 'dd/MM/yyyy' para mostrar en detalles
export function formatDateDisplay(value) {
  if (!value) return '';
  let y = '', m = '', d = '';
  if (typeof value === 'string') {
    const s = value.includes('T') ? value.slice(0, 10) : value;
    const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m1) { y = m1[1]; m = m1[2]; d = m1[3]; }
    else {
      const dt = new Date(value);
      if (!isNaN(dt)) {
        const iso = dt.toISOString().slice(0, 10);
        y = iso.slice(0, 4); m = iso.slice(5, 7); d = iso.slice(8, 10);
      }
    }
  } else if (value instanceof Date && !isNaN(value)) {
    const iso = value.toISOString().slice(0, 10);
    y = iso.slice(0, 4); m = iso.slice(5, 7); d = iso.slice(8, 10);
  }
  if (!y) return '';
  return `${d}/${m}/${y}`;
}

export default { toDateInputValue, formatDateDisplay };
