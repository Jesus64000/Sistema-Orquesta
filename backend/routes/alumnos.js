// backend/routes/alumnos.js
import { Router } from 'express';
import pool from '../db.js';
import upload from '../uploads.config.js';
import { registrarHistorial, registrarHistorialInstrumento } from '../helpers/historial.js';
import alumnosHelpers from '../helpers/alumnos.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const { fetchProgramasPorAlumnos, fetchAlumnosWithPrograms } = alumnosHelpers;

const router = Router();

// Valida id numérico y evita que rutas como "estado-masivo" coincidan con ":id"
router.param('id', (req, res, next, val) => {
  if (!/^\d+$/.test(String(val))) return next('route');
  next();
});

// Listar alumnos con filtros opcionales: ?search=&estado=&programa_id=&edad_min=&edad_max=
router.get('/', async (req, res) => {
  try {
    const { search, estado, programa_id, edad_min, edad_max } = req.query;

    const params = [];
    const where = [];

    if (search) {
      where.push("(a.nombre LIKE ? OR a.telefono_contacto LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (estado) {
      where.push("a.estado = ?");
      params.push(estado);
    }

    if (edad_min) {
      where.push("TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) >= ?");
      params.push(Number(edad_min));
    }

    if (edad_max) {
      where.push("TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) <= ?");
      params.push(Number(edad_max));
    }

    let joinProgramFilter = "";
    if (programa_id) {
      joinProgramFilter = "JOIN alumno_programa apf ON a.id_alumno = apf.id_alumno";
      where.push("apf.id_programa = ?");
      params.push(programa_id);
    }

    const sql = `
      SELECT DISTINCT a.*,
             TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) AS edad,
             r.id_representante, r.nombre AS representante_nombre,
             r.telefono AS representante_telefono, r.email AS representante_email
      FROM Alumno a
      LEFT JOIN Representante r ON a.id_representante = r.id_representante
      ${joinProgramFilter}
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY a.nombre ASC
      LIMIT 1000
    `;

    const [alumnosRows] = await pool.query(sql, params);

    const ids = alumnosRows.map((r) => r.id_alumno);
    const programasRows = await fetchProgramasPorAlumnos(ids);

    const mapProg = {};
    for (const pr of programasRows) {
      if (!mapProg[pr.id_alumno]) mapProg[pr.id_alumno] = [];
      mapProg[pr.id_alumno].push({ id_programa: pr.id_programa, nombre: pr.nombre });
    }

    const result = alumnosRows.map((a) => ({
      ...a,
      programas: mapProg[a.id_alumno] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en GET /alumnos:", err);
    res.status(500).json({ error: err.message });
  }
});

// Detalle alumno con programas y representante
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[alumnoRow]] = await pool.query(
      `SELECT a.*,
              TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) AS edad,
              r.id_representante, r.nombre AS representante_nombre,
              r.telefono AS representante_telefono, r.email AS representante_email
       FROM Alumno a
       LEFT JOIN Representante r ON a.id_representante = r.id_representante
       WHERE a.id_alumno = ?`,
      [id]
    );

    if (!alumnoRow) return res.status(404).json({ error: "Alumno no encontrado" });

    const [programasRows] = await pool.query(
      `SELECT p.id_programa, p.nombre
       FROM alumno_programa ap
       JOIN Programa p ON ap.id_programa = p.id_programa
       WHERE ap.id_alumno = ?`,
      [id]
    );

    res.json({ ...alumnoRow, programas: programasRows || [] });
  } catch (err) {
    console.error("Error en GET /alumnos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear alumno (acepta programa_ids array)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      estado = "Activo",
      programa_ids = [],
      programas = [],
      usuario = "sistema",
      id_representante = null,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Alumno (nombre, fecha_nacimiento, genero, telefono_contacto, estado, id_representante)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, estado, id_representante]  // <<--- INCLUIDO
    );
    const id_alumno = result.insertId;

    // decidir programas: preferir programa_ids, sino programas (ids)
    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    if (progIds.length > 0) {
      const slice = progIds.slice(0, 2);
      for (const id_programa of slice) {
        await pool.query(`INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`, [id_alumno, id_programa]);
      }
    }

    // registrar historial de creación
    await registrarHistorial(id_alumno, "CREACION", `Alumno creado y asignado a programas: ${progIds.join(", ")}`, usuario);

    // devolver alumno con programas
    const [programasRows] = await pool.query(
      `SELECT p.id_programa, p.nombre
       FROM alumno_programa ap
       JOIN Programa p ON ap.id_programa = p.id_programa
       WHERE ap.id_alumno = ?`,
      [id_alumno]
    );

    res.json({ id_alumno, nombre, fecha_nacimiento, genero, telefono_contacto, estado, programas: programasRows || [] });
  } catch (err) {
    console.error("Error en POST /alumnos:", err);
    res.status(500).json({ error: err.message });
  }
  

});

