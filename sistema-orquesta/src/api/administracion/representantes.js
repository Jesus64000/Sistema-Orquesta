// src/api/administracion/representantes.js
import axios from "axios";
const API = "http://localhost:4000/administracion/representantes";

export const getRepresentantes = () => axios.get(API);
export const createRepresentante = (data) => axios.post(API, data);
export const updateRepresentante = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteRepresentante = (id) => axios.delete(`${API}/${id}`);
