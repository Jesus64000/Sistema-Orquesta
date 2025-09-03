// Centraliza todas las llamadas al backend para alumnos

import axios from "axios";

const API = "http://localhost:4000";

// Obtener todos los alumnos (opcional: filtrar por programa_id)
export const getAlumnos = (programaId) =>
  axios.get(`${API}/alumnos`, {
    params: programaId ? { programa_id: programaId } : {},
  });

// Crear nuevo alumno
export const createAlumno = (data) => axios.post(`${API}/alumnos`, data);

// Editar alumno
export const updateAlumno = (id, data) =>
  axios.put(`${API}/alumnos/${id}`, data);

// Eliminar alumno
export const deleteAlumno = (id) => axios.delete(`${API}/alumnos/${id}`);