// Actualizar alumno (+ reemplazar programas si viene programa_ids)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ← Línea añadida para extraer el id
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      estado,
      programa_ids = [],
      programas = [],
      usuario = "sistema",
      id_representante = null, 
    } = req.body;

    await pool.query(
      `UPDATE Alumno
      SET nombre=?, fecha_nacimiento=?, genero=?, telefono_contacto=?, estado=?, id_representante=?
      WHERE id_alumno=?`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, estado, id_representante, id]
    );

    // reemplazar programas
    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    await pool.query(`DELETE FROM alumno_programa WHERE id_alumno = ?`, [id]);
    if (progIds.length > 0) {
      const slice = progIds.slice(0, 2);
      for (const id_programa of slice) {
        await pool.query(`INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`, [id, id_programa]);
      }
    }

    await registrarHistorial(id, "ACTUALIZACION", `Alumno actualizado. Programas ahora: ${progIds.join(", ")}`, usuario);

    const [[alumnoRow]] = await pool.query(`SELECT * FROM Alumno WHERE id_alumno = ?`, [id]);
    const [programasRows] = await pool.query(
      `SELECT p.id_programa, p.nombre
       FROM alumno_programa ap
       JOIN Programa p ON ap.id_programa = p.id_programa
       WHERE ap.id_alumno = ?`,
      [id]
    );

    res.json({ ...alumnoRow, programas: programasRows || [] });
  } catch (err) {
    console.error("Error en PUT /alumnos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /alumnos/:id/desactivar
router.put('/:id/desactivar', async (req, res) => {
  const { id } = req.params;
  const { instrumentosDevueltos } = req.body;

  try {
    // 1️⃣ Verificar si hay asignaciones activas
    const [asignaciones] = await pool.query(
      "SELECT id_asignacion FROM asignacion_instrumento WHERE id_alumno = ? AND estado = 'Activo'",
      [id]
    );

    // 🚫 Si tiene instrumentos activos → bloquear
    if (asignaciones.length > 0) {
      return res.status(400).json({
        error: "El alumno aún tiene instrumentos asignados. No puede ser desactivado hasta devolverlos."
      });
    }

    // 2️⃣ Si no tiene instrumentos, pero no marcó el check → bloquear
    if (!instrumentosDevueltos) {
      return res.status(400).json({
        error: "Debes confirmar que el alumno devolvió sus instrumentos."
      });
    }

    // 3️⃣ Desactivar alumno
    await pool.query(
      "UPDATE alumno SET estado = 'Inactivo' WHERE id_alumno = ?",
      [id]
    );

    res.json({ message: "Alumno desactivado correctamente" });
  } catch (err) {
    console.error("Error al desactivar alumno:", err);
    res.status(500).json({ error: "Error al desactivar alumno" });
  }
});



// Eliminar alumno
router.delete('/:id', async (req, res) => {
const { id } = req.params;

  try {
    //comprobar si el alumno existe
    const [alumno] = await pool.query(
      "SELECT * FROM alumno WHERE id_alumno = ?",
      [id]
    );

    if (alumno.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // Eliminar el alumno
    // Gracias a ON DELETE CASCADE en alumno_historial, alumno_programa y otros, todo relacionado se eliminará automáticamente
    await pool.query("DELETE FROM alumno WHERE id_alumno = ?", [id]);

    return res.json({ message: "Alumno eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /alumnos/:id:", err);
    return res.status(500).json({ error: "Error eliminando alumno" });
  }
});

// Cambio rápido de estado
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, usuario = "sistema" } = req.body;
    if (!estado) return res.status(400).json({ error: "Campo 'estado' requerido" });

    await pool.query(`UPDATE Alumno SET estado = ? WHERE id_alumno = ?`, [estado, id]);
    await registrarHistorial(id, "ESTADO", `Estado cambiado a ${estado}`, usuario);
    res.json({ message: "Estado actualizado" });
  } catch (err) {
    console.error("Error en PUT /alumnos/:id/estado:", err);
    res.status(500).json({ error: err.message });
  }
});

