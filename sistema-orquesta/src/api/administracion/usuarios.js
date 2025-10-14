// src/api/administracion/usuarios.js
import { http } from "../http";
const API = "/administracion/usuarios";

export const getUsuarios = () => http.get(API);
export const createUsuario = (data) => http.post(API, data);
export const updateUsuario = (id, data) => http.put(`${API}/${id}`, data);
export const deleteUsuario = (id) => http.delete(`${API}/${id}`);
