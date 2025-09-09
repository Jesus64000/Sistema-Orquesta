// src/api/eventos.js
// Llamadas al backend para eventos

import axios from "axios";

const API = "http://localhost:4000";

// Obtener eventos
export const getEventos = () => axios.get(`${API}/eventos`);

// Crear evento
export const createEvento = (data) => axios.post(`${API}/eventos`, data);

// Editar evento
export const updateEvento = (id, data) =>
  axios.put(`${API}/eventos/${id}`, data);

// Eliminar evento
export const deleteEvento = (id) =>
  axios.delete(`${API}/eventos/${id}`);

// Eventos futuros (para el calendario)
export const getEventosFuturos = () => axios.get(`${API}/eventos/futuros`);