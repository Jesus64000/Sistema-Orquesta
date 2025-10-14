// src/api/programas.js
// Consultas relacionadas con Programas

import { http } from './http';

// Listar programas
export const getProgramas = () => http.get(`/programas`);
