// src/api/representantes.js
import { http } from './http';

// === Representantes CRUD ===
export const getRepresentantes = () => http.get(`/representantes`);
export const getRepresentante = (id) => http.get(`/representantes/${id}`); // detalle
export const createRepresentante = (data) => http.post(`/representantes`, data); 
export const updateRepresentante = (id, data) => http.put(`/representantes/${id}`, data);
export const deleteRepresentante = (id) => http.delete(`/representantes/${id}`);

// Parentescos (administración) - lectura para el formulario
export const getParentescos = () => http.get(`/administracion/parentescos`);

// Exportar representantes (csv/xlsx/pdf) - ids opcionales
export const exportRepresentantes = async ({ ids = [], format = 'csv', search = '' } = {}) => {
	const expectsBlob = ['csv','xlsx','excel','pdf'].includes(format);
	const res = await http.post(
		`/representantes/export`,
		{ ids, format, search },
		{ responseType: expectsBlob ? 'blob' : 'json' }
	);
	return res.data; // blob
};