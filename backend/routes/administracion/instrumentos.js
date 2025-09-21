import express from 'express';
const router = express.Router();
import db from '../../db.js';

// Listar instrumentos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.nombre as categoria_nombre
      FROM instrumentos i
      LEFT JOIN categoria c ON i.id_categoria = c.id_categoria
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener instrumentos' });
  }
});

// Crear instrumento
router.post('/', async (req, res) => {
  const { nombre, id_categoria, estado } = req.body;
  try {
    await db.query('INSERT INTO instrumentos (nombre, id_categoria, estado) VALUES (?, ?, ?)', [nombre, id_categoria, estado]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear instrumento' });
  }
});

// Editar instrumento
router.put('/:id', async (req, res) => {
  const { nombre, id_categoria, estado } = req.body;
  try {
    await db.query('UPDATE instrumentos SET nombre=?, id_categoria=?, estado=? WHERE id_instrumento=?', [nombre, id_categoria, estado, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar instrumento' });
  }
});

// Eliminar instrumento
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM instrumentos WHERE id_instrumento=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar instrumento' });
  }
});

export default router;
