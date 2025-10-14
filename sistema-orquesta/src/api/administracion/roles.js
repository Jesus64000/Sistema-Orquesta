// src/api/administracion/roles.js
import { http } from "../http";
const API = "/administracion/roles";

export const getRoles = () => http.get(API);
export const createRol = (data) => http.post(API, data);
export const updateRol = (id, data) => http.put(`${API}/${id}`, data);
export const deleteRol = (id) => http.delete(`${API}/${id}`);
