// src/api/administracion/programas.js
import axios from "axios";
const API = "http://localhost:4000/administracion/programas";

export const getProgramas = () => axios.get(API);
export const createPrograma = (data) => axios.post(API, data);
export const updatePrograma = (id, data) => axios.put(`${API}/${id}`, data);
export const deletePrograma = (id) => axios.delete(`${API}/${id}`);
