import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar eventos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eventos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Crear evento
router.post('/', async (req, res) => {
  const { nombre, fecha, programa, instrumento } = req.body;
  try {
    await db.query('INSERT INTO eventos (nombre, fecha, programa, instrumento) VALUES (?, ?, ?, ?)', [nombre, fecha, programa, instrumento]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Editar evento
router.put('/:id', async (req, res) => {
  const { nombre, fecha, programa, instrumento } = req.body;
  try {
    await db.query('UPDATE eventos SET nombre=?, fecha=?, programa=?, instrumento=? WHERE id_evento=?', [nombre, fecha, programa, instrumento, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar evento' });
  }
});

// Eliminar evento
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM eventos WHERE id_evento=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

export default router;
