// src/api/instrumentos.js
// Maneja todas las peticiones HTTP relacionadas con instrumentos

import { http } from './http';

// Listar instrumentos
export const getInstrumentos = () => http.get(`/instrumentos`);

// Crear instrumento
export const createInstrumento = (data) => http.post(`/instrumentos`, data);

// Editar instrumento
export const updateInstrumento = (id, data) =>
  http.put(`/instrumentos/${id}`, data);

// Eliminar instrumento
export const deleteInstrumento = (id) => http.delete(`/instrumentos/${id}`);

// Obtener historial de un instrumento
export const getInstrumentoHistorial = (id) => http.get(`/instrumentos/${id}/historial`);

// Exportar instrumentos multi-formato
// format: 'csv' | 'xlsx' | 'pdf'; ids opcional para exportar seleccionados
export const exportInstrumentos = ({ ids = [], format = 'csv' } = {}) =>
  http.post(
    `/instrumentos/export`,
    { ids, format },
    { responseType: 'blob' }
  );

