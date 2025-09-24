// src/api/instrumentos.js
// Maneja todas las peticiones HTTP relacionadas con instrumentos

import axios from "axios";
const API = "http://localhost:4000";

// Listar instrumentos
export const getInstrumentos = () => axios.get(`${API}/instrumentos`);

// Crear instrumento
export const createInstrumento = (data) => axios.post(`${API}/instrumentos`, data);

// Editar instrumento
export const updateInstrumento = (id, data) =>
  axios.put(`${API}/instrumentos/${id}`, data);

// Eliminar instrumento
export const deleteInstrumento = (id) => axios.delete(`${API}/instrumentos/${id}`);

// Obtener historial de un instrumento
export const getInstrumentoHistorial = (id) => axios.get(`${API}/instrumentos/${id}/historial`);

// Exportar instrumentos multi-formato
// format: 'csv' | 'xlsx' | 'pdf'; ids opcional para exportar seleccionados
export const exportInstrumentos = ({ ids = [], format = 'csv' } = {}) =>
  axios.post(
    `${API}/instrumentos/export`,
    { ids, format },
    { responseType: 'blob' }
  );

