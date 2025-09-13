// backend/helpers/alumnos.js
import pool from '../db.js';

/**
 * Obtener programas para una lista de alumnos
 */
async function fetchProgramasPorAlumnos(idsAlumnos) {
  if (!idsAlumnos || idsAlumnos.length === 0) return [];
  const [rows] = await pool.query(
    `SELECT ap.id_alumno, p.id_programa, p.nombre
     FROM alumno_programa ap
     JOIN Programa p ON ap.id_programa = p.id_programa
     WHERE ap.id_alumno IN (?)`,
    [idsAlumnos]
  );
  return rows;
}
/**
 * Reutilizable: obtener alumnos con programas (filtros)
 */
async function fetchAlumnosWithPrograms({ search, estado, programa_id, ids } = {}) {
  const params = [];
  const where = [];

  if (search) {
    where.push("(a.nombre LIKE ? OR a.telefono_contacto LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (estado) {
    where.push("a.estado = ?");
    params.push(estado);
  }
  if (ids && Array.isArray(ids) && ids.length) {
    where.push("a.id_alumno IN (?)");
    params.push(ids);
  }

  const joinProgramFilter = programa_id ? "JOIN alumno_programa apf ON a.id_alumno = apf.id_alumno" : "";

  const sql = `
    SELECT DISTINCT a.*
    FROM Alumno a
    ${joinProgramFilter}
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY a.nombre ASC
    LIMIT 5000
  `;

  if (programa_id) params.push(programa_id);

  const [alumnosRows] = await pool.query(sql, params);
  const idsFound = alumnosRows.map((r) => r.id_alumno);
  if (idsFound.length === 0) return [];

  const [programasRows] = await pool.query(
    `SELECT ap.id_alumno, p.id_programa, p.nombre
     FROM alumno_programa ap
     JOIN Programa p ON ap.id_programa = p.id_programa
     WHERE ap.id_alumno IN (?)`,
    [idsFound]
  );

  const mapProg = {};
  for (const pr of programasRows) {
    if (!mapProg[pr.id_alumno]) mapProg[pr.id_alumno] = [];
    mapProg[pr.id_alumno].push({ id_programa: pr.id_programa, nombre: pr.nombre });
  }

  return alumnosRows.map((a) => ({ ...a, programas: mapProg[a.id_alumno] || [] }));
}

export default {
  fetchProgramasPorAlumnos,
  fetchAlumnosWithPrograms,
};