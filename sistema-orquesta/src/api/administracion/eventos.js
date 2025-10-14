// src/api/administracion/eventos.js
import { http } from "../http";
const API = "/administracion/eventos";

export const getEventos = () => http.get(API);
export const createEvento = (data) => http.post(API, data);
export const updateEvento = (id, data) => http.put(`${API}/${id}`, data);
export const deleteEvento = (id) => http.delete(`${API}/${id}`);
