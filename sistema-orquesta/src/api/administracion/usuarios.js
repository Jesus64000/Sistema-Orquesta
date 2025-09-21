// src/api/administracion/usuarios.js
import axios from "axios";
const API = "http://localhost:4000/administracion/usuarios";

export const getUsuarios = () => axios.get(API);
export const createUsuario = (data) => axios.post(API, data);
export const updateUsuario = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteUsuario = (id) => axios.delete(`${API}/${id}`);
