// backend/routes/alumnos.js
import { Router } from 'express';
import pool from '../db.js';
import upload from '../uploads.config.js';
import { registrarHistorial, registrarHistorialInstrumento } from '../helpers/historial.js';
import alumnosHelpers from '../helpers/alumnos.js';

const { fetchProgramasPorAlumnos, fetchAlumnosWithPrograms } = alumnosHelpers;

const router = Router();

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

// PUT /alumnos/:id/estado
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener estado actual del alumno
    const [alumno] = await pool.query(
      'SELECT estado FROM Alumno WHERE id_alumno = ?',
      [id]
    );

    if (!alumno.length) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Alternar estado
    const nuevoEstado = alumno[0].estado === 'Activo' ? 'Inactivo' : 'Activo';

    // Actualizar estado en la DB
    await pool.query(
      'UPDATE Alumno SET estado = ? WHERE id_alumno = ?',
      [nuevoEstado, id]
    );

    // Insertar en historial
    await pool.query(
      `INSERT INTO alumno_historial (id_alumno, tipo, descripcion, usuario)
       VALUES (?, 'ESTADO', ?, ?)`,
      [
        id,
        `Alumno cambiado a ${nuevoEstado}`,
        req.user?.nombre || 'Sistema', // 👈 aquí depende de si manejas login
      ]
    );

    res.json({ id_alumno: id, estado: nuevoEstado });
  } catch (err) {
    console.error('Error cambiando estado:', err);
    res.status(500).json({ error: err.message });
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

      if (format === "csv") {
        const headers = ["id_alumno", "nombre", "fecha_nacimiento", "genero", "telefono_contacto", "estado", "programas", "nota"];
        const lines = [headers.join(",")];
        for (const a of alumnos) {
          const programasStr = (a.programas || []).map((p) => p.nombre).join(" | ");
          const row = [
            a.id_alumno,
            `"${String(a.nombre || "").replace(/"/g, '""')}"`,
            a.fecha_nacimiento ? a.fecha_nacimiento.slice(0, 10) : "",
            a.genero || "",
            `"${String(a.telefono_contacto || "").replace(/"/g, '""')}"`,
            a.estado || "",
            `"${String(programasStr).replace(/"/g, '""')}"`,
            `"${String(a.nota || "").replace(/"/g, '""')}"`,
          ];
          lines.push(row.join(","));
        }
        const csv = lines.join("\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="alumnos_export_masivo_${Date.now()}.csv"`);
        return res.send(csv);
      }
      res.status(400).json({ error: "Formato no soportado" });
    } catch (err) {
      console.error("Error en POST /alumnos/export-masivo:", err);
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
      `SELECT i.id_instrumento, i.nombre, i.numero_serie, i.estado as estado_instrumento, ai.fecha_asignacion,
              c.nombre as categoria_nombre
       FROM Asignacion_Instrumento ai
       JOIN Instrumento i ON ai.id_instrumento = i.id_instrumento
       LEFT JOIN Categoria c ON i.id_categoria = c.id_categoria
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
      const [[inst]] = await pool.query("SELECT * FROM Instrumento WHERE id_instrumento = ?", [id_instrumento]);
      if (!inst) return res.status(404).json({ error: "Instrumento no encontrado" });
      if (inst.estado !== "Disponible") return res.status(400).json({ error: "Instrumento no disponible" });

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

      // actualizar estado instrumento
      await pool.query(`UPDATE Instrumento SET estado = 'Asignado' WHERE id_instrumento = ?`, [id_instrumento]);

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

    // actualizar instrumento a Disponible
    await pool.query(`UPDATE Instrumento SET estado = 'Disponible' WHERE id_instrumento = ?`, [asign.id_instrumento]);

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

    // 4️⃣ Actualizar estado del instrumento a "Disponible"
    await pool.query(
      "UPDATE instrumento SET estado = 'Disponible' WHERE id_instrumento = ?",
      [id_instrumento]
    );

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