import { Router } from 'express';
import pool from '../../db.js';

const router = Router();

// Listar parentescos (opcional ?q= busca por nombre)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let sql = 'SELECT id_parentesco, nombre, activo, creado_en FROM Parentesco';
    const params = [];
    if (q) { sql += ' WHERE nombre LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY nombre ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /administracion/parentescos', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear parentesco
router.post('/', async (req, res) => {
  try {
    const { nombre, activo = 1 } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    const [[dup]] = await pool.query('SELECT id_parentesco FROM Parentesco WHERE nombre = ? LIMIT 1', [nombre.trim()]);
    if (dup) return res.status(400).json({ error: 'Nombre duplicado' });
    const [ins] = await pool.query('INSERT INTO Parentesco (nombre, activo, creado_en) VALUES (?, ?, NOW())', [nombre.trim(), activo ? 1 : 0]);
    res.status(201).json({ id_parentesco: ins.insertId, nombre: nombre.trim(), activo: activo ? 1 : 0 });
  } catch (err) {
    console.error('POST /administracion/parentescos', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar parentesco
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    const [[row]] = await pool.query('SELECT * FROM Parentesco WHERE id_parentesco = ?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    if (nombre) {
      const [[dup]] = await pool.query('SELECT id_parentesco FROM Parentesco WHERE nombre = ? AND id_parentesco <> ? LIMIT 1', [nombre.trim(), id]);
      if (dup) return res.status(400).json({ error: 'Nombre duplicado' });
    }
    await pool.query('UPDATE Parentesco SET nombre = COALESCE(?, nombre), activo = COALESCE(?, activo) WHERE id_parentesco = ?', [nombre ? nombre.trim() : null, typeof activo === 'number' ? (activo ? 1 : 0) : null, id]);
    const [[updated]] = await pool.query('SELECT id_parentesco, nombre, activo FROM Parentesco WHERE id_parentesco = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('PUT /administracion/parentescos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar parentesco (soft si tiene uso?) Por simplicidad: bloquear si está en uso.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query('SELECT * FROM Parentesco WHERE id_parentesco = ?', [id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const [[usoRep]] = await pool.query('SELECT COUNT(*) as cnt FROM Representante WHERE id_parentesco = ?', [id]);
    const [[usoPivot]] = await pool.query('SELECT COUNT(*) as cnt FROM alumno_representante WHERE id_parentesco = ?', [id]);
    if ((usoRep?.cnt || 0) > 0 || (usoPivot?.cnt || 0) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: parentesco en uso' });
    }
    await pool.query('DELETE FROM Parentesco WHERE id_parentesco = ?', [id]);
    res.json({ message: 'Parentesco eliminado' });
  } catch (err) {
    console.error('DELETE /administracion/parentescos/:id', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
