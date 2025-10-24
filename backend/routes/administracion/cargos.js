import { Router } from 'express';
import pool from '../../db.js';
import { requirePermission } from '../../helpers/permissions.js';

const router = Router();

// Listar cargos (opcional ?q= busca por nombre)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let sql = 'SELECT id_cargo, nombre, activo, creado_en FROM cargo';
    const params = [];
    if (q) { sql += ' WHERE nombre LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY nombre ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /administracion/cargos', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear cargo
router.post('/', requirePermission('personal:update'), async (req, res) => {
  try {
    const { nombre, activo = 1 } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    const [[dup]] = await pool.query('SELECT id_cargo FROM cargo WHERE nombre = ? LIMIT 1', [nombre.trim()]);
    if (dup) return res.status(400).json({ error: 'Nombre duplicado' });
    const [ins] = await pool.query('INSERT INTO cargo (nombre, activo, creado_en) VALUES (?, ?, NOW())', [nombre.trim(), activo ? 1 : 0]);
    res.status(201).json({ id_cargo: ins.insertId, nombre: nombre.trim(), activo: activo ? 1 : 0 });
  } catch (err) {
    console.error('POST /administracion/cargos', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar cargo
router.put('/:id', requirePermission('personal:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    const [[row]] = await pool.query('SELECT * FROM cargo WHERE id_cargo = ?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    if (nombre) {
      const [[dup]] = await pool.query('SELECT id_cargo FROM cargo WHERE nombre = ? AND id_cargo <> ? LIMIT 1', [nombre.trim(), id]);
      if (dup) return res.status(400).json({ error: 'Nombre duplicado' });
    }
    await pool.query('UPDATE cargo SET nombre = COALESCE(?, nombre), activo = COALESCE(?, activo) WHERE id_cargo = ?', [nombre ? nombre.trim() : null, typeof activo === 'number' ? (activo ? 1 : 0) : null, id]);
    const [[updated]] = await pool.query('SELECT id_cargo, nombre, activo FROM cargo WHERE id_cargo = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('PUT /administracion/cargos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar cargo (bloquear si está en uso por personal)
router.delete('/:id', requirePermission('personal:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query('SELECT * FROM cargo WHERE id_cargo = ?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const [[uso]] = await pool.query('SELECT COUNT(*) as cnt FROM personal WHERE id_cargo = ?', [id]);
    if ((uso?.cnt || 0) > 0) return res.status(400).json({ error: 'No se puede eliminar: cargo en uso por personal' });
    await pool.query('DELETE FROM cargo WHERE id_cargo = ?', [id]);
    res.json({ message: 'Cargo eliminado' });
  } catch (err) {
    console.error('DELETE /administracion/cargos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
