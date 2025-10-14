// src/api/administracion/programas.js
import { http } from "../http";
const API = "/administracion/programas";

export const getProgramas = () => http.get(API);
export const createPrograma = (data) => http.post(API, data);
export const updatePrograma = (id, data) => http.put(`${API}/${id}`, data);
export const deletePrograma = (id) => http.delete(`${API}/${id}`);
