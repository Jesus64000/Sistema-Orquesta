import http from './http';

export async function listCargos() {
  const { data } = await http.get('/cargos');
  // Normalizar: si el backend negó acceso o retornó una forma no array, devolver []
  if (data && data._denied) return [];
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  return [];
}

export default { listCargos };
