// src/api/administracion/estados.js
import { http } from "../http";
const API = "/administracion/estados";

export const getEstados = () => http.get(API);
export const createEstado = (data) => http.post(API, data);
export const updateEstado = (id, data) => http.put(`${API}/${id}`, data);
export const deleteEstado = (id) => http.delete(`${API}/${id}`);
