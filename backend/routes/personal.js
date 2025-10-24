// backend/routes/personal.js
import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requirePermission } from '../helpers/permissions.js';

const router = Router();

function mapRow(r) {
  return {
    id_personal: r.id_personal,
    ci: r.ci,
    nombres: r.nombres,
    apellidos: r.apellidos,
    email: r.email,
    telefono: r.telefono,
    direccion: r.direccion,
    fecha_nacimiento: r.fecha_nacimiento,
    fecha_ingreso: r.fecha_ingreso,
    carga_horaria: r.carga_horaria,
    estado: r.estado,
    id_cargo: r.id_cargo,
    cargo: r.cargo || null,
    id_programa: r.id_programa,
    programa: r.programa || null,
    creado_en: r.creado_en,
    actualizado_en: r.actualizado_en,
  };
}

// Listado con filtros y paginación
router.get('/', requirePermission('personal:read'), async (req, res) => {
  try {
    const { texto = '', programa_id = '', cargo_id = '', estado = '', page = '1', pageSize = '20' } = req.query;
    const p = Math.max(parseInt(page) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 200);

    const where = ["p.deleted_at IS NULL"];
    const args = [];
    if (texto) {
      where.push("(p.nombres LIKE ? OR p.apellidos LIKE ? OR p.email LIKE ? OR p.ci LIKE ?)");
      const t = `%${texto}%`;
      args.push(t, t, t, t);
    }
    if (programa_id) { where.push("p.id_programa = ?"); args.push(programa_id); }
    if (cargo_id) { where.push("p.id_cargo = ?"); args.push(cargo_id); }
    if (estado) { where.push("p.estado = ?"); args.push(estado); }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM personal p ${whereSql}`,
      args
    );

    const offset = (p - 1) * ps;
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS cargo, pr.nombre AS programa
       FROM personal p
       LEFT JOIN cargo c ON p.id_cargo = c.id_cargo
       LEFT JOIN programa pr ON p.id_programa = pr.id_programa
       ${whereSql}
       ORDER BY p.apellidos ASC, p.nombres ASC
       LIMIT ? OFFSET ?`,
      [...args, ps, offset]
    );

    res.json({ items: rows.map(mapRow), total, page: p, pageSize: ps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener por id
router.get('/:id', requirePermission('personal:read'), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS cargo, pr.nombre AS programa
       FROM personal p
       LEFT JOIN cargo c ON p.id_cargo = c.id_cargo
       LEFT JOIN programa pr ON p.id_programa = pr.id_programa
       WHERE p.id_personal = ? AND p.deleted_at IS NULL`
    , [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function validatePayload(body, isCreate = true) {
  const errors = {};
  const required = (k, cond = true) => { if (cond && (body[k] === undefined || body[k] === null || String(body[k]).trim() === '')) errors[k] = 'REQUIRED'; };
  required('ci');
  required('nombres');
  required('apellidos');
  required('email');
  required('telefono');
  required('carga_horaria');
  // Programa opcional; Cargo requerido
  required('id_cargo');
  const carga = parseInt(body.carga_horaria);
  if (!Number.isFinite(carga) || carga < 0 || carga > 60) errors.carga_horaria = 'INVALID_RANGE';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.email && !emailRegex.test(String(body.email))) errors.email = 'INVALID_EMAIL';
  // Nombres/Apellidos: solo letras y espacios
  try {
    if (body.nombres && !/^[\p{L} ]+$/u.test(String(body.nombres).trim())) errors.nombres = 'LETTERS_ONLY';
  } catch {}
  try {
    if (body.apellidos && !/^[\p{L} ]+$/u.test(String(body.apellidos).trim())) errors.apellidos = 'LETTERS_ONLY';
  } catch {}
  // CI: numérica mínimo 6
  if (body.ci && !/^\d{6,}$/.test(String(body.ci).trim())) errors.ci = 'INVALID_CI';
  // Teléfono: solo dígitos y opcional '+' al inicio
  if (body.telefono && !/^\+?\d+$/.test(String(body.telefono).trim())) errors.telefono = 'INVALID_PHONE';
  return errors;
}

// Crear
router.post('/', requirePermission('personal:create'), async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validatePayload(payload, true);
    if (Object.keys(errors).length) return res.status(422).json({ error: 'VALIDATION_ERROR', details: errors });

    // Uniqueness email/ci
    const [[{ cntEmail }]] = await pool.query('SELECT COUNT(*) AS cntEmail FROM personal WHERE email = ? AND deleted_at IS NULL', [payload.email]);
    if (cntEmail > 0) return res.status(409).json({ error: 'EMAIL_DUPLICATE' });
    const [[{ cntCi }]] = await pool.query('SELECT COUNT(*) AS cntCi FROM personal WHERE ci = ? AND deleted_at IS NULL', [payload.ci]);
    if (cntCi > 0) return res.status(409).json({ error: 'CI_DUPLICATE' });

    const [result] = await pool.query(
      `INSERT INTO personal (ci, nombres, apellidos, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, carga_horaria, estado, id_cargo, id_programa)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [payload.ci, payload.nombres, payload.apellidos, payload.email, payload.telefono, payload.direccion ?? null, payload.fecha_nacimiento ?? null, payload.fecha_ingreso ?? null, payload.carga_horaria, payload.estado || 'ACTIVO', payload.id_cargo, (payload.id_programa === '' || payload.id_programa === undefined) ? null : payload.id_programa]
    );
    const id = result.insertId;
    const [rows] = await pool.query('SELECT * FROM personal WHERE id_personal = ?', [id]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put('/:id', requirePermission('personal:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const errors = validatePayload(payload, false);
    if (Object.keys(errors).length) return res.status(422).json({ error: 'VALIDATION_ERROR', details: errors });

    // Uniqueness email/ci (excluyendo el mismo id)
    const [[{ cntEmail }]] = await pool.query('SELECT COUNT(*) AS cntEmail FROM personal WHERE email = ? AND id_personal <> ? AND deleted_at IS NULL', [payload.email, id]);
    if (cntEmail > 0) return res.status(409).json({ error: 'EMAIL_DUPLICATE' });
    const [[{ cntCi }]] = await pool.query('SELECT COUNT(*) AS cntCi FROM personal WHERE ci = ? AND id_personal <> ? AND deleted_at IS NULL', [payload.ci, id]);
    if (cntCi > 0) return res.status(409).json({ error: 'CI_DUPLICATE' });

    const [result] = await pool.query(
      `UPDATE personal SET ci=?, nombres=?, apellidos=?, email=?, telefono=?, direccion=?, fecha_nacimiento=?, fecha_ingreso=?, carga_horaria=?, estado=?, id_cargo=?, id_programa=?
       WHERE id_personal = ? AND deleted_at IS NULL`,
      [payload.ci, payload.nombres, payload.apellidos, payload.email, payload.telefono, payload.direccion ?? null, payload.fecha_nacimiento ?? null, payload.fecha_ingreso ?? null, payload.carga_horaria, payload.estado || 'ACTIVO', payload.id_cargo, (payload.id_programa === '' || payload.id_programa === undefined) ? null : payload.id_programa, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    const [rows] = await pool.query('SELECT * FROM personal WHERE id_personal = ?', [id]);
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrado (soft)
router.delete('/:id', requirePermission('personal:delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE personal SET deleted_at = NOW() WHERE id_personal = ? AND deleted_at IS NULL', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
router.get('/export/csv', requirePermission('personal:export'), async (req, res) => {
  try {
    const { texto = '', programa_id = '', cargo_id = '', estado = '', ids = '' } = req.query;
    const where = ["p.deleted_at IS NULL"];
    const args = [];
    // ids: exportación de una selección específica si se envían
    if (ids) {
      const list = String(ids)
        .split(',')
        .map(x => parseInt(x, 10))
        .filter(n => Number.isFinite(n));
      if (list.length > 0) {
        where.push(`p.id_personal IN (${list.map(()=>'?').join(',')})`);
        args.push(...list);
      }
    }
    if (texto) {
      where.push("(p.nombres LIKE ? OR p.apellidos LIKE ? OR p.email LIKE ? OR p.ci LIKE ?)");
      const t = `%${texto}%`;
      args.push(t, t, t, t);
    }
    if (programa_id) { where.push("p.id_programa = ?"); args.push(programa_id); }
    if (cargo_id) { where.push("p.id_cargo = ?"); args.push(cargo_id); }
    if (estado) { where.push("p.estado = ?"); args.push(estado); }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS cargo, pr.nombre AS programa
       FROM personal p
       LEFT JOIN cargo c ON p.id_cargo = c.id_cargo
       LEFT JOIN programa pr ON p.id_programa = pr.id_programa
       ${whereSql}
       ORDER BY p.apellidos ASC, p.nombres ASC`,
      args
    );

    const headers = ['CI','Nombres','Apellidos','Email','Teléfono','Dirección','Fecha Nacimiento','Fecha Ingreso','Carga Horaria','Estado','Cargo','Programa'];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [headers.join(',')].concat(
      rows.map(r => [r.ci, r.nombres, r.apellidos, r.email, r.telefono, r.direccion, r.fecha_nacimiento, r.fecha_ingreso, r.carga_horaria, r.estado, r.cargo, r.programa].map(escape).join(','))
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="personal.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
