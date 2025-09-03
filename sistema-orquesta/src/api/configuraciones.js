// Aquí centralizamos configuraciones del sistema, roles y usuarios

import axios from "axios";

const API = "http://localhost:4000";

// Obtener usuarios
export const getUsuarios = () => axios.get(`${API}/usuarios`);

// Crear usuario
export const createUsuario = (data) => axios.post(`${API}/usuarios`, data);

// Editar usuario
export const updateUsuario = (id, data) => axios.put(`${API}/usuarios/${id}`, data);

// Eliminar usuario
export const deleteUsuario = (id) => axios.delete(`${API}/usuarios/${id}`);
