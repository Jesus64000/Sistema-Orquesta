import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Alumnos por programa (evita duplicados y agrupa explícito)
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

// Instrumentos por estado (maneja estado nulo)
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

export default router;