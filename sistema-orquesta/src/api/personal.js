import http from './http';

const base = '/personal';

export async function listPersonal(params = {}) {
  const { page = 1, pageSize = 20, texto, programa_id, cargo_id, estado } = params;
  const searchParams = new URLSearchParams();
  searchParams.set('page', page);
  searchParams.set('pageSize', pageSize);
  if (texto) searchParams.set('texto', texto);
  if (programa_id) searchParams.set('programa_id', programa_id);
  if (cargo_id) searchParams.set('cargo_id', cargo_id);
  if (estado) searchParams.set('estado', estado);
  const res = await http.get(`${base}?${searchParams.toString()}`);
  const data = res?.data;
  if (data && data._denied) {
    return { _denied: true, items: [], total: 0, page, pageSize };
  }
  return data;
}

export async function getPersonal(id) {
  const res = await http.get(`${base}/${id}`);
  if (res?.data && res.data._denied) return { _denied: true };
  return res.data;
}

export async function createPersonal(payload) {
  const { data } = await http.post(base, payload);
  return data;
}

export async function updatePersonal(id, payload) {
  const { data } = await http.put(`${base}/${id}`, payload);
  return data;
}

export async function removePersonal(id) {
  const { data } = await http.delete(`${base}/${id}`);
  return data;
}

export function exportPersonalCsv(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') searchParams.set(k, v);
  }
  const url = `${base}/export/csv?${searchParams.toString()}`;
  // Devolver URL para abrir en nueva pestaña/descargar
  return url;
}

// Exportación en blob usando el modal genérico. Por ahora solo CSV en backend.
export async function exportPersonal({ ids = [], format: _format = 'csv', texto = '', programa_id, cargo_id, estado } = {}) {
  // Forzar csv mientras no exista soporte para xlsx/pdf en el backend
  const fmt = _format === 'csv' ? 'csv' : 'csv';
  const searchParams = new URLSearchParams();
  if (Array.isArray(ids) && ids.length > 0) searchParams.set('ids', ids.join(','));
  if (texto) searchParams.set('texto', texto);
  if (programa_id) searchParams.set('programa_id', programa_id);
  if (cargo_id) searchParams.set('cargo_id', cargo_id);
  if (estado) searchParams.set('estado', estado);
  const url = `${base}/export/${fmt}?${searchParams.toString()}`;
  const res = await http.get(url, { responseType: 'blob' });
  return res.data; // Blob
}

export default {
  listPersonal,
  getPersonal,
  createPersonal,
  updatePersonal,
  removePersonal,
  exportPersonalCsv,
  exportPersonal,
};
