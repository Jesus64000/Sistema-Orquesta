// src/api/eventos.js
import axios from "axios";

const API = "http://localhost:4000";

// Obtener eventos
export const getEventos = async () => {
  const res = await axios.get(`${API}/eventos`);
  return res.data;
};

// Crear evento
export const createEvento = async (data) => {
  const res = await axios.post(`${API}/eventos`, data);
  return res.data;
};

// Editar evento
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
export const getEventosFuturos = async () => {
  const res = await axios.get(`${API}/eventos/futuros`);
  return res.data;
};

export const getEventosPasados = async () => {
  const res = await axios.get(`${API}/eventos/pasados`);
  return res.data;
};
