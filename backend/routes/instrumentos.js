// backend/routes/instrumentos.js
import { Router } from 'express';
import pool from '../db.js';
import { registrarHistorialInstrumento } from '../helpers/historial.js';

const router = Router();

// GET /instrumentos
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Instrumento ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /instrumentos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[instrumento]] = await pool.query(
      'SELECT * FROM Instrumento WHERE id_instrumento = ?',
      [id]
    );
    if (!instrumento) return res.status(404).json({ error: 'Instrumento no encontrado' });

    // ¿Está asignado actualmente?
    const [asignado] = await pool.query(
      `SELECT a.id_alumno, a.nombre, ai.fecha_asignacion
       FROM Asignacion_Instrumento ai
       JOIN Alumno a ON ai.id_alumno = a.id_alumno
       WHERE ai.id_instrumento = ? AND ai.estado = 'Activo'
       ORDER BY ai.fecha_asignacion DESC
       LIMIT 1`,
      [id]
    );

    res.json({ ...instrumento, asignado: asignado[0] || null });
  } catch (err) {
    console.error('Error en GET /instrumentos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /instrumentos
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      numero_serie,
      estado = 'Disponible',
      fecha_adquisicion = null,
      ubicacion = '',
    } = req.body;

    if (!nombre || !categoria || !numero_serie) {
      return res.status(400).json({ error: 'nombre, categoria y numero_serie son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO Instrumento (nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion]
    );

    await registrarHistorialInstrumento(
      result.insertId,
      'CREACION',
      `Instrumento creado: ${nombre} (${numero_serie})`
    );

    res.status(201).json({
      id_instrumento: result.insertId,
      nombre,
      categoria,
      numero_serie,
      estado,
      fecha_adquisicion,
      ubicacion,
    });
  } catch (err) {
    console.error('Error en POST /instrumentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /instrumentos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion } = req.body;

    const [result] = await pool.query(
      `UPDATE Instrumento
       SET nombre=?, categoria=?, numero_serie=?, estado=?, fecha_adquisicion=?, ubicacion=?
       WHERE id_instrumento=?`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado' });
    }

    await registrarHistorialInstrumento(
      id,
      'ACTUALIZACION',
      `Instrumento actualizado: ${nombre}`,
      'sistema'
    );

    res.json({ id_instrumento: Number(id), nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion });
  } catch (err) {
    console.error('Error en PUT /instrumentos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /instrumentos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Borrar asignaciones del instrumento
    await pool.query('DELETE FROM Asignacion_Instrumento WHERE id_instrumento = ?', [id]);

    // 2) Borrar historial del instrumento (tabla correcta)
    await pool.query('DELETE FROM Instrumento_Historial WHERE id_instrumento = ?', [id]);

    // 3) Borrar instrumento
    const [del] = await pool.query('DELETE FROM Instrumento WHERE id_instrumento = ?', [id]);
    if (del.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado' });
    }

    res.json({ message: 'Instrumento eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /instrumentos/:id:', err);
    res.status(500).json({ error: 'No se pudo eliminar el instrumento. ' + err.message });
  }
});

// GET /instrumentos/:id/historial
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id_historial, tipo, descripcion, usuario, creado_en
       FROM Instrumento_Historial
       WHERE id_instrumento = ?
       ORDER BY creado_en DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /instrumentos/:id/historial', err);
    res.status(500).json({ error: 'Error obteniendo historial instrumento' });
  }
});

// POST /instrumentos/:id/historial
router.post('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = 'OTRO', descripcion = '', usuario = 'sistema' } = req.body;
    await pool.query(
      `INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`,
      [id, tipo, descripcion, usuario]
    );
    res.status(201).json({ message: 'Historial de instrumento registrado' });
  } catch (err) {
    console.error('Error en POST /instrumentos/:id/historial', err);
    res.status(500).json({ error: 'Error guardando historial instrumento' });
  }
});

export default router;