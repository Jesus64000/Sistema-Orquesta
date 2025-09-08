// index.js - API completa y consolidada para Sistema Nacional de Orquestas
// ESM module (package.json: { "type": "module" })

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// Config: MySQL Pool
// --------------------
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // ajusta si tu XAMPP tiene contraseña
  database: "sistema_orquesta_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --------------------
// Multer: uploads para documentos de alumnos
// --------------------
const uploadsRoot = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const idAlumno = req.params.id;
    const dir = path.join(uploadsRoot, "alumnos", String(idAlumno));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // timestamp + originalname
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({ storage });

// --------------------
// Helpers
// --------------------

/**
 * Registrar evento en Alumno_Historial
 */
async function registrarHistorial(id_alumno, tipo, descripcion = "", usuario = "sistema") {
  try {
    await pool.query(
      `INSERT INTO Alumno_Historial (id_alumno, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`,
      [id_alumno, tipo, descripcion, usuario]
    );
  } catch (err) {
    console.error("Error registrando historial:", err);
  }
}

/**
 * Registrar evento en Instrumento_Historial
 */
async function registrarHistorialInstrumento(id_instrumento, tipo, descripcion = "", usuario = "sistema") {
  try {
    await pool.query(
      `INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`,
      [id_instrumento, tipo, descripcion, usuario]
    );
  } catch (err) {
    console.error("Error registrando historial instrumento:", err);
  }
}

/**
 * Obtener programas para una lista de alumnos
 */
async function fetchProgramasPorAlumnos(idsAlumnos) {
  if (!idsAlumnos || idsAlumnos.length === 0) return [];
  const [rows] = await pool.query(
    `SELECT ap.id_alumno, p.id_programa, p.nombre
     FROM alumno_programa ap
     JOIN Programa p ON ap.id_programa = p.id_programa
     WHERE ap.id_alumno IN (?)`,
    [idsAlumnos]
  );
  return rows;
}

/**
 * Reutilizable: obtener alumnos con programs (filtros)
 */
async function fetchAlumnosWithPrograms({ search, estado, programa_id, ids } = {}) {
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
  if (ids && Array.isArray(ids) && ids.length) {
    where.push("a.id_alumno IN (?)");
    params.push(ids);
  }

  const joinProgramFilter = programa_id ? "JOIN alumno_programa apf ON a.id_alumno = apf.id_alumno" : "";

  const sql = `
    SELECT DISTINCT a.*
    FROM Alumno a
    ${joinProgramFilter}
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY a.nombre ASC
    LIMIT 5000
  `;

  if (programa_id) params.push(programa_id);

  const [alumnosRows] = await pool.query(sql, params);
  const idsFound = alumnosRows.map((r) => r.id_alumno);
  if (idsFound.length === 0) return [];

  const [programasRows] = await pool.query(
    `SELECT ap.id_alumno, p.id_programa, p.nombre
     FROM alumno_programa ap
     JOIN Programa p ON ap.id_programa = p.id_programa
     WHERE ap.id_alumno IN (?)`,
    [idsFound]
  );

  const mapProg = {};
  for (const pr of programasRows) {
    if (!mapProg[pr.id_alumno]) mapProg[pr.id_alumno] = [];
    mapProg[pr.id_alumno].push({ id_programa: pr.id_programa, nombre: pr.nombre });
  }

  return alumnosRows.map((a) => ({ ...a, programas: mapProg[a.id_alumno] || [] }));
}

// --------------------
// ROUTES
// --------------------

// Root
app.get("/", (req, res) => {
  res.send("API del Sistema Nacional de Orquestas funcionando 🚀");
});

