// src/api/usuarios.js
import { http } from './http';

export const updatePerfil = (data) => http.put('/usuarios/me', data);
export const changePassword = ({ actual, nueva }) => http.put('/usuarios/me/password', { actual, nueva });
export const resetPassword = (id, temp) => http.post(`/usuarios/${id}/reset-password`, temp ? { temp } : undefined);
export const setActivo = (id, activo) => http.put(`/usuarios/${id}/activo`, { activo });
