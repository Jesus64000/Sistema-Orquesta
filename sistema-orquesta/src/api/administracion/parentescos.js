import { http } from "../http";

export function listarParentescos(q) {
  const params = q ? { q } : undefined;
  return http.get(`/administracion/parentescos`, params ? { params } : undefined).then(r => r.data);
}

export function crearParentesco(data) {
  return http.post('/administracion/parentescos', data).then(r => r.data);
}

export function actualizarParentesco(id, data) {
  return http.put(`/administracion/parentescos/${id}`, data).then(r => r.data);
}

export function eliminarParentesco(id) {
  return http.delete(`/administracion/parentescos/${id}`).then(r => r.data);
}
