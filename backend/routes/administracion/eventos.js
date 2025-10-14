import express from 'express';
const router = express.Router();
import db from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

// Listar eventos
router.get('/', requirePermission('eventos:read'), async (req, res) => {
  try {
  const [rows] = await db.query('SELECT * FROM evento');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Crear evento
router.post('/', requirePermission('eventos:create'), async (req, res) => {
  const { nombre, fecha, programa, instrumento } = req.body;
  try {
  await db.query('INSERT INTO evento (titulo, fecha_evento, id_programa, lugar) VALUES (?, ?, ?, ?)', [nombre, fecha, programa, instrumento]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Editar evento
router.put('/:id', requirePermission('eventos:update'), async (req, res) => {
  const { nombre, fecha, programa, instrumento } = req.body;
  try {
  await db.query('UPDATE evento SET titulo=?, fecha_evento=?, id_programa=?, lugar=? WHERE id_evento=?', [nombre, fecha, programa, instrumento, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar evento' });
  }
});

// Eliminar evento
router.delete('/:id', requirePermission('eventos:delete'), async (req, res) => {
  try {
  await db.query('DELETE FROM evento WHERE id_evento=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

export default router;
