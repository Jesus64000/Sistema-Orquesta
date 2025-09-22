// src/api/alumnos.js
import axios from "axios";

const API = "http://localhost:4000";

// === Alumnos CRUD ===
export const getAlumnos = () => axios.get(`${API}/alumnos`);
export const createAlumno = (data) => axios.post(`${API}/alumnos`, data);
export const updateAlumno = (id, data) => axios.put(`${API}/alumnos/${id}`, data);
export const deleteAlumno = (id) => axios.delete(`${API}/alumnos/${id}`);

// === Obtener detalle de un alumno ===
export const getAlumno = (id) => axios.get(`${API}/alumnos/${id}`);


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

// === Exportación masiva (CSV/XLSX/PDF) ===
export const exportAlumnos = ({ ids, format = "csv" }) =>
  axios.post(
    `${API}/alumnos/export-masivo`,
    { ids, format },
    { responseType: "blob" }
  );

// === Importación masiva (CSV/XLSX) ===
export const importAlumnos = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${API}/alumnos/import-masivo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// === Acciones masivas ===
export const estadoMasivo = ({ ids, estado, usuario = "sistema" }) =>
  axios.put(`${API}/alumnos/estado-masivo`, { ids, estado, usuario });

export const programaMasivo = ({ ids, id_programa, action }) =>
  axios.post(`${API}/alumnos/programa-masivo`, { ids, id_programa, action });

export const desactivarMasivo = ({ ids, usuario = 'sistema' }) =>
  axios.post(`${API}/alumnos/desactivar-masivo`, { ids, usuario });