// API para temas de personalización
import http from '../http';

export async function getTemasPersonalizacion() {
  return http.get('/personalizacion');
}

export async function guardarTemaPersonalizacion({ name, theme }) {
  return http.post('/personalizacion', { name, theme });
}

export async function eliminarTemaPersonalizacion(name) {
  return http.delete(`/personalizacion/${encodeURIComponent(name)}`);
}
