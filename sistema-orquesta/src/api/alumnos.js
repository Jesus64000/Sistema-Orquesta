// src/api/alumnos.js
import { http } from './http';

// === Alumnos CRUD ===
export const getAlumnos = () => http.get(`/alumnos`);
export const createAlumno = (data) => http.post(`/alumnos`, data);
export const updateAlumno = (id, data) => http.put(`/alumnos/${id}`, data);
export const deleteAlumno = (id) => http.delete(`/alumnos/${id}`);

// === Obtener detalle de un alumno ===
export const getAlumno = (id) => http.get(`/alumnos/${id}`);


// === Programas ===
export const getProgramas = () => http.get(`/programas`);

// === Historial de alumno ===
export const getAlumnoHistorial = (id) =>
  http.get(`/alumnos/${id}/historial`);

export const addAlumnoHistorial = (id, data) =>
  http.post(`/alumnos/${id}/historial`, data);

// === Instrumento de alumno ===
export const getAlumnoInstrumento = (id) =>
  http.get(`/alumnos/${id}/instrumento`);

export const asignarInstrumentoAlumno = (id, data) =>
  http.post(`/alumnos/${id}/instrumento`, data);

export const liberarInstrumentoAlumno = (id) =>
  http.delete(`/alumnos/${id}/instrumento`);

// === Exportar alumnos CSV ===
export const exportAlumnosCSV = () =>
  http.get(`/alumnos/export/csv`, { responseType: "blob" });

// === Exportar alumnos seleccionados (CSV masivo) ===
export const exportAlumnosMasivoCSV = (ids = []) =>
  http.post(
    `/alumnos/export-masivo`,
    { ids, format: "csv" },
    { responseType: "blob" }
  );

// === Importar alumnos (CSV/Excel) ===
// Espera un FormData con el archivo bajo la clave 'file' y opciones adicionales si aplica.
// Nota: El backend debe exponer POST /alumnos/import para procesar el archivo.
export const importAlumnos = (formData) =>
  http.post(`/alumnos/import-masivo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// === Exportar alumnos multi-formato ===
// format: 'csv' | 'xlsx' | 'pdf' (admite alias 'excel', 'xls')
// ids opcional: si se omite o vacío, exporta todos (hasta límite del backend)
export const exportAlumnos = ({ ids = [], format = 'csv' } = {}) =>
  http.post(
    `/alumnos/export`,
    { ids, format },
    { responseType: 'blob' }
  );

// === Acciones masivas ===
export const bulkEstadoAlumnos = ({ ids = [], estado, usuario = 'sistema' }) =>
  http.put(`/alumnos/estado-masivo`, { ids, estado, usuario });

export const bulkProgramaAlumnos = ({ ids = [], id_programa, action = 'add', usuario = 'sistema' }) =>
  http.post(`/alumnos/programa-masivo`, { ids, id_programa, action, usuario });

export const bulkDesactivarAlumnos = ({ ids = [], usuario = 'sistema' }) =>
  http.post(`/alumnos/desactivar-masivo`, { ids, usuario });

// Verificar antes de desactivar (retorna bloqueados)
export const verifyDesactivarAlumnos = ({ ids = [] }) =>
  http.post(`/alumnos/verificar-desactivacion`, { ids });