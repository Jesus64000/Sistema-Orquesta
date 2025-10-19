// src/api/programas.js
// Consultas relacionadas con Programas

import { http } from './http';

// Listar programas (devuelve body normalizado)
export const getProgramas = async () => {
	const res = await http.get(`/programas`);
	const data = res.data;
	// Normalizar formas comunes: array directo o { value: [...] }
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.value)) return data.value;
	return [];
};
