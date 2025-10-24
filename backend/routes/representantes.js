// backend/routes/representantes.js (extendido)
import { Router } from 'express';
import pool from '../db.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { requirePermission } from '../helpers/permissions.js';

const router = Router();

// GET /representantes  (opcional ?q= para búsqueda)
router.get('/', requirePermission('representantes:read'), async (req, res) => {
  try {
    const { q } = req.query || {};
    let sql = `SELECT r.id_representante,
                      r.nombre, r.apellido,
                      CONCAT(COALESCE(r.nombre,''),' ',COALESCE(r.apellido,'')) AS nombre_completo,
                      r.ci,
                      r.telefono, r.telefono_movil,
                      r.email,
                      r.id_parentesco, p.nombre AS parentesco_nombre,
                      r.activo,
                      r.creado_en, r.actualizado_en,
                      r.creado_por, r.actualizado_por,
                      COUNT(a.id_alumno) AS alumnos_count
               FROM representante r
               LEFT JOIN alumno a ON a.id_representante = r.id_representante
               LEFT JOIN parentesco p ON r.id_parentesco = p.id_parentesco
               WHERE 1=1`;
    const params = [];
    if (q && q.trim()) {
      sql += ` AND (r.nombre LIKE ? OR r.apellido LIKE ? OR CONCAT(r.nombre,' ',r.apellido) LIKE ? OR r.ci LIKE ? OR r.telefono LIKE ? OR r.telefono_movil LIKE ? OR r.email LIKE ? OR p.nombre LIKE ?)`;
      const term = `%${q}%`;
      params.push(term, term, term, term, term, term, term, term);
    }
    sql += ` GROUP BY r.id_representante ORDER BY r.apellido IS NULL, r.apellido ASC, r.nombre ASC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /representantes:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /representantes/:id  (incluye alumnos asociados)
router.get('/:id', requirePermission('representantes:read'), async (req, res) => {
  try {
    const { id } = req.params;
  const [[row]] = await pool.query(`SELECT r.id_representante, r.nombre, r.apellido, r.ci, r.telefono, r.telefono_movil, r.email, r.id_parentesco, p.nombre AS parentesco_nombre, r.activo, r.creado_en, r.actualizado_en FROM representante r LEFT JOIN parentesco p ON r.id_parentesco=p.id_parentesco WHERE r.id_representante = ?`, [id]);
    if (!row) return res.status(404).json({ error: 'Representante no encontrado' });
  const [alumnos] = await pool.query(`SELECT id_alumno, nombre FROM alumno WHERE id_representante = ? ORDER BY nombre ASC`, [id]);
    row.alumnos = alumnos;
    res.json(row);
  } catch (err) {
    console.error('Error en GET /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /representantes
router.post('/', requirePermission('representantes:create'), async (req, res) => {
  try {
    const { nombre, apellido = null, ci = null, telefono = null, telefono_movil = null, email, id_parentesco = null, activo = 1 } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son requeridos' });
    }
    // Validación CI (opcional pero si viene debe ser formato aceptado V-/E-/... o solo dígitos) y unicidad cross-entidades
    let ciNorm = null;
    if (ci) {
      const raw = String(ci).trim().toUpperCase();
      if (!/^([VEJG]-?\d{6,}|\d{6,})$/.test(raw)) {
        return res.status(422).json({ error: 'VALIDATION_ERROR', details: { ci: 'CI inválida' } });
      }
      // Normalizar a formato sin prefijo (solo dígitos) para unicidad interna del sistema
      ciNorm = raw.replace(/^[VEJG]-?/, '');
      // Chequear personal/alumno/representante
      const [[{ cntP }]] = await pool.query('SELECT COUNT(*) AS cntP FROM personal WHERE ci = ? AND deleted_at IS NULL', [ciNorm]);
      if (cntP > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'personal' });
      const [[{ cntA }]] = await pool.query('SELECT COUNT(*) AS cntA FROM alumno WHERE ci = ?', [ciNorm]);
      if (cntA > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'alumno' });
      const [[{ cntR }]] = await pool.query('SELECT COUNT(*) AS cntR FROM representante WHERE ci = ?', [ciNorm]);
      if (cntR > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'representante' });
    }
  const [result] = await pool.query(`INSERT INTO representante (nombre, apellido, ci, telefono, telefono_movil, email, id_parentesco, activo) VALUES (?,?,?,?,?,?,?,?)`, [nombre, apellido, ciNorm, telefono, telefono_movil, email, id_parentesco, activo ? 1 : 0]);
    res.status(201).json({ id_representante: result.insertId, nombre, apellido, ci, telefono, telefono_movil, email, id_parentesco, activo: activo?1:0 });
  } catch (err) {
    console.error('Error en POST /representantes:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /representantes/:id
router.put('/:id', requirePermission('representantes:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido = null, ci = null, telefono = null, telefono_movil = null, email, id_parentesco = null, activo } = req.body;
    // Normalización/validación CI
    let ciNorm = null;
    if (ci !== undefined) {
      if (ci === null || ci === '') {
        ciNorm = null;
      } else {
        const raw = String(ci).trim().toUpperCase();
        if (!/^([VEJG]-?\d{6,}|\d{6,})$/.test(raw)) {
          return res.status(422).json({ error: 'VALIDATION_ERROR', details: { ci: 'CI inválida' } });
        }
        ciNorm = raw.replace(/^[VEJG]-?/, '');
        const [[{ cntP }]] = await pool.query('SELECT COUNT(*) AS cntP FROM personal WHERE ci = ? AND deleted_at IS NULL', [ciNorm]);
        if (cntP > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'personal' });
        const [[{ cntA }]] = await pool.query('SELECT COUNT(*) AS cntA FROM alumno WHERE ci = ?', [ciNorm]);
        if (cntA > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'alumno' });
        const [[{ cntR }]] = await pool.query('SELECT COUNT(*) AS cntR FROM representante WHERE ci = ? AND id_representante <> ?', [ciNorm, id]);
        if (cntR > 0) return res.status(409).json({ error: 'CI_DUPLICATE', scope: 'representante' });
      }
    }
    const [result] = await pool.query(`UPDATE representante SET 
      nombre = COALESCE(?, nombre),
      apellido = COALESCE(?, apellido),
      ci = ${ci === undefined ? 'ci' : '?'},
      telefono = COALESCE(?, telefono),
      telefono_movil = COALESCE(?, telefono_movil),
      email = COALESCE(?, email),
      id_parentesco = COALESCE(?, id_parentesco),
      activo = COALESCE(?, activo)
      WHERE id_representante = ?`, [nombre, apellido, ...(ci === undefined ? [] : [ciNorm]), telefono, telefono_movil, email, id_parentesco, typeof activo === 'number' ? activo : undefined, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Representante no encontrado' });
    res.json({ id_representante: Number(id), nombre, apellido, ci, telefono, telefono_movil, email, id_parentesco, activo });
  } catch (err) {
    console.error('Error en PUT /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /representantes/:id
router.delete('/:id', requirePermission('representantes:delete'), async (req, res) => {
  try {
    const { id } = req.params;
  const [result] = await pool.query('DELETE FROM representante WHERE id_representante = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Representante no encontrado' });
    res.json({ message: 'Representante eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /representantes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /representantes/export { ids?: number[], format?: 'csv'|'xlsx'|'pdf', search?: string }
router.post('/export', requirePermission('representantes:read'), async (req, res) => {
  try {
    const { ids = [], format = 'csv', search = '' } = req.body || {};
    let sql = `SELECT r.id_representante, r.nombre, r.apellido,
                      CONCAT(COALESCE(r.nombre,''),' ',COALESCE(r.apellido,'')) AS nombre_completo,
                      r.ci, r.telefono, r.telefono_movil, r.email,
                      p.nombre AS parentesco_nombre,
                      r.activo,
                      COUNT(a.id_alumno) AS alumnos_count
               FROM representante r
               LEFT JOIN alumno a ON a.id_representante = r.id_representante
               LEFT JOIN parentesco p ON r.id_parentesco = p.id_parentesco
               WHERE 1=1`;
    const params = [];
    if (Array.isArray(ids) && ids.length) { sql += ' AND r.id_representante IN (?)'; params.push(ids); }
    if (search && search.trim()) {
      sql += ` AND (r.nombre LIKE ? OR r.apellido LIKE ? OR CONCAT(r.nombre,' ',r.apellido) LIKE ? OR r.ci LIKE ? OR r.telefono LIKE ? OR r.telefono_movil LIKE ? OR r.email LIKE ? OR p.nombre LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term, term, term);
    }
    sql += ' GROUP BY r.id_representante ORDER BY r.apellido IS NULL, r.apellido ASC, r.nombre ASC';
    const [rows] = await pool.query(sql, params);
    const data = rows.map(r => ({
      id_representante: r.id_representante,
      nombre: r.nombre || '',
      apellido: r.apellido || '',
      nombre_completo: (r.nombre_completo || '').trim(),
      ci: r.ci || '',
      telefono: r.telefono || '',
      telefono_movil: r.telefono_movil || '',
      email: r.email || '',
      parentesco: r.parentesco_nombre || '',
      alumnos_count: r.alumnos_count || 0,
      activo: r.activo ? 'Sí' : 'No'
    }));

    if (format === 'csv') {
      const cols = [
        { key: 'id_representante', title: 'ID' },
        { key: 'nombre_completo', title: 'Nombre Completo' },
        { key: 'ci', title: 'CI' },
        { key: 'telefono_movil', title: 'Teléfono Móvil' },
        { key: 'telefono', title: 'Teléfono Fijo' },
        { key: 'email', title: 'Email' },
        { key: 'parentesco', title: 'Parentesco' },
        { key: 'alumnos_count', title: 'Alumnos Asociados' },
        { key: 'activo', title: 'Activo' }
      ];
      const lines = [cols.map(c => c.title).join(',')];
      if (data.length === 0) lines.push(cols.map(()=> '""').join(',')); else {
        for (const row of data) {
          lines.push(cols.map(c => '"' + String(row[c.key] ?? '').replace(/"/g,'""') + '"').join(','));
        }
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="representantes_export_${Date.now()}.csv"`);
      return res.send(csv);
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Representantes');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="representantes_export_${Date.now()}.xlsx"`);
      return res.send(buf);
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="representantes_export_${Date.now()}.pdf"`);
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);
      doc.fontSize(14).text('Exportación de Representantes', { align: 'center' });
      doc.moveDown();
      const colTitles = ['ID','Nombre','CI','Tel.Móvil','Email','Parentesco','Alumnos'];
      const colWidths = [30,120,60,70,120,70,50];
      const startX = doc.x;
      let y = doc.y;
      const rowHeight = 16;
      const drawRow = (vals, header=false) => {
        let x = startX;
        doc.font(header ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
        vals.forEach((v,i)=>{
          const w = colWidths[i];
            doc.text(String(v||''), x, y, { width: w, ellipsis: true });
            x += w + 4;
        });
        y += rowHeight;
        if (y > doc.page.height - 50) { doc.addPage(); y = doc.y; }
      };
      drawRow(colTitles, true);
      for (const r of data) {
        drawRow([r.id_representante, r.nombre_completo, r.ci, r.telefono_movil || r.telefono, r.email, r.parentesco, r.alumnos_count]);
      }
      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Formato no soportado' });
  } catch (err) {
    console.error('Error en /representantes/export:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

export default router;