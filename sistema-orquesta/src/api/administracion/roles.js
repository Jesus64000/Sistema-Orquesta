// src/api/administracion/roles.js
import axios from "axios";
const API = "http://localhost:4000/administracion/roles";

export const getRoles = () => axios.get(API);
export const createRol = (data) => axios.post(API, data);
export const updateRol = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteRol = (id) => axios.delete(`${API}/${id}`);
