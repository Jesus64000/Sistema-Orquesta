import axios from "axios";

const API_URL = "http://localhost:4000/reportes";

// -------------------- ALUMNOS --------------------
export const getAlumnosTotal = () => axios.get(`${API_URL}/alumnos-total`);
export const getAlumnosActivos = () => axios.get(`${API_URL}/alumnos-activos`);
export const getAlumnosInactivos = () => axios.get(`${API_URL}/alumnos-inactivos`);
export const getAlumnosPorPrograma = () => axios.get(`${API_URL}/alumnos-por-programa`);
export const getAlumnosPorEdad = (programa) =>
  programa && programa !== "todos"
    ? axios.get(`${API_URL}/alumnos-por-edad`, { params: { programa } })
    : axios.get(`${API_URL}/alumnos-por-edad`);
export const getAlumnosPorGenero = (programa) =>
  programa && programa !== "todos"
    ? axios.get(`${API_URL}/alumnos-por-genero`, { params: { programa } })
    : axios.get(`${API_URL}/alumnos-por-genero`);

// -------------------- INSTRUMENTOS --------------------
export const getInstrumentosTotal = () => axios.get(`${API_URL}/instrumentos-total`);
export const getInstrumentosPorEstado = (id_estado, id_categoria) => {
  const params = {};
  if (id_estado && id_estado !== "todos") params.id_estado = id_estado;
  if (id_categoria && id_categoria !== "todos") params.id_categoria = id_categoria;
  return axios.get(`${API_URL}/instrumentos-por-estado`, Object.keys(params).length ? { params } : undefined);
};
export const getInstrumentosPorCategoria = (id_categoria, id_estado) => {
  const params = {};
  if (id_categoria && id_categoria !== "todos") params.id_categoria = id_categoria;
  if (id_estado && id_estado !== "todos") params.id_estado = id_estado;
  return axios.get(`${API_URL}/instrumentos-por-categoria`, Object.keys(params).length ? { params } : undefined);
};
export const getInstrumentosTopAsignados = () => axios.get(`${API_URL}/instrumentos-top-asignados`);

// -------------------- REPRESENTANTES --------------------
export const getRepresentantesTotal = () => axios.get(`${API_URL}/representantes-total`);
export const getRepresentantesPorAlumnos = () => axios.get(`${API_URL}/representantes-por-alumnos`);

// -------------------- EVENTOS --------------------
export const getEventosTotal = () => axios.get(`${API_URL}/eventos-total`);
export const getEventosPorMes = () => axios.get(`${API_URL}/eventos-por-mes`);

// -------------------- USUARIOS --------------------
export const getUsuariosTotal = () => axios.get(`${API_URL}/usuarios-total`);
export const getUsuariosPorRol = () => axios.get(`${API_URL}/usuarios-por-rol`);

// Comparativa alumnos por programa entre dos años
export const getAlumnosPorProgramaAnio = (anio1, anio2) =>
  axios.get(`${API_URL}/alumnos-por-programa-anio`, {
    params: { anio1, anio2 }
  });