// backend/routes/dashboard.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const programa_id = req.query.programa_id || null;

    // totalAlumnos y breakdown por estado
    let totalAlumnos = 0;
    let alumnosActivos = 0;
    let alumnosInactivos = 0;
    let alumnosRetirados = 0;
    if (programa_id) {
      const [rTotal] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total FROM alumno_programa ap WHERE ap.id_programa = ?`,
        [programa_id]
      );
      totalAlumnos = rTotal[0]?.total ?? 0;

      const [rAct] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN alumno a ON ap.id_alumno = a.id_alumno
         WHERE ap.id_programa = ? AND a.estado = 'Activo'`,
        [programa_id]
      );
      alumnosActivos = rAct[0]?.total ?? 0;

      const [rInac] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN alumno a ON ap.id_alumno = a.id_alumno
         WHERE ap.id_programa = ? AND a.estado = 'Inactivo'`,
        [programa_id]
      );
      alumnosInactivos = rInac[0]?.total ?? 0;

      const [rRet] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN alumno a ON ap.id_alumno = a.id_alumno
         WHERE ap.id_programa = ? AND a.estado = 'Retirado'`,
        [programa_id]
      );
      alumnosRetirados = rRet[0]?.total ?? 0;
    } else {
  const [rTotal] = await pool.query(`SELECT COUNT(*) AS total FROM alumno`);
      totalAlumnos = rTotal[0]?.total ?? 0;

  const [rAct] = await pool.query(`SELECT COUNT(*) AS total FROM alumno WHERE estado = 'Activo'`);
      alumnosActivos = rAct[0]?.total ?? 0;

  const [rInac] = await pool.query(`SELECT COUNT(*) AS total FROM alumno WHERE estado = 'Inactivo'`);
      alumnosInactivos = rInac[0]?.total ?? 0;

  const [rRet] = await pool.query(`SELECT COUNT(*) AS total FROM alumno WHERE estado = 'Retirado'`);
      alumnosRetirados = rRet[0]?.total ?? 0;
    }

    // activos (compatibilidad con UI actual)
    const activos = alumnosActivos;

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
   FROM alumno_historial
         WHERE DATE(creado_en) = CURDATE() AND tipo = 'CREACION'`
      );
      nuevosHoy = r[0]?.total ?? 0;
    }

    // personal (admins)
    const [p] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE r.nombre = 'administrador'`
    );
    const personal = p[0]?.total ?? 0;

    // totalProgramas
  const [prog] = await pool.query(`SELECT COUNT(*) AS total FROM programa`);
    const totalProgramas = prog[0]?.total ?? 0;

    // Instrumentos: totales y por estado
  const [instTot] = await pool.query(`SELECT COUNT(*) AS total FROM instrumento`);
    const instrumentosTotal = instTot[0]?.total ?? 0;

    // Disponibles, Mantenimiento, Baja por Estados
    const [instDisp] = await pool.query(`
      SELECT COUNT(*) AS total
  FROM instrumento i
  LEFT JOIN estados e ON i.id_estado = e.id_estado
      WHERE e.nombre = 'Disponible'`);
    const instrumentosDisponibles = instDisp[0]?.total ?? 0;

    const [instMant] = await pool.query(`
      SELECT COUNT(*) AS total
  FROM instrumento i
  LEFT JOIN estados e ON i.id_estado = e.id_estado
      WHERE e.nombre = 'Mantenimiento'`);
    const instrumentosMantenimiento = instMant[0]?.total ?? 0;

    const [instBaja] = await pool.query(`
      SELECT COUNT(*) AS total
  FROM instrumento i
  LEFT JOIN estados e ON i.id_estado = e.id_estado
      WHERE e.nombre = 'Baja'`);
    const instrumentosBaja = instBaja[0]?.total ?? 0;

    // Asignados por asignaciones activas
    const [instAsig] = await pool.query(`
      SELECT COUNT(DISTINCT id_instrumento) AS total
  FROM asignacion_instrumento
      WHERE estado = 'Activo'`);
    const instrumentosAsignados = instAsig[0]?.total ?? 0;

    // Asignaciones vencidas
    const [asigVenc] = await pool.query(`
      SELECT COUNT(*) AS total
  FROM asignacion_instrumento
      WHERE estado = 'Activo' AND fecha_devolucion_prevista IS NOT NULL AND fecha_devolucion_prevista < CURDATE()`);
    const asignacionesVencidas = asigVenc[0]?.total ?? 0;

    // Eventos de esta semana (lunes-domingo)
    const [evWeek] = await pool.query(`
      SELECT COUNT(*) AS total
  FROM evento
      WHERE YEARWEEK(fecha_evento, 1) = YEARWEEK(CURDATE(), 1)`);
    const eventosSemana = evWeek[0]?.total ?? 0;

    // Asistencia promedio últimos 30 días
    const [asis] = await pool.query(`
      SELECT AVG(asistio) AS promedio
  FROM alumno_asistencia
      WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
    const asistenciaPromedio30d = Number(asis[0]?.promedio ?? 0);

    // Próximos cumpleaños (30 días), con filtro por programa opcional
    let cumpleaniosProximos30d = 0;
    if (programa_id) {
      const [cumR] = await pool.query(
        `SELECT COUNT(*) AS total
  FROM alumno a
         JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno AND ap.id_programa = ?
         WHERE (
           CASE 
             WHEN DATE_FORMAT(a.fecha_nacimiento, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d') THEN
               STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(a.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
             ELSE
               STR_TO_DATE(CONCAT(YEAR(CURDATE())+1, '-', DATE_FORMAT(a.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
           END
         ) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
        [programa_id]
      );
      cumpleaniosProximos30d = cumR[0]?.total ?? 0;
    } else {
      const [cumR] = await pool.query(
        `SELECT COUNT(*) AS total
  FROM alumno a
         WHERE (
           CASE 
             WHEN DATE_FORMAT(a.fecha_nacimiento, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d') THEN
               STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(a.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
             ELSE
               STR_TO_DATE(CONCAT(YEAR(CURDATE())+1, '-', DATE_FORMAT(a.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
           END
         ) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
      );
      cumpleaniosProximos30d = cumR[0]?.total ?? 0;
    }

    res.json({
      totalAlumnos,
      activos,
      alumnosActivos,
      alumnosInactivos,
      alumnosRetirados,
      nuevosHoy,
      personal,
      totalProgramas,
      instrumentosTotal,
      instrumentosDisponibles,
      instrumentosAsignados,
      instrumentosMantenimiento,
      instrumentosBaja,
      asignacionesVencidas,
      eventosSemana,
      asistenciaPromedio30d,
      cumpleaniosProximos30d,
    });
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
        FROM evento
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
        FROM evento
        WHERE (fecha_evento > CURDATE())
          OR (fecha_evento = CURDATE() AND hora_evento >= CURTIME())
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
  FROM evento
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

// Lista de próximos cumpleaños
router.get('/cumpleanios-proximos', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const programa_id = req.query.programa_id || null;

    let query = `
      SELECT a.id_alumno, a.nombre, a.fecha_nacimiento,
             TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) AS edad,
             nb.next_birthday AS proximo_cumple,
             DATEDIFF(nb.next_birthday, CURDATE()) AS dias_restantes
      FROM (
        SELECT a1.id_alumno, a1.nombre, a1.fecha_nacimiento,
               CASE
                 WHEN DATE_FORMAT(a1.fecha_nacimiento, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d') THEN
                   STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', DATE_FORMAT(a1.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
                 ELSE
                   STR_TO_DATE(CONCAT(YEAR(CURDATE())+1, '-', DATE_FORMAT(a1.fecha_nacimiento, '%m-%d')), '%Y-%m-%d')
               END AS next_birthday
        FROM alumno a1
      ) nb
      JOIN alumno a ON a.id_alumno = nb.id_alumno
    `;
    const params = [];
    if (programa_id) {
      query += ` JOIN alumno_programa ap ON ap.id_alumno = a.id_alumno AND ap.id_programa = ? `;
      params.push(programa_id);
    }
    query += `
      WHERE nb.next_birthday BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY nb.next_birthday ASC, a.nombre ASC
      LIMIT 100
    `;
    params.push(days);

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /dashboard/cumpleanios-proximos:', err);
    res.status(500).json({ error: 'Error cargando próximos cumpleaños' });
  }
});
 
export default router;