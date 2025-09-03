// Aquí irán las llamadas para estadísticas rápidas y reportes

import axios from "axios";

const API = "http://localhost:4000";

// Ejemplo: alumnos por programa
export const getAlumnosPorPrograma = () =>
  axios.get(`${API}/reportes/alumnos-programa`);

// Ejemplo: instrumentos por estado
export const getInstrumentosPorEstado = () =>
  axios.get(`${API}/reportes/instrumentos-estado`);
