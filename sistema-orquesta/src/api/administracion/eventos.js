// src/api/administracion/eventos.js
import axios from "axios";
const API = "http://localhost:4000/administracion/eventos";

export const getEventos = () => axios.get(API);
export const createEvento = (data) => axios.post(API, data);
export const updateEvento = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteEvento = (id) => axios.delete(`${API}/${id}`);
