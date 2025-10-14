// src/api/administracion/categorias.js
import { http } from "../http";
const API = "/administracion/categorias";

export const getCategorias = () => http.get(API);
export const createCategoria = (data) => http.post(API, data);
export const updateCategoria = (id, data) => http.put(`${API}/${id}`, data);
export const deleteCategoria = (id) => http.delete(`${API}/${id}`);
