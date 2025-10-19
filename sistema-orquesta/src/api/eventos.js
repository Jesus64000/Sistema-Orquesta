// src/api/eventos.js
import { http } from './http';

export const EVENTO_ESTADOS = ['PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO'];

// Obtener eventos (con filtros opcionales)
export const getEventos = async (params = {}) => {
  const res = await http.get(`/eventos`, { params });
  return res.data;
};

// Búsqueda predictiva
export const suggestEventos = async (q, limit = 8) => {
  if (!q || q.trim().length < 2) return [];
  const res = await http.get(`/eventos/suggest`, { params: { q, limit } });
  return res.data;
};

// Obtener historial de un evento
export const getEventoHistorial = async (id_evento) => {
  if (!id_evento) return [];
  const res = await http.get(`/eventos/${id_evento}/historial`);
  return res.data;
};

// Crear evento (estado opcional, default PROGRAMADO)
export const createEvento = async (data) => {
  const payload = { ...data };
  if (!payload.estado) payload.estado = 'PROGRAMADO';
  const res = await http.post(`/eventos`, payload);
  return res.data;
};

// Editar evento (permitir cambiar estado)
export const updateEvento = async (id, data) => {
  const res = await http.put(`/eventos/${id}`, data);
  return res.data;
};

// Eliminar evento
export const deleteEvento = async (id) => {
  const res = await http.delete(`/eventos/${id}`);
  return res.data;
};

// ✅ Eventos futuros y pasados con API base
export const getEventosFuturos = async (programaId) => {
  const res = await http.get(`/eventos/futuros`, {
    params: programaId ? { programa_id: programaId } : {},
  });
  const data = res.data;
  // Normalizar: la API puede devolver directamente un array o un objeto { value: [...], Count }
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  return [];
};

export const getEventosPasados = async () => {
  const res = await http.get(`/eventos/pasados`);
  return res.data;
};

// Exportar eventos (ids opcionales, formato 'csv' default)
export const exportEventos = async ({ ids = [], format = 'csv', search = '' } = {}) => {
  const expectsBlob = ['csv','xlsx','excel','pdf'].includes(format);
  const res = await http.post(
    `/eventos/export`,
    { ids, format, search },
    { responseType: expectsBlob ? 'blob' : 'json' }
  );
  return res.data; // siempre blob en nuestros formatos
};
