// src/api/administracion/categorias.js
import axios from "axios";
const API = "http://localhost:4000/administracion/categorias";

export const getCategorias = () => axios.get(API);
export const createCategoria = (data) => axios.post(API, data);
export const updateCategoria = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteCategoria = (id) => axios.delete(`${API}/${id}`);
