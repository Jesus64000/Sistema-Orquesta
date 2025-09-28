// src/api/representantes.js
import axios from "axios";

const API = "http://localhost:4000";

// === Representantes CRUD ===
export const getRepresentantes = () => axios.get(`${API}/representantes`);
export const getRepresentante = (id) => axios.get(`${API}/representantes/${id}`); // detalle
export const createRepresentante = (data) => axios.post(`${API}/representantes`, data); 
export const updateRepresentante = (id, data) => axios.put(`${API}/representantes/${id}`, data);
export const deleteRepresentante = (id) => axios.delete(`${API}/representantes/${id}`);

// Parentescos (administración) - lectura para el formulario
export const getParentescos = () => axios.get(`${API}/administracion/parentescos`);

// Exportar representantes (csv/xlsx/pdf) - ids opcionales
export const exportRepresentantes = async ({ ids = [], format = 'csv', search = '' } = {}) => {
	const expectsBlob = ['csv','xlsx','excel','pdf'].includes(format);
	const res = await axios.post(
		`${API}/representantes/export`,
		{ ids, format, search },
		{ responseType: expectsBlob ? 'blob' : 'json' }
	);
	return res.data; // blob
};