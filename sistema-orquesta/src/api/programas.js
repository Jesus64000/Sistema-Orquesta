// src/api/programas.js
// Consultas relacionadas con Programas

import axios from "axios";
const API = "http://localhost:4000";

// Listar programas
export const getProgramas = () => axios.get(`${API}/programas`);
