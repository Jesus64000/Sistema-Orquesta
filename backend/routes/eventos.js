// backend/routes/eventos.js
import { Router } from 'express';
import pool from '../db.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { requirePermission } from '../helpers/permissions.js';

// Helper para calcular diffs (también exportado para tests)
export function computeEventoDiffs(before, after) {
  const campos = ['titulo','descripcion','fecha_evento','hora_evento','lugar','id_programa','estado'];
  const diffs = [];
  for (const campo of campos) {
    const b = before ? (before[campo]) : undefined;
    const a = after ? (after[campo]) : undefined;
    const normB = b == null ? '' : String(b);
    const normA = a == null ? '' : String(a);
    if (normB !== normA) {
      diffs.push({ campo, valor_anterior: normB, valor_nuevo: normA });
    }
  }
  return diffs;
}

const router = Router();

// Auto-finaliza eventos cuya fecha ya pasó (sin cambiar los CANCELADO)
async function autoFinalizePastEvents() {
  try {
  await pool.query(`UPDATE evento SET estado='FINALIZADO' WHERE fecha_evento < CURDATE() AND estado NOT IN ('FINALIZADO','CANCELADO')`);
  } catch(err) {
    console.warn('autoFinalizePastEvents error:', err.message);
  }
}


// Estados válidos de un evento
export const EVENTO_ESTADOS = ['PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO'];
// Nota: Asegúrate de haber ejecutado en la base de datos (una sola vez):
// ALTER TABLE evento ADD COLUMN estado ENUM('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROGRAMADO' AFTER id_programa;

// POST /eventos
router.post('/', requirePermission('eventos:write'), async (req, res) => {
  try {
    const { titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa = null, estado = 'PROGRAMADO' } = req.body;

    if (!titulo || !fecha_evento || !hora_evento || !lugar) {
      return res.status(400).json({ error: 'Título, fecha, hora y lugar son obligatorios' });
    }

    // Validar estado y lógica de fecha
    const hoy = new Date().toISOString().split('T')[0];
    const estadoUpper = String(estado).toUpperCase();
    if (!EVENTO_ESTADOS.includes(estadoUpper)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    // Reglas:
    // - PROGRAMADO o EN_CURSO no pueden crearse en fecha pasada
    // - FINALIZADO o CANCELADO sí pueden asociarse a una fecha pasada (registro retroactivo)
    if (fecha_evento < hoy && ['PROGRAMADO','EN_CURSO'].includes(estadoUpper)) {
      return res.status(400).json({ error: 'La fecha no puede ser pasada para este estado' });
    }

    const [result] = await pool.query(
      'INSERT INTO evento (titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa, estadoUpper]
    );

    res.status(201).json({
      id_evento: result.insertId,
      titulo,
      descripcion,
      fecha_evento,
      hora_evento,
      lugar,
      id_programa,
      estado: estadoUpper,
    });
  } catch (err) {
    console.error('Error creando evento:', err);
    res.status(500).json({ error: err.message });
  }
});


// PUT /eventos/:id (registra historial de cambios)
// Requiere tabla (ejecutar una sola vez):
// CREATE TABLE IF NOT EXISTS evento_historial (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   id_evento INT NOT NULL,
//   campo VARCHAR(50) NOT NULL,
//   valor_anterior TEXT,
//   valor_nuevo TEXT,
//   usuario VARCHAR(100) DEFAULT NULL,
//   creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
// );
router.put('/:id', requirePermission('eventos:write'), async (req, res) => {
  const connLabel = 'PUT /eventos/:id';
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa = null, estado } = req.body;

    if (!titulo || !fecha_evento || !hora_evento || !lugar) {
      return res.status(400).json({ error: 'Título, fecha, hora y lugar son obligatorios' });
    }

    const hoy = new Date().toISOString().split('T')[0];

    let estadoUpper = undefined;
    if (estado != null) {
      estadoUpper = String(estado).toUpperCase();
      if (!EVENTO_ESTADOS.includes(estadoUpper)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
    }
    // Reglas de fecha en actualización:
    // - Si se intenta poner fecha pasada con estado PROGRAMADO o EN_CURSO -> error.
    // - Si el estado (nuevo o existente) es FINALIZADO o CANCELADO se permite fecha pasada.
    const estadoEvaluado = estadoUpper || undefined; // puede ser undefined => usar existing luego

    // Obtener registro existente para calcular diffs
    const [existingRows] = await pool.query(
      'SELECT titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa, estado FROM evento WHERE id_evento=?',
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    const existing = existingRows[0];

    // Validar fecha vs hoy considerando estado nuevo o existente
    const estadoActual = existingRows[0]?.estado;
    const estadoFinalPrevisto = estadoUpper || estadoActual;
    if (fecha_evento < hoy && ['PROGRAMADO','EN_CURSO'].includes(estadoFinalPrevisto)) {
      return res.status(400).json({ error: 'La fecha no puede ser pasada para este estado' });
    }

    const [result] = await pool.query(
      'UPDATE evento SET titulo=?, descripcion=?, fecha_evento=?, hora_evento=?, lugar=?, id_programa=?, estado=COALESCE(?, estado) WHERE id_evento=?',
      [titulo, descripcion, fecha_evento, hora_evento, lugar, id_programa, estadoUpper, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado tras update' });
    }

    // Calcular cambios campo a campo
    const nuevoEstadoFinal = estadoUpper || existing.estado; // estado final después del update
    const afterSnapshot = {
      titulo,
      descripcion,
      fecha_evento,
      hora_evento,
      lugar,
      id_programa,
      estado: nuevoEstadoFinal
    };
    const diffs = computeEventoDiffs(existing, afterSnapshot);

    // Insertar diffs (mejor en una transacción; aquí secuencial por simplicidad)
    if (diffs.length) {
      const usuario = (req.user && (req.user.username || req.user.email)) || null; // Placeholder, depende de tu auth
      for (const d of diffs) {
        try {
          await pool.query(
            'INSERT INTO evento_historial (id_evento, campo, valor_anterior, valor_nuevo, usuario) VALUES (?,?,?,?,?)',
            [id, d.campo, d.valor_anterior, d.valor_nuevo, usuario]
          );
        } catch (e) {
          console.warn(`${connLabel} - Error insertando historial`, e.message);
        }
      }
    }

    res.json({ id_evento: Number(id), ...afterSnapshot });
  } catch (err) {
    console.error('Error actualizando evento:', err);
    res.status(500).json({ error: err.message });
  }
});


// DELETE /eventos/:id
router.delete('/:id', requirePermission('eventos:write'), async (req, res) => {
  try {
    const { id } = req.params;
  const [result] = await pool.query('DELETE FROM evento WHERE id_evento=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/futuros (con filtro opcional por programa_id)
router.get('/futuros', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { programa_id } = req.query;
    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa,
        estado
  FROM evento
      WHERE fecha_evento >= CURDATE()
    `;

    const params = [];

    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    query += ' ORDER BY fecha_evento ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos/futuros:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/pasados (con filtro opcional por programa_id)
router.get('/pasados', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { programa_id } = req.query;
    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa,
        estado
  FROM evento
      WHERE fecha_evento < CURDATE()
    `;
    const params = [];

    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    query += ' ORDER BY fecha_evento DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos/pasados:', err);
    res.status(500).json({ error: err.message });
  }
});

// (Opcional) GET /eventos/futuros2 - mantiene compatibilidad si ya lo usas
router.get('/futuros2', async (_req, res) => {
  try {
    await autoFinalizePastEvents();
    const [rows] = await pool.query(
      `SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa,
        estado
  FROM evento
      WHERE fecha_evento >= CURDATE()
      ORDER BY fecha_evento ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo eventos futuros:', err);
    res.status(500).json({ error: 'Error obteniendo eventos futuros' });
  }
});


// GET /eventos/suggest?q=term&limit=8  (búsqueda predictiva)
router.get('/suggest', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { q = '', limit = 8 } = req.query;
    const term = String(q).trim();
    if (term.length < 2) return res.json([]); // mínimo 2 chars
    const lim = Math.min(Math.max(parseInt(limit) || 8, 1), 25); // acotar 1-25
    const like = `%${term}%`;
    const [rows] = await pool.query(
      `SELECT 
        id_evento,
        titulo,
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar,
        estado
  FROM evento
      WHERE (titulo LIKE ? OR lugar LIKE ? OR descripcion LIKE ?)
      ORDER BY fecha_evento ASC, hora_evento ASC
      LIMIT ?`,
      [like, like, like, lim]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos/suggest:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/:id/historial  (lista de cambios)
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        id,
        campo,
        valor_anterior,
        valor_nuevo,
        usuario,
        DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') AS creado_en
      FROM evento_historial
      WHERE id_evento=?
      ORDER BY creado_en DESC, id DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo historial de evento:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos/:id
router.get('/:id', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa, 
        creado_en,
        estado
  FROM evento 
      WHERE id_evento = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo evento:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /eventos (con filtros opcionales: programa_id y search)
router.get('/', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { programa_id, search } = req.query;

    let query = `
      SELECT 
        id_evento, 
        titulo, 
        descripcion, 
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar, 
        id_programa, 
        creado_en,
        estado
  FROM evento
      WHERE 1=1
    `;

    const params = [];

    // Filtro por programa
    if (programa_id) {
      query += ' AND id_programa = ?';
      params.push(programa_id);
    }

    // Búsqueda por título o lugar
    if (search) {
      query += ' AND (titulo LIKE ? OR lugar LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    // Ordenar por fecha + hora
    query += ' ORDER BY fecha_evento ASC, hora_evento ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en /eventos:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /eventos/export { ids?: number[], format?: 'csv'|'xlsx'|'pdf', search?: string }
router.post('/export', async (req, res) => {
  try {
    await autoFinalizePastEvents();
    const { ids = [], format = 'csv', search = '' } = req.body || {};

    // Construir query base similar a GET /eventos
    let query = `
      SELECT 
        id_evento,
        titulo,
        descripcion,
        DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
        DATE_FORMAT(hora_evento, '%H:%i') AS hora_evento,
        lugar,
        id_programa,
        creado_en,
        estado
  FROM evento
      WHERE 1=1`;
    const params = [];

    if (Array.isArray(ids) && ids.length) {
      query += ` AND id_evento IN (?)`;
      params.push(ids);
    }

    if (search) {
      query += ' AND (titulo LIKE ? OR lugar LIKE ? OR descripcion LIKE ? )';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY fecha_evento ASC, hora_evento ASC';
    const [rows] = await pool.query(query, params);

    // Normalizar datos
    const data = rows.map(r => ({
      id_evento: r.id_evento,
      titulo: r.titulo || '',
      descripcion: r.descripcion || '',
      fecha_evento: r.fecha_evento || '',
      hora_evento: r.hora_evento || '',
  lugar: r.lugar || '',
  id_programa: r.id_programa ?? '',
  estado: r.estado || '',
      creado_en: (() => {
        const v = r.creado_en;
        try {
          if (!v) return '';
          if (typeof v === 'string') return v.replace('T', ' ').slice(0, 19);
          if (v instanceof Date) return v.toISOString().replace('T', ' ').slice(0, 19);
          const d = new Date(v);
          return isNaN(d) ? '' : d.toISOString().replace('T', ' ').slice(0, 19);
        } catch { return ''; }
      })()
    }));

    if (format === 'csv') {
      const cols = [
        { key: 'id_evento', title: 'ID' },
        { key: 'titulo', title: 'Título' },
        { key: 'descripcion', title: 'Descripción' },
        { key: 'fecha_evento', title: 'Fecha' },
        { key: 'hora_evento', title: 'Hora' },
        { key: 'lugar', title: 'Lugar' },
        { key: 'id_programa', title: 'Id Programa' },
        { key: 'creado_en', title: 'Creado En' },
        { key: 'estado', title: 'Estado' },
      ];
      const lines = [cols.map(c => c.title).join(',')];
      if (data.length === 0) {
        lines.push(cols.map(() => '""').join(','));
      } else {
        for (const row of data) {
          const vals = cols.map(c => '"' + String(row[c.key] ?? '').replace(/"/g,'""') + '"');
          lines.push(vals.join(','));
        }
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="eventos_export_${Date.now()}.csv"`);
      return res.send(csv);
    }

    if (format === 'xlsx' || format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="eventos_export_${Date.now()}.xlsx"`);
      return res.send(buf);
    }
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="eventos_export_${Date.now()}.pdf"`);
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(res);
      doc.fontSize(14).text('Exportación de Eventos', { align: 'center' });
      doc.moveDown();
      const colTitles = ['ID','Título','Fecha','Hora','Lugar','Programa','Estado'];
      const colWidths = [40,140,60,50,110,60,60];
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
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = doc.y;
        }
      };
      drawRow(colTitles, true);
      for (const ev of data) {
        drawRow([
          ev.id_evento,
          ev.titulo,
          ev.fecha_evento,
          ev.hora_evento,
          ev.lugar,
          ev.id_programa,
          ev.estado
        ]);
      }
      doc.end();
      return; // stream
    }

    return res.status(400).json({ error: 'Formato no soportado' });
  } catch (err) {
    console.error('Error en /eventos/export:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

export default router;
