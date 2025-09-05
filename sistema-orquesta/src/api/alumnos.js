// Centraliza todas las llamadas al backend para alumnos
import axios from "axios";

const API = "http://localhost:4000";

// ▶️ Listar alumnos (opcional: filtros ?q=, ?estado=, ?programa_id=)
export const getAlumnos = (params = {}) =>
  axios.get(`${API}/alumnos`, { params });

// ▶️ Crear alumno (incluye programa_ids: number[])
export const createAlumno = (data) =>
  axios.post(`${API}/alumnos`, data);

// ▶️ Actualizar alumno (incluye programa_ids: number[])
export const updateAlumno = (id, data) =>
  axios.put(`${API}/alumnos/${id}`, data);

// ▶️ Eliminar
export const deleteAlumno = (id) =>
  axios.delete(`${API}/alumnos/${id}`);

// ▶️ Programas
export const getProgramas = () =>
  axios.get(`${API}/programas`);
