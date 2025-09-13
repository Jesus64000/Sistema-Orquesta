// backend/helpers/historial.js
import pool from '../db.js';

// Historial de alumnos
export async function registrarHistorial(id_alumno, tipo, descripcion = '', usuario = 'sistema') {
  await pool.query(
    'INSERT INTO Alumno_Historial (id_alumno, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)',
    [id_alumno, tipo, descripcion, usuario]
  );
}

// Historial de instrumentos
export async function registrarHistorialInstrumento(id_instrumento, tipo, descripcion = '', usuario = 'sistema') {
  await pool.query(
    'INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)',
    [id_instrumento, tipo, descripcion, usuario]
  );
}

export default {
  registrarHistorial,
  registrarHistorialInstrumento,
};