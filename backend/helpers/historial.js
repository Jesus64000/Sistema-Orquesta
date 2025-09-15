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
export async function registrarHistorialInstrumento(id_instrumento, tipo, descripcion = '', usuario = 'sistema', id_alumno = null) {
  await pool.query(
    'INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario, id_alumno) VALUES (?, ?, ?, ?, ?)',
    [id_instrumento, tipo, descripcion, usuario, id_alumno]
  );
}

// Obtener historial de instrumentos con nombre de alumno
export async function obtenerHistorialInstrumento(id_instrumento) {
  const [rows] = await pool.query(
    `SELECT ih.id_historial, ih.tipo, ih.descripcion, ih.usuario, ih.creado_en,
            a.nombre AS nombre_alumno
     FROM Instrumento_Historial ih
     LEFT JOIN Alumno a ON ih.id_alumno = a.id_alumno
     WHERE ih.id_instrumento = ?
     ORDER BY ih.creado_en DESC`,
    [id_instrumento]
  );
  return rows;
}

export default {
  registrarHistorial,
  registrarHistorialInstrumento,
  obtenerHistorialInstrumento,
};
