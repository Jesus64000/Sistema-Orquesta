import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// -------------------- ALUMNOS --------------------

// Total de alumnos
router.get('/alumnos-total', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/alumnos-total:', err);
    res.status(500).json({ error: err.message });
  }
});

// Alumnos activos
router.get('/alumnos-activos', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno WHERE estado='Activo'`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/alumnos-activos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Alumnos inactivos
router.get('/alumnos-inactivos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM Alumno 
      WHERE estado IN ('Inactivo','Retirado')
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/alumnos-inactivos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Alumnos por programa
router.get('/alumnos-por-programa', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_programa, p.nombre AS programa, COUNT(DISTINCT ap.id_alumno) AS cantidad
      FROM Programa p
      LEFT JOIN alumno_programa ap ON p.id_programa = ap.id_programa
      GROUP BY p.id_programa, p.nombre
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error en /reportes/alumnos-por-programa:', err);
    res.status(500).json({ error: err.message });
  }
});

// Comparativa alumnos por programa entre dos años
router.get('/alumnos-por-programa-anio', async (req, res) => {
  const { anio1, anio2 } = req.query;
  if (!anio1 || !anio2) return res.status(400).json({ error: 'Faltan años en query' });

  try {
    const [rows] = await pool.query(`
      SELECT p.nombre AS programa,
        SUM(CASE WHEN YEAR(a.fecha_creacion) = ? THEN 1 ELSE 0 END) AS cantidad_anio1,
        SUM(CASE WHEN YEAR(a.fecha_creacion) = ? THEN 1 ELSE 0 END) AS cantidad_anio2
      FROM Programa p
      LEFT JOIN alumno_programa ap ON p.id_programa = ap.id_programa
      LEFT JOIN Alumno a ON ap.id_alumno = a.id_alumno
      GROUP BY p.id_programa, p.nombre
      ORDER BY p.nombre
    `, [anio1, anio2]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alumnos por edad
router.get('/alumnos-por-edad', async (req, res) => {
  const { programa } = req.query;
  try {
    let query = `
      SELECT 
        CASE
          WHEN TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) < 7 THEN '<7'
          WHEN TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) BETWEEN 7 AND 12 THEN '7-12'
          WHEN TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) BETWEEN 13 AND 18 THEN '13-18'
          WHEN TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) BETWEEN 19 AND 24 THEN '19-24'
          WHEN TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) BETWEEN 25 AND 30 THEN '25-30'
          ELSE '30+' 
        END AS edad,
        COUNT(DISTINCT a.id_alumno) AS cantidad
      FROM Alumno a
      INNER JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno
      INNER JOIN Programa p ON ap.id_programa = p.id_programa
    `;
    const params = [];
    if (programa) {
      query += ' WHERE p.nombre = ?';
      params.push(programa);
    }
    query += ' GROUP BY edad ORDER BY edad';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alumnos por género
router.get('/alumnos-por-genero', async (req, res) => {
  const { programa } = req.query;
  try {
    let query = `
      SELECT a.genero, COUNT(DISTINCT a.id_alumno) AS cantidad
      FROM Alumno a
      INNER JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno
      INNER JOIN Programa p ON ap.id_programa = p.id_programa
    `;
    const params = [];
    if (programa) {
      query += ' WHERE p.nombre = ?';
      params.push(programa);
    }
    query += ' GROUP BY a.genero';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- INSTRUMENTOS --------------------

// Total de instrumentos
router.get('/instrumentos-total', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Instrumento`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/instrumentos-total:', err);
    res.status(500).json({ error: err.message });
  }
});

// Instrumentos por estado
router.get('/instrumentos-por-estado', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COALESCE(estado, 'Desconocido') AS estado, COUNT(id_instrumento) AS cantidad
      FROM Instrumento
      GROUP BY COALESCE(estado, 'Desconocido')
      ORDER BY estado
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error en /reportes/instrumentos-por-estado:', err);
    res.status(500).json({ error: err.message });
  }
});

// Instrumentos por categoría
router.get('/instrumentos-por-categoria', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.nombre AS categoria, COUNT(i.id_instrumento) AS cantidad
      FROM Instrumento i
      LEFT JOIN categoria c ON i.id_categoria = c.id_categoria
      GROUP BY c.nombre
      ORDER BY cantidad DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error en /reportes/instrumentos-por-categoria:', err);
    res.status(500).json({ error: err.message });
  }
});

// Instrumentos más utilizados / top 5 asignados
router.get('/instrumentos-top-asignados', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.id_instrumento, i.nombre, COUNT(ai.id_asignacion) AS veces_asignado
      FROM Instrumento i
      LEFT JOIN asignacion_instrumento ai 
        ON i.id_instrumento = ai.id_instrumento AND ai.estado = 'Activo'
      GROUP BY i.id_instrumento, i.nombre
      ORDER BY veces_asignado DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- REPRESENTANTES --------------------

// Total de representantes
router.get('/representantes-total', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Representante`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/representantes-total:', err);
    res.status(500).json({ error: err.message });
  }
});

// Representantes por cantidad de alumnos asociados
router.get('/representantes-por-alumnos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_representante, r.nombre, COUNT(a.id_alumno) AS cantidad_alumnos
      FROM Representante r
      LEFT JOIN Alumno a ON r.id_representante = a.id_representante
      GROUP BY r.id_representante, r.nombre
      ORDER BY cantidad_alumnos DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- EVENTOS --------------------

// Total de eventos
router.get('/eventos-total', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Evento`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/eventos-total:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eventos por mes (para gráficos de tendencia)
router.get('/eventos-por-mes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha_evento, '%Y-%m') AS mes, COUNT(*) AS cantidad
      FROM Evento
      GROUP BY mes
      ORDER BY mes
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- USUARIOS --------------------

// Total de usuarios
router.get('/usuarios-total', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM Usuario`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error en /reportes/usuarios-total:', err);
    res.status(500).json({ error: err.message });
  }
});

// Usuarios por rol
router.get('/usuarios-por-rol', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT rol, COUNT(*) AS cantidad
      FROM Usuario
      GROUP BY rol
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error en /reportes/usuarios-por-rol:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
