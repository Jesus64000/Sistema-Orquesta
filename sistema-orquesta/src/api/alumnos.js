// src/api/alumnos.js
import axios from "axios";

const API = "http://localhost:4000";

// === Alumnos CRUD ===
export const getAlumnos = () => axios.get(`${API}/alumnos`);
export const createAlumno = (data) => axios.post(`${API}/alumnos`, data);
export const updateAlumno = (id, data) => axios.put(`${API}/alumnos/${id}`, data);
export const deleteAlumno = (id) => axios.delete(`${API}/alumnos/${id}`);

// === Programas ===
export const getProgramas = () => axios.get(`${API}/programas`);

// === Historial de alumno ===
export const getAlumnoHistorial = (id) =>
  axios.get(`${API}/alumnos/${id}/historial`);

export const addAlumnoHistorial = (id, data) =>
  axios.post(`${API}/alumnos/${id}/historial`, data);

// === Instrumento de alumno ===
export const getAlumnoInstrumento = (id) =>
  axios.get(`${API}/alumnos/${id}/instrumento`);

export const asignarInstrumentoAlumno = (id, data) =>
  axios.post(`${API}/alumnos/${id}/instrumento`, data);

export const liberarInstrumentoAlumno = (id) =>
  axios.delete(`${API}/alumnos/${id}/instrumento`);

// === Exportar alumnos CSV ===
export const exportAlumnosCSV = () =>
  axios.get(`${API}/alumnos/export/csv`, { responseType: "blob" });