// --------------------
// PROGRAMAS
// --------------------
app.get("/programas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Programa ORDER BY nombre ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/programas", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query("INSERT INTO Programa (nombre, descripcion) VALUES (?, ?)", [nombre, descripcion]);
    res.json({ id_programa: result.insertId, nombre, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/programas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await pool.query("UPDATE Programa SET nombre = ?, descripcion = ? WHERE id_programa = ?", [nombre, descripcion, id]);
    res.json({ message: "Programa actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/programas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Programa WHERE id_programa = ?", [id]);
    res.json({ message: "Programa eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// ALUMNOS (multi-programa, historial, export, bulk)
// --------------------

// Listar alumnos con filtros opcionales: ?search=&estado=&programa_id=&edad_min=&edad_max=
app.get("/alumnos", async (req, res) => {
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
app.get("/alumnos/:id", async (req, res) => {
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
app.post("/alumnos", async (req, res) => {
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
app.put("/alumnos/:id", async (req, res) => {
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

// Eliminar alumno
app.delete("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Alumno WHERE id_alumno = ?", [id]);
    await pool.query("DELETE FROM alumno_programa WHERE id_alumno = ?", [id]);
    res.json({ message: "Alumno eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /alumnos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cambio rápido de estado
app.put("/alumnos/:id/estado", async (req, res) => {
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
app.put("/alumnos/estado-masivo", async (req, res) => {
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
app.post("/alumnos/export-masivo", async (req, res) => {
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
app.get("/alumnos/:id/historial", async (req, res) => {
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
app.post("/alumnos/:id/historial", async (req, res) => {
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
app.put("/alumnos/:id/nota", async (req, res) => {
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
app.get("/alumnos/:id/instrumento", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT i.id_instrumento, i.nombre, i.categoria, i.numero_serie, i.estado as estado_instrumento, ai.fecha_asignacion
       FROM Asignacion_Instrumento ai
       JOIN Instrumento i ON ai.id_instrumento = i.id_instrumento
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
app.post("/alumnos/:id/instrumento", async (req, res) => {
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
app.delete("/alumnos/:id/instrumento", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario = "sistema" } = req.body;

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

// --------------------
// Documentos de alumno (upload)
// --------------------
// POST /alumnos/:id/documentos (multipart/form-data) -> file + tipo
app.post("/alumnos/:id/documentos", upload.single("file"), async (req, res) => {
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
app.get("/alumnos/:id/documentos", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT id_documento, tipo, archivo_url, creado_en FROM Alumno_Documento WHERE id_alumno = ? ORDER BY creado_en DESC`, [id]);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/documentos", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// ASISTENCIA a eventos por alumno
// --------------------
// POST /alumnos/:id/asistencia  { id_evento, asistio: true/false, usuario }
app.post("/alumnos/:id/asistencia", async (req, res) => {
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

app.get("/alumnos/:id/asistencias", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT id_asistencia, id_evento, asistio, usuario, creado_en FROM Alumno_Asistencia WHERE id_alumno = ? ORDER BY creado_en DESC`, [id]);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /alumnos/:id/asistencias", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// REPRESENTANTES
// =======================

// Listar todos los representantes
app.get("/representantes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Representante ORDER BY nombre ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /representantes:", err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener detalle de un representante
app.get("/representantes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query("SELECT * FROM Representante WHERE id_representante = ?", [id]);
    if (!row) return res.status(404).json({ error: "Representante no encontrado" });
    res.json(row);
  } catch (err) {
    console.error("Error en GET /representantes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear representante
app.post("/representantes", async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Representante (nombre, telefono, email) VALUES (?, ?, ?)",
      [nombre, telefono, email]
    );
    res.json({ id_representante: result.insertId, nombre, telefono, email });
  } catch (err) {
    console.error("Error en POST /representantes:", err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar representante
app.put("/representantes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    await pool.query(
      "UPDATE Representante SET nombre=?, telefono=?, email=? WHERE id_representante=?",
      [nombre, telefono, email, id]
    );
    res.json({ message: "Representante actualizado correctamente" });
  } catch (err) {
    console.error("Error en PUT /representantes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar representante
app.delete("/representantes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Representante WHERE id_representante = ?", [id]);
    res.json({ message: "Representante eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /representantes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});


// --------------------
// INSTRUMENTOS CRUD (existentes, preservados)
// --------------------
app.get("/instrumentos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Instrumento ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detalle de instrumento con asignación actual
app.get("/instrumentos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [[instrumento]] = await pool.query(
      `SELECT * FROM Instrumento WHERE id_instrumento = ?`,
      [id]
    );
    if (!instrumento)
      return res.status(404).json({ error: "Instrumento no encontrado" });

    // ¿Está asignado actualmente?
    const [asignado] = await pool.query(
      `SELECT a.id_alumno, a.nombre, ai.fecha_asignacion
       FROM Asignacion_Instrumento ai
       JOIN Alumno a ON ai.id_alumno = a.id_alumno
       WHERE ai.id_instrumento = ? AND ai.estado = 'Activo'
       ORDER BY ai.fecha_asignacion DESC
       LIMIT 1`,
      [id]
    );

    res.json({ ...instrumento, asignado: asignado[0] || null });
  } catch (err) {
    console.error("Error en GET /instrumentos/:id", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear instrumento
app.post("/instrumentos", async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      numero_serie,
      estado = "Disponible",
      fecha_adquisicion = null,
      ubicacion = "",
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Instrumento (nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion]
    );

    // Registrar historial de creación
    await registrarHistorialInstrumento(
      result.insertId,
      "CREACION",
      `Instrumento creado: ${nombre} (${numero_serie})`
    );

    res.json({
      id_instrumento: result.insertId,
      nombre,
      categoria,
      numero_serie,
      estado,
      fecha_adquisicion,
      ubicacion,
    });
  } catch (err) {
    console.error("Error en POST /instrumentos:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/instrumentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion } = req.body;
    await pool.query(
      `UPDATE Instrumento
       SET nombre=?, categoria=?, numero_serie=?, estado=?, fecha_adquisicion=?, ubicacion=?
       WHERE id_instrumento=?`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion, id]
    );
    // registrar historial
    await registrarHistorialInstrumento(id, "ACTUALIZACION", `Instrumento actualizado: ${nombre}`, "sistema");
    res.json({ message: "Instrumento actualizado correctamente" });
  } catch (err) {
    console.error("Error en PUT /instrumentos/:id", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/instrumentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // registrar historial
    await registrarHistorialInstrumento(id, "ELIMINACION", `Instrumento eliminado`, "sistema");
    await pool.query("DELETE FROM Instrumento WHERE id_instrumento=?", [id]);
    res.json({ message: "Instrumento eliminado correctamente" });
  } catch (err) {
    console.error("Error en Delete /instrumentos/:id", err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial de instrumento
app.get("/instrumentos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id_historial, tipo, descripcion, usuario, creado_en
       FROM Instrumento_Historial
       WHERE id_instrumento = ?
       ORDER BY creado_en DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /instrumentos/:id/historial", err);
    res.status(500).json({ error: "Error obteniendo historial instrumento" });
  }
});

// Registrar historial de instrumento
app.post("/instrumentos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = "OTRO", descripcion = "", usuario = "sistema" } = req.body;
    await pool.query(
      `INSERT INTO Instrumento_Historial (id_instrumento, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`,
      [id, tipo, descripcion, usuario]
    );
    res.json({ message: "Historial de instrumento registrado" });
  } catch (err) {
    console.error("Error en POST /instrumentos/:id/historial", err);
    res.status(500).json({ error: "Error guardando historial instrumento" });
  }
});



// --------------------
// EVENTOS
// --------------------
app.get("/eventos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Evento ORDER BY fecha_evento ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/eventos", async (req, res) => {
  try {
    const { titulo, descripcion = "", fecha_evento, lugar = "", id_programa = null } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Evento (titulo, descripcion, fecha_evento, lugar, id_programa) VALUES (?, ?, ?, ?, ?)",
      [titulo, descripcion, fecha_evento, lugar, id_programa]
    );
    res.json({ id_evento: result.insertId, titulo, descripcion, fecha_evento, lugar, id_programa });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_evento, lugar, id_programa = null } = req.body;
    await pool.query("UPDATE Evento SET titulo=?, descripcion=?, fecha_evento=?, lugar=?, id_programa=? WHERE id_evento=?", [titulo, descripcion, fecha_evento, lugar, id_programa, id]);
    res.json({ message: "Evento actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Evento WHERE id_evento=?", [id]);
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eventos futuros (opcionalmente por programa)
app.get("/eventos/futuros", async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `SELECT id_evento, titulo, descripcion, fecha_evento, lugar, id_programa FROM Evento WHERE fecha_evento >= NOW()`;
    const params = [];
    if (programa_id) {
      query += " AND id_programa = ?";
      params.push(programa_id);
    }
    query += " ORDER BY fecha_evento ASC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error en /eventos/futuros:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// REPORTES
// --------------------
// Alumnos por programa (ajustado many-to-many)
app.get("/reportes/alumnos-por-programa", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.nombre AS programa, COUNT(ap.id_alumno) AS cantidad
      FROM Programa p
      LEFT JOIN alumno_programa ap ON p.id_programa = ap.id_programa
      GROUP BY p.id_programa
      ORDER BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error en /reportes/alumnos-por-programa:", err);
    res.status(500).json({ error: err.message });
  }
});

// Instrumentos por estado
app.get("/reportes/instrumentos-por-estado", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT estado, COUNT(id_instrumento) AS cantidad FROM Instrumento GROUP BY estado`);
    res.json(rows);
  } catch (err) {
    console.error("Error en /reportes/instrumentos-por-estado:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// USUARIOS (CONFIGURACIONES)
// --------------------
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_usuario, nombre, email, rol FROM Usuario");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) return res.status(400).json({ error: "Todos los campos son requeridos" });
    const [result] = await pool.query("INSERT INTO Usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)", [nombre, email, password, rol]);
    res.json({ id_usuario: result.insertId, nombre, email, rol });
  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;
    const [result] = await pool.query("UPDATE Usuario SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?", [nombre, email, rol, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ id, nombre, email, rol });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM Usuario WHERE id_usuario = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// --------------------
// DASHBOARD (ajustado many-to-many)
// --------------------

app.get("/dashboard/stats", async (req, res) => {
  try {
    const { programa_id } = req.query;

    // totalAlumnos
    let totalAlumnos = 0;
    if (programa_id) {
      const [r] = await pool.query(`SELECT COUNT(DISTINCT ap.id_alumno) AS total FROM alumno_programa ap WHERE ap.id_programa = ?`, [programa_id]);
      totalAlumnos = r[0]?.total || 0;
    } else {
      const [r] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno`);
      totalAlumnos = r[0]?.total || 0;
    }

    // activos
    let activos = 0;
    if (programa_id) {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN Alumno a ON ap.id_alumno = a.id_alumno
         WHERE ap.id_programa = ? AND a.estado = 'Activo'`,
        [programa_id]
      );
      activos = r[0]?.total || 0;
    } else {
      const [r] = await pool.query(`SELECT COUNT(*) AS total FROM Alumno WHERE estado = 'Activo'`);
      activos = r[0]?.total || 0;
    }

    // nuevosHoy: usamos Alumno_Historial donde tipo='CREACION'
    let nuevosHoy = 0;
    if (programa_id) {
      const [r] = await pool.query(
        `SELECT COUNT(DISTINCT ap.id_alumno) AS total
         FROM alumno_programa ap
         JOIN Alumno_Historial h ON ap.id_alumno = h.id_alumno AND DATE(h.creado_en) = CURDATE() AND h.tipo = 'CREACION'
         WHERE ap.id_programa = ?`,
        [programa_id]
      );
      nuevosHoy = r[0]?.total || 0;
    } else {
      const [r] = await pool.query(`SELECT COUNT(DISTINCT id_alumno) AS total FROM Alumno_Historial WHERE DATE(creado_en) = CURDATE() AND tipo = 'CREACION'`);
      nuevosHoy = r[0]?.total || 0;
    }

    // personal (admins)
    const [p] = await pool.query(`SELECT COUNT(*) AS total FROM Usuario WHERE rol = 'Admin'`);
    const personal = p[0]?.total || 0;

    res.json({ totalAlumnos, activos, nuevosHoy, personal });
  } catch (err) {
    console.error("Error en /dashboard/stats:", err);
    res.status(500).json({ error: "Error cargando estadísticas" });
  }
});

app.get("/dashboard/proximo-evento", async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `SELECT * FROM Evento WHERE fecha_evento >= CURDATE()`;
    const params = [];
    if (programa_id) {
      query += " AND id_programa = ?";
      params.push(programa_id);
    }
    query += " ORDER BY fecha_evento ASC LIMIT 1";
    const [rows] = await pool.query(query, params);
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error en /dashboard/proximo-evento:", err);
    res.status(500).json({ error: "Error cargando próximo evento" });
  }
});

app.get("/dashboard/eventos-futuros", async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `SELECT * FROM Evento WHERE fecha_evento >= CURDATE()`;
    const params = [];
    if (programa_id) {
      query += " AND id_programa = ?";
      params.push(programa_id);
    }
    query += " ORDER BY fecha_evento ASC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error en /dashboard/eventos-futuros:", err);
    res.status(500).json({ error: "Error cargando eventos futuros" });
  }
});

app.get("/dashboard/eventos-mes", async (req, res) => {
  try {
    const { year, month, programa_id } = req.query;
    let query = `SELECT id_evento, titulo, fecha_evento, lugar FROM Evento WHERE YEAR(fecha_evento)=? AND MONTH(fecha_evento)=?`;
    const params = [year, month];
    if (programa_id) {
      query += " AND id_programa = ?";
      params.push(programa_id);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error en /dashboard/eventos-mes:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Servidor
// --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
