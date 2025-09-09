// src/api/representantes.js
import axios from "axios";

const API = "http://localhost:4000";

// === Representantes CRUD ===
export const getRepresentantes = () => axios.get(`${API}/representantes`);
export const createRepresentante = (data) => axios.post(`${API}/representantes`, data); 
export const updateRepresentante = (id, data) => axios.put(`${API}/representantes/${id}`, data);
export const deleteRepresentante = (id) => axios.delete(`${API}/representantes/${id}`);