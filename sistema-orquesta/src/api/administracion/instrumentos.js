// src/api/administracion/instrumentos.js
import { http } from "../http";
const API = "/administracion/instrumentos";

export const getInstrumentos = () => http.get(API);
export const createInstrumento = (data) => http.post(API, data);
export const updateInstrumento = (id, data) => http.put(`${API}/${id}`, data);
export const deleteInstrumento = (id) => http.delete(`${API}/${id}`);
