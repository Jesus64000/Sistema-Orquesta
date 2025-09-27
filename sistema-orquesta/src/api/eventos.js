// src/api/eventos.js
import axios from "axios";

const API = "http://localhost:4000";

export const EVENTO_ESTADOS = ['PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO'];

// Obtener eventos (con filtros opcionales)
export const getEventos = async (params = {}) => {
  const res = await axios.get(`${API}/eventos`, { params });
  return res.data;
};

// Búsqueda predictiva
export const suggestEventos = async (q, limit = 8) => {
  if (!q || q.trim().length < 2) return [];
  const res = await axios.get(`${API}/eventos/suggest`, { params: { q, limit } });
  return res.data;
};

// Obtener historial de un evento
export const getEventoHistorial = async (id_evento) => {
  if (!id_evento) return [];
  const res = await axios.get(`${API}/eventos/${id_evento}/historial`);
  return res.data;
};

// Crear evento (estado opcional, default PROGRAMADO)
export const createEvento = async (data) => {
  const payload = { ...data };
  if (!payload.estado) payload.estado = 'PROGRAMADO';
  const res = await axios.post(`${API}/eventos`, payload);
  return res.data;
};

// Editar evento (permitir cambiar estado)
export const updateEvento = async (id, data) => {
  const res = await axios.put(`${API}/eventos/${id}`, data);
  return res.data;
};

// Eliminar evento
export const deleteEvento = async (id) => {
  const res = await axios.delete(`${API}/eventos/${id}`);
  return res.data;
};

// ✅ Eventos futuros y pasados con API base
export const getEventosFuturos = async (programaId) => {
  const res = await axios.get(`${API}/eventos/futuros`, {
    params: programaId ? { programa_id: programaId } : {},
  });
  return res.data;
};

export const getEventosPasados = async () => {
  const res = await axios.get(`${API}/eventos/pasados`);
  return res.data;
};

// Exportar eventos (ids opcionales, formato 'csv' default)
export const exportEventos = async ({ ids = [], format = 'csv', search = '' } = {}) => {
  const expectsBlob = ['csv','xlsx','excel','pdf'].includes(format);
  const res = await axios.post(
    `${API}/eventos/export`,
    { ids, format, search },
    { responseType: expectsBlob ? 'blob' : 'json' }
  );
  return res.data; // siempre blob en nuestros formatos
};
