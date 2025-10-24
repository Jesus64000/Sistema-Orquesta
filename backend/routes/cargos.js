// backend/routes/cargos.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Lista de cargos activos para selects (pública para facilitar formularios)
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_cargo, nombre FROM cargo WHERE activo = 1 ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
