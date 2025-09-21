// src/api/administracion/instrumentos.js
import axios from "axios";
const API = "http://localhost:4000/administracion/instrumentos";

export const getInstrumentos = () => axios.get(API);
export const createInstrumento = (data) => axios.post(API, data);
export const updateInstrumento = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteInstrumento = (id) => axios.delete(`${API}/${id}`);
