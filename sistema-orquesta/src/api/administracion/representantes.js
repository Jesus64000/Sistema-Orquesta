// src/api/administracion/representantes.js
import { http } from "../http";
const API = "/administracion/representantes";

export const getRepresentantes = () => http.get(API);
export const createRepresentante = (data) => http.post(API, data);
export const updateRepresentante = (id, data) => http.put(`${API}/${id}`, data);
export const deleteRepresentante = (id) => http.delete(`${API}/${id}`);
