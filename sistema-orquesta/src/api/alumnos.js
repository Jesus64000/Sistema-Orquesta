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

// === Exportar alumnos CSV ===
export const exportAlumnosCSV = () =>
  axios.get(`${API}/alumnos/export/csv`, { responseType: "blob" });

// === Exportar alumnos seleccionados (CSV masivo) ===
export const exportAlumnosMasivoCSV = (ids = []) =>
  axios.post(
    `${API}/alumnos/export-masivo`,
    { ids, format: "csv" },
    { responseType: "blob" }
  );

// === Importar alumnos (CSV/Excel) ===
// Espera un FormData con el archivo bajo la clave 'file' y opciones adicionales si aplica.
// Nota: El backend debe exponer POST /alumnos/import para procesar el archivo.
export const importAlumnos = (formData) =>
  axios.post(`${API}/alumnos/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// === Exportar alumnos multi-formato ===
// format: 'csv' | 'xlsx' | 'pdf' (admite alias 'excel', 'xls')
// ids opcional: si se omite o vacío, exporta todos (hasta límite del backend)
export const exportAlumnos = ({ ids = [], format = 'csv' } = {}) =>
  axios.post(
    `${API}/alumnos/export`,
    { ids, format },
    { responseType: 'blob' }
  );

// === Acciones masivas ===
export const bulkEstadoAlumnos = ({ ids = [], estado, usuario = 'sistema' }) =>
  axios.put(`${API}/alumnos/estado-masivo`, { ids, estado, usuario });

export const bulkProgramaAlumnos = ({ ids = [], id_programa, action = 'add', usuario = 'sistema' }) =>
  axios.post(`${API}/alumnos/programa-masivo`, { ids, id_programa, action, usuario });

export const bulkDesactivarAlumnos = ({ ids = [], usuario = 'sistema' }) =>
  axios.post(`${API}/alumnos/desactivar-masivo`, { ids, usuario });

// Verificar antes de desactivar (retorna bloqueados)
export const verifyDesactivarAlumnos = ({ ids = [] }) =>
  axios.post(`${API}/alumnos/verificar-desactivacion`, { ids });