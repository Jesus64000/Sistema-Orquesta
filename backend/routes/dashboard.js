// backend/routes/dashboard.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const programa_id = req.query.programa_id || null;

    // totalAlumnos
    let totalAlumnos = 0;
    if (programa_id) {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total FROM alumno_programa ap WHERE ap.id_programa = ?`,
        [programa_id]
      );
      totalAlumnos = r[0]?.total ?? 0;
    } else {
      const [r] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno`);
      totalAlumnos = r[0]?.total ?? 0;
    }

    // activos
    let activos = 0;
    if (programa_id) {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN Alumno a ON ap.id_alumno = a.id_alumno
         WHERE ap.id_programa = ? AND a.estado = 'Activo'`,
        [programa_id]
      );
      activos = r[0]?.total ?? 0;
    } else {
      const [r] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno WHERE estado = 'Activo'`);
      activos = r[0]?.total ?? 0;
    }

    // nuevosHoy
    let nuevosHoy = 0;
    if (programa_id) {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN Alumno_Historial h ON ap.id_alumno = h.id_alumno
         WHERE ap.id_programa = ? AND DATE(h.creado_en) = CURDATE() AND h.tipo = 'CREACION'`,
        [programa_id]
      );
      nuevosHoy = r[0]?.total ?? 0;
    } else {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT id_alumno) AS total
         FROM Alumno_Historial
         WHERE DATE(creado_en) = CURDATE() AND tipo = 'CREACION'`
      );
      nuevosHoy = r[0]?.total ?? 0;
    }

    // personal (admins)
    const [p] = await pool.query(`SELECT COUNT(*) AS total FROM Usuario WHERE rol = 'Admin'`);
    const personal = p[0]?.total ?? 0;

    res.json({ totalAlumnos, activos, nuevosHoy, personal });
  } catch (err) {
    console.error('Error en /dashboard/stats:', err);
    res.status(500).json({ error: 'Error cargando estadísticas' });
  }
});

// Obtener próximo evento
router.get('/proximo-evento', async (req, res) => {
  try {
    const programa_id = req.query.programa_id || null;
      let query = `
        SELECT id_evento, titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa
        FROM Evento
        WHERE (fecha_evento > CURDATE())
          OR (fecha_evento = CURDATE() AND hora_evento >= CURTIME())
      `;
    const params = [];
    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }
    query += ' ORDER BY fecha_evento ASC, hora_evento ASC LIMIT 1';
    const [rows] = await pool.query(query, params);
    res.json(rows[0] || null);
  } catch (err) {
    console.error('Error en /dashboard/proximo-evento:', err);
    res.status(500).json({ error: 'Error cargando próximo evento' });
  }
});

// Obtener eventos futuros
router.get('/eventos-futuros', async (req, res) => {
  try {
    const programa_id = req.query.programa_id || null;
      let query = `
        SELECT id_evento, titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa
        FROM Evento
        WHERE (fecha_evento > CURDATE())
          OR (fecha_evento = CURDATE() AND hora_evento >= CURTIME())
        ORDER BY fecha_evento ASC, hora_evento ASC
      `;
    const params = [];
    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }
      query += ' ORDER BY fecha_evento ASC, hora_evento ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /dashboard/eventos-futuros:', err);
    res.status(500).json({ error: 'Error cargando eventos futuros' });
  }
});

// Obtener eventos del mes
router.get('/eventos-mes', async (req, res) => {
  try {
    const { year, month, programa_id } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'year y month son requeridos' });
    }
    let query = `
    SELECT id_evento, titulo, fecha_evento, hora_evento, lugar
    FROM Evento
    WHERE YEAR(fecha_evento)=? AND MONTH(fecha_evento)=?
    `;
    const params = [year, month];
    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }
    query += ' ORDER BY fecha_evento ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /dashboard/eventos-mes:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;