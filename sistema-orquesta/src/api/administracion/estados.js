// src/api/administracion/estados.js
import axios from "axios";
const API = "http://localhost:4000/administracion/estados";

export const getEstados = () => axios.get(API);
export const createEstado = (data) => axios.post(API, data);
export const updateEstado = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteEstado = (id) => axios.delete(`${API}/${id}`);
