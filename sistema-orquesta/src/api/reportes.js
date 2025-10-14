import { http } from './http';

const API_BASE = "/reportes";

// -------------------- ALUMNOS --------------------
export const getAlumnosTotal = () => http.get(`${API_BASE}/alumnos-total`);
export const getAlumnosActivos = () => http.get(`${API_BASE}/alumnos-activos`);
export const getAlumnosInactivos = () => http.get(`${API_BASE}/alumnos-inactivos`);
export const getAlumnosPorPrograma = () => http.get(`${API_BASE}/alumnos-por-programa`);
export const getAlumnosPorEdad = (programa) =>
  programa && programa !== "todos"
  ? http.get(`${API_BASE}/alumnos-por-edad`, { params: { programa } })
  : http.get(`${API_BASE}/alumnos-por-edad`);
export const getAlumnosPorGenero = (programa) =>
  programa && programa !== "todos"
  ? http.get(`${API_BASE}/alumnos-por-genero`, { params: { programa } })
  : http.get(`${API_BASE}/alumnos-por-genero`);

// -------------------- INSTRUMENTOS --------------------
export const getInstrumentosTotal = () => http.get(`${API_BASE}/instrumentos-total`);
export const getInstrumentosPorEstado = (id_estado, id_categoria) => {
  const params = {};
  if (id_estado && id_estado !== "todos") params.id_estado = id_estado;
  if (id_categoria && id_categoria !== "todos") params.id_categoria = id_categoria;
  return http.get(`${API_BASE}/instrumentos-por-estado`, Object.keys(params).length ? { params } : undefined);
};
export const getInstrumentosPorCategoria = (id_categoria, id_estado) => {
  const params = {};
  if (id_categoria && id_categoria !== "todos") params.id_categoria = id_categoria;
  if (id_estado && id_estado !== "todos") params.id_estado = id_estado;
  return http.get(`${API_BASE}/instrumentos-por-categoria`, Object.keys(params).length ? { params } : undefined);
};
export const getInstrumentosTopAsignados = () => http.get(`${API_BASE}/instrumentos-top-asignados`);

// -------------------- REPRESENTANTES --------------------
export const getRepresentantesTotal = () => http.get(`${API_BASE}/representantes-total`);
export const getRepresentantesPorAlumnos = () => http.get(`${API_BASE}/representantes-por-alumnos`);

// -------------------- EVENTOS --------------------
export const getEventosTotal = () => http.get(`${API_BASE}/eventos-total`);
export const getEventosPorMes = () => http.get(`${API_BASE}/eventos-por-mes`);

// -------------------- USUARIOS --------------------
export const getUsuariosTotal = () => http.get(`${API_BASE}/usuarios-total`);
export const getUsuariosPorRol = () => http.get(`${API_BASE}/usuarios-por-rol`);

// Comparativa alumnos por programa entre dos años
export const getAlumnosPorProgramaAnio = (anio1, anio2) =>
  http.get(`${API_BASE}/alumnos-por-programa-anio`, {
    params: { anio1, anio2 }
  });