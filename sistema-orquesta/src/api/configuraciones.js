// sistema-orquesta/src/api/configuraciones.js
// Aquí centralizamos configuraciones del sistema, roles y usuarios

import { http } from './http';

// Obtener usuarios
export const getUsuarios = () => http.get(`/usuarios`);

// Crear usuario
export const createUsuario = (data) => http.post(`/usuarios`, data);

// Editar usuario
export const updateUsuario = (id, data) => http.put(`/usuarios/${id}`, data);

// Eliminar usuario
export const deleteUsuario = (id) => http.delete(`/usuarios/${id}`);