// Acciones masivas: cambiar estado
router.put('/estado-masivo', async (req, res) => {
  try {
    const { ids = [], estado, usuario = "sistema" } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "ids array requerido" });
    if (!estado) return res.status(400).json({ error: "estado requerido" });

    await pool.query(`UPDATE Alumno SET estado = ? WHERE id_alumno IN (?)`, [estado, ids]);
    for (const id of ids) {
      await registrarHistorial(id, "ESTADO", `Estado cambiando masivo a ${estado}`, usuario);
    }
    res.json({ message: "Estado actualizado para los alumnos seleccionados" });
  } catch (err) {
    console.error("Error en PUT /alumnos/estado-masivo:", err);
    res.status(500).json({ error: err.message });
  } 
});

// Export masivo (POST) - body { ids: [...], format: 'csv' }
router.post('/export-masivo', async (req, res) => {
  try {
      const { ids = [], format = "csv" } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "ids array requerido en body" });

      const alumnos = await fetchAlumnosWithPrograms({ ids });

      const rows = alumnos.map((a) => {
        let fn = '';
        try {
          const v = a.fecha_nacimiento;
          if (typeof v === 'string') fn = v.slice(0, 10);
          else if (v instanceof Date) fn = v.toISOString().slice(0, 10);
          else if (v) {
            const nd = new Date(v);
            if (!isNaN(nd)) fn = nd.toISOString().slice(0, 10);
          }
        } catch {}
        return {
          id_alumno: a.id_alumno,
          nombre: a.nombre || "",
          fecha_nacimiento: fn,
          genero: a.genero || "",
          telefono_contacto: a.telefono_contacto || "",
          estado: a.estado || "",
          programas: (a.programas || []).map((p) => p.nombre).join(" | "),
          nota: a.nota || "",
        };
      });

      if (format === 'csv') {
        const headers = Object.keys(rows[0] || { id_alumno: '', nombre: '', fecha_nacimiento: '', genero: '', telefono_contacto: '', estado: '', programas: '', nota: '' });
        const lines = [headers.join(',')];
        for (const r of rows) {
          const vals = headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`);
          lines.push(vals.join(','));
        }
        const csv = lines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="alumnos_export_masivo_${Date.now()}.csv"`);
        return res.send(csv);
      }

      if (format === 'xlsx' || format === 'excel') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="alumnos_export_masivo_${Date.now()}.xlsx"`);
        return res.send(buf);
      }

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="alumnos_export_masivo_${Date.now()}.pdf"`);
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(14).text('Exportación de Alumnos', { align: 'center' });
        doc.moveDown();

        const colTitles = ['ID', 'Nombre', 'F. Nac.', 'Género', 'Teléfono', 'Estado', 'Programas'];
        const colWidths = [40, 150, 70, 50, 90, 60, 180];

        const drawRow = (vals, isHeader = false) => {
          doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
          for (let i = 0; i < vals.length; i++) {
            const text = String(vals[i] ?? '');
            doc.text(text, { continued: i < vals.length - 1, width: colWidths[i] });
          }
          doc.text('\n');
        };

        drawRow(colTitles, true);
        doc.moveDown(0.2);

        rows.forEach((r) => {
          drawRow([
            r.id_alumno,
            r.nombre,
            r.fecha_nacimiento,
            r.genero,
            r.telefono_contacto,
            r.estado,
            r.programas,
          ]);
        });

        doc.end();
        return; // stream finaliza la respuesta
      }

      res.status(400).json({ error: 'Formato no soportado. Usa csv | xlsx | pdf' });
    } catch (err) {
      console.error('Error en POST /alumnos/export-masivo:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// Importación masiva (CSV o XLSX) - multipart/form-data field: file
router.post('/import-masivo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Archivo requerido (field 'file')" });

    const wb = XLSX.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    let created = 0, updated = 0, errors = 0;

    for (const r of rows) {
      try {
        // Mapeo de columnas esperadas
        const id_alumno = r.id_alumno || r.ID || r.Id || null;
        const nombre = r.nombre || r.Nombre || '';
        const fecha_nacimiento = r.fecha_nacimiento || r['fecha nacimiento'] || r['Fecha Nacimiento'] || null;
        const genero = r.genero || r.Genero || r.Género || '';
        const telefono_contacto = r.telefono_contacto || r.Telefono || r['Teléfono'] || '';
        const estado = r.estado || r.Estado || 'Activo';
        const programasStr = r.programas || r.Programas || '';

        if (!nombre) continue; // fila inválida

        if (id_alumno) {
          // actualizar si existe
          await pool.query(
            `UPDATE Alumno SET nombre=?, fecha_nacimiento=?, genero=?, telefono_contacto=?, estado=? WHERE id_alumno=?`,
            [nombre, fecha_nacimiento || null, genero, telefono_contacto, estado, id_alumno]
          );
          updated++;

          // reemplazar programas si vienen
          if (programasStr) {
            const progNombres = String(programasStr).split('|').map(s => s.trim()).filter(Boolean);
            await pool.query(`DELETE FROM alumno_programa WHERE id_alumno = ?`, [id_alumno]);
            for (const pn of progNombres.slice(0, 2)) {
              const [[pr]] = await pool.query(`SELECT id_programa FROM Programa WHERE nombre = ? LIMIT 1`, [pn]);
              if (pr) await pool.query(`INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`, [id_alumno, pr.id_programa]);
            }
          }
        } else {
          // crear
          const [ins] = await pool.query(
            `INSERT INTO Alumno (nombre, fecha_nacimiento, genero, telefono_contacto, estado) VALUES (?, ?, ?, ?, ?)`,
            [nombre, fecha_nacimiento || null, genero, telefono_contacto, estado]
          );
          const newId = ins.insertId;
          created++;

          if (programasStr) {
            const progNombres = String(programasStr).split('|').map(s => s.trim()).filter(Boolean);
            for (const pn of progNombres.slice(0, 2)) {
              const [[pr]] = await pool.query(`SELECT id_programa FROM Programa WHERE nombre = ? LIMIT 1`, [pn]);
              if (pr) await pool.query(`INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`, [newId, pr.id_programa]);
            }
          }
        }
      } catch (e) {
        errors++;
      }
    }

    res.json({ message: 'Importación completada', created, updated, errors });
  } catch (err) {
    console.error('Error en POST /alumnos/import-masivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Acciones masivas: agregar o quitar programa a un conjunto de alumnos
// body: { ids: number[], id_programa: number, action: 'add' | 'remove' }
router.post('/programa-masivo', async (req, res) => {
  try {
    const { ids = [], id_programa, action = 'add' } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array requerido' });
    if (!id_programa) return res.status(400).json({ error: 'id_programa requerido' });

    if (action === 'add') {
      for (const id of ids) {
        await pool.query(`INSERT IGNORE INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`, [id, id_programa]);
      }
    } else if (action === 'remove') {
      await pool.query(`DELETE FROM alumno_programa WHERE id_programa = ? AND id_alumno IN (?)`, [id_programa, ids]);
    } else {
      return res.status(400).json({ error: 'action debe ser add o remove' });
    }
    res.json({ message: 'Operación masiva de programa completada' });
  } catch (err) {
    console.error('Error en POST /alumnos/programa-masivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Desactivación masiva de alumnos (soft delete: estado = 'Inactivo')
router.post('/desactivar-masivo', async (req, res) => {
  try {
    const { ids = [], usuario = 'sistema' } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array requerido' });

    // Validar que ningún alumno tenga instrumento activo
    const [asigs] = await pool.query(
      `SELECT DISTINCT ai.id_alumno
       FROM Asignacion_Instrumento ai
       WHERE ai.estado = 'Activo' AND ai.id_alumno IN (?)`,
      [ids]
    );
    if (asigs.length > 0) {
      const bloqueados = asigs.map(r => r.id_alumno);
      return res.status(400).json({ error: 'Algunos alumnos tienen instrumentos asignados activos. Deben devolverlos antes de desactivar.', bloqueados });
    }

    await pool.query(`UPDATE Alumno SET estado = 'Inactivo' WHERE id_alumno IN (?)`, [ids]);
    for (const id of ids) {
      await registrarHistorial(id, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', usuario);
    }
    res.json({ message: 'Alumnos desactivados correctamente' });
  } catch (err) {
    console.error('Error en POST /alumnos/desactivar-masivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial de alumno
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id_historial, tipo, descripcion, usuario, creado_en
       FROM Alumno_Historial
       WHERE id_alumno = ?
       ORDER BY creado_en DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/historial", err);
    res.status(500).json({ error: "Error obteniendo historial" });
  }
});

// Registrar historial (POST)
router.post('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = "OTRO", descripcion = "", usuario = "sistema" } = req.body;
    await pool.query(`INSERT INTO Alumno_Historial (id_alumno, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`, [id, tipo, descripcion, usuario]);
    res.json({ message: "Historial registrado" });
  } catch (err) {
    console.error("Error en POST /alumnos/:id/historial", err);
    res.status(500).json({ error: "Error guardando historial" });
  }
});

// Nota interna
router.put('/:id/nota', async (req, res) => {
  try {
    const { id } = req.params;
    const { nota = "", usuario = "sistema" } = req.body;
    await pool.query(`UPDATE Alumno SET nota = ? WHERE id_alumno = ?`, [nota, id]);
    await registrarHistorial(id, "NOTA", `Nota actualizada: ${nota}`, usuario);
    res.json({ message: "Nota actualizada" });
  } catch (err) {
    console.error("Error en PUT /alumnos/:id/nota", err);
    res.status(500).json({ error: "Error actualizando nota" });
  }
});

// Obtener instrumento asignado activo
router.get('/:id/instrumento', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
    `SELECT 
      i.id_instrumento,
      i.nombre,
      i.numero_serie,
      COALESCE(e.nombre, 'Desconocido') AS estado_instrumento,
      ai.fecha_asignacion,
      c.nombre AS categoria_nombre
       FROM Asignacion_Instrumento ai
       JOIN Instrumento i ON ai.id_instrumento = i.id_instrumento
       LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
       LEFT JOIN Estados e ON i.id_estado = e.id_estado
       WHERE ai.id_alumno = ? AND ai.estado = 'Activo'
       ORDER BY ai.fecha_asignacion DESC
       LIMIT 1`,
      [id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/instrumento", err);
    res.status(500).json({ error: "Error obteniendo instrumento" });
  }
});

// Asignar instrumento a alumno
router.post('/:id/instrumento', async (req, res) => {
  try {
      const { id } = req.params;
      const { id_instrumento, usuario = "sistema" } = req.body;
      if (!id_instrumento) return res.status(400).json({ error: "id_instrumento requerido" });

      // verificar disponibilidad
      const [[inst]] = await pool.query(
        `SELECT i.*, COALESCE(e.nombre, 'Desconocido') AS estado_nombre
         FROM Instrumento i
         LEFT JOIN Estados e ON i.id_estado = e.id_estado
         WHERE i.id_instrumento = ?`,
        [id_instrumento]
      );
      if (!inst) return res.status(404).json({ error: "Instrumento no encontrado" });
      if (inst.estado_nombre !== "Disponible") return res.status(400).json({ error: "Instrumento no disponible" });

      // registrar asignación
      await pool.query(
        `INSERT INTO Asignacion_Instrumento (id_instrumento, id_alumno, fecha_asignacion, estado)
        VALUES (?, ?, NOW(), 'Activo')`,
        [id_instrumento, id]
      );

      // Historial del instrumento
      await registrarHistorialInstrumento(
        id_instrumento,
        "ASIGNACION",
        `Asignado al alumno ID: ${id}`,
        usuario
      );

      // actualizar estado instrumento -> id_estado = (estado 'Asignado')
      const [[estAsig]] = await pool.query(
        `SELECT id_estado FROM Estados WHERE nombre = 'Asignado' LIMIT 1`
      );
      if (estAsig && estAsig.id_estado) {
        await pool.query(`UPDATE Instrumento SET id_estado = ? WHERE id_instrumento = ?`, [estAsig.id_estado, id_instrumento]);
      }

      await registrarHistorial(id, "ASIGNACION_INSTRUMENTO", `Instrumento ${id_instrumento} asignado`, usuario);

      res.json({ message: "Instrumento asignado correctamente" });
    } catch (err) {
      console.error("Error en POST /alumnos/:id/instrumento", err);
      res.status(500).json({ error: err.message });
    }
});

// Devolver/quitar instrumento asignado
router.delete('/:id/instrumento', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.body?.usuario || "sistema";

    // buscar asignacion activa
    const [rows] = await pool.query(
      `SELECT * FROM Asignacion_Instrumento WHERE id_alumno = ? AND estado = 'Activo' ORDER BY fecha_asignacion DESC LIMIT 1`,
      [id]
    );
    const asign = rows[0];
    if (!asign) return res.status(404).json({ error: "No hay asignación activa para este alumno" });

    // marcar devolucion
    await pool.query(
      `UPDATE Asignacion_Instrumento
       SET fecha_devolucion_real = NOW(), estado = 'Finalizado'
       WHERE id_asignacion = ?`,
      [asign.id_asignacion]
    );

    // actualizar instrumento a Disponible (id_estado)
    const [[estDisp]] = await pool.query(`SELECT id_estado FROM Estados WHERE nombre = 'Disponible' LIMIT 1`);
    if (estDisp && estDisp.id_estado) {
      await pool.query(`UPDATE Instrumento SET id_estado = ? WHERE id_instrumento = ?`, [estDisp.id_estado, asign.id_instrumento]);
    }

    await registrarHistorial(id, "ASIGNACION_INSTRUMENTO", `Instrumento ${asign.id_instrumento} devuelto`, usuario);

    // Historial del instrumento
    await registrarHistorialInstrumento(
      asign.id_instrumento,
      "DEVOLUCION",
      `Devuelto por alumno ID: ${id}`,
      usuario
    );

    res.json({ message: "Instrumento devuelto / asignación finalizada" });
  } catch (err) {
    console.error("Error en DELETE /alumnos/:id/instrumento", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /alumnos/:id/instrumento (o PUT para devolver)
router.put('/:id/instrumento/devolver', async (req, res) => {
  const { id } = req.params;
  const { id_instrumento } = req.body; // El instrumento que se devuelve

  try {
    // 1️⃣ Verificar si hay asignación activa
    const [asignacion] = await pool.query(
      "SELECT * FROM asignacion_instrumento WHERE id_alumno = ? AND estado = 'Activo' AND id_instrumento = ?",
      [id, id_instrumento]
    );

    if (asignacion.length === 0) {
      return res.status(404).json({ error: "No hay asignación activa para este alumno e instrumento" });
    }

    // 2️⃣ Marcar la asignación como finalizada y registrar fecha de devolución
    await pool.query(
      "UPDATE asignacion_instrumento SET estado = 'Finalizado', fecha_devolucion_real = NOW() WHERE id_asignacion = ?",
      [asignacion[0].id_asignacion]
    );

    // 3️⃣ Actualizar historial del instrumento
    await pool.query(
      "INSERT INTO instrumento_historial (id_instrumento, tipo, descripcion, usuario) VALUES (?, 'DEVOLUCION', ?, ?)",
      [id_instrumento, `Devuelto por alumno ID: ${id}`, "sistema"]
    );

    // 4️⃣ Actualizar estado del instrumento a "Disponible" (id_estado)
    const [[estDisp]] = await pool.query(`SELECT id_estado FROM Estados WHERE nombre = 'Disponible' LIMIT 1`);
    if (estDisp && estDisp.id_estado) {
      await pool.query(
        "UPDATE Instrumento SET id_estado = ? WHERE id_instrumento = ?",
        [estDisp.id_estado, id_instrumento]
      );
    }

    res.json({ message: "Instrumento devuelto correctamente" });
  } catch (err) {
    console.error("Error al devolver instrumento:", err);
    res.status(500).json({ error: "Error al devolver instrumento" });
  }
});

// Documentos de alumno (upload)

// POST /alumnos/:id/documentos (multipart/form-data) -> file + tipo
router.post('/:id/documento', upload.single('file'), async (req, res) => {
try {
    const { id } = req.params;
    const { tipo = "otro", usuario = "sistema" } = req.body;
    if (!req.file) return res.status(400).json({ error: "Archivo requerido (field 'file')" });

    const archivo_url = `/uploads/alumnos/${id}/${req.file.filename}`; // ruta relativa
    await pool.query(`INSERT INTO Alumno_Documento (id_alumno, tipo, archivo_url) VALUES (?, ?, ?)`, [id, tipo, archivo_url]);
    await registrarHistorial(id, "DOCUMENTO", `Documento subido: ${req.file.originalname}`, usuario);
    res.json({ message: "Documento subido", archivo_url });
  } catch (err) {
    console.error("Error en POST /alumnos/:id/documentos", err);
    res.status(500).json({ error: err.message });
  }
});

// GET documentos
router.get('/:id/documentos', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT id_documento, tipo, archivo_url, creado_en FROM Alumno_Documento WHERE id_alumno = ? ORDER BY creado_en DESC`, [id]);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/documentos", err);
    res.status(500).json({ error: err.message });
  }
});

// ASISTENCIA a eventos por alumno
// POST /alumnos/:id/asistencia  { id_evento, asistio: true/false, usuario }
router.post('/:id/asistencia', async (req, res) => {
   try {
    const { id } = req.params;
    const { id_evento, asistio = true, usuario = "sistema" } = req.body;
    if (!id_evento) return res.status(400).json({ error: "id_evento requerido" });

    await pool.query(`INSERT INTO Alumno_Asistencia (id_alumno, id_evento, asistio, usuario) VALUES (?, ?, ?, ?)`, [id, id_evento, asistio ? 1 : 0, usuario]);
    await registrarHistorial(id, "ASISTENCIA", `Registro asistencia evento ${id_evento}: ${asistio ? "Presente" : "Ausente"}`, usuario);
    res.json({ message: "Asistencia registrada" });
  } catch (err) {
    console.error("Error en POST /alumnos/:id/asistencia", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/asistencias', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT id_asistencia, id_evento, asistio, usuario, creado_en FROM Alumno_Asistencia WHERE id_alumno = ? ORDER BY creado_en DESC`, [id]);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/asistencias", err);
    res.status(500).json({ error: err.message });
  }
});



export default router;