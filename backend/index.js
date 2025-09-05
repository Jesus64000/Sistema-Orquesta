import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conexión a MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // cámbialo si tu XAMPP tiene contraseña
  database: "sistema_orquesta_db",
});

// =======================
// PROGRAMAS
// =======================

// Listar programas
app.get("/programas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Programa");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear programa
app.post("/programas", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Programa (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar programa
app.put("/programas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await pool.query(
      "UPDATE Programa SET nombre=?, descripcion=? WHERE id_programa=?",
      [nombre, descripcion, id]
    );
    res.json({ message: "Programa actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar programa
app.delete("/programas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Programa WHERE id_programa=?", [id]);
    res.json({ message: "Programa eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ALUMNOS (soporte multi-programa)
// =======================

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

// GET /alumnos
app.get("/alumnos", async (req, res) => {
  try {
    const { search, estado, programa_id } = req.query;

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

    const joinProgramFilter = programa_id ? "JOIN alumno_programa apf ON a.id_alumno = apf.id_alumno" : "";

    const sql = `
      SELECT DISTINCT a.*
      FROM Alumno a
      ${joinProgramFilter}
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY a.nombre ASC
      LIMIT 1000
    `;

    if (programa_id) params.push(programa_id);

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

// GET /alumnos/:id
app.get("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[alumno]] = await pool.query(`SELECT * FROM Alumno WHERE id_alumno = ?`, [id]);
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const [programasRows] = await pool.query(
      `SELECT p.id_programa, p.nombre
       FROM alumno_programa ap
       JOIN Programa p ON ap.id_programa = p.id_programa
       WHERE ap.id_alumno = ?`,
      [id]
    );

    res.json({
      ...alumno,
      programas: programasRows || [],
    });
  } catch (err) {
    console.error("Error en GET /alumnos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /alumnos
app.post("/alumnos", async (req, res) => {
  try {
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      estado,
      programa_ids,
      programas,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Alumno (nombre, fecha_nacimiento, genero, telefono_contacto, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, estado]
    );
    const id_alumno = result.insertId;

    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    if (progIds.length > 0) {
      const slice = progIds.slice(0, 2);
      for (const id_programa of slice) {
        await pool.query(
          `INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`,
          [id_alumno, id_programa]
        );
      }
    }

    const [programasRows] = progIds.length > 0
      ? await pool.query(
          `SELECT p.id_programa, p.nombre
           FROM alumno_programa ap
           JOIN Programa p ON ap.id_programa = p.id_programa
           WHERE ap.id_alumno = ?`,
          [id_alumno]
        )
      : [ [] ];

    res.json({ id_alumno, nombre, fecha_nacimiento, genero, telefono_contacto, estado, programas: programasRows || [] });
  } catch (err) {
    console.error("Error en POST /alumnos:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /alumnos/:id
app.put("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      estado,
      programa_ids,
      programas,
    } = req.body;

    await pool.query(
      `UPDATE Alumno
       SET nombre=?, fecha_nacimiento=?, genero=?, telefono_contacto=?, estado=?
       WHERE id_alumno=?`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, estado, id]
    );

    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    await pool.query(`DELETE FROM alumno_programa WHERE id_alumno = ?`, [id]);
    if (progIds.length > 0) {
      const slice = progIds.slice(0, 2);
      for (const id_programa of slice) {
        await pool.query(
          `INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`,
          [id, id_programa]
        );
      }
    }

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

// DELETE /alumnos/:id
app.delete("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Alumno WHERE id_alumno = ?", [id]);
    res.json({ message: "Alumno eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /alumnos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Helpers: historial & utilidades
// -------------------------

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

// Historial alumno
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

app.post("/alumnos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = "OTRO", descripcion = "", usuario = "sistema" } = req.body;
    await pool.query(
      `INSERT INTO Alumno_Historial (id_alumno, tipo, descripcion, usuario) VALUES (?, ?, ?, ?)`,
      [id, tipo, descripcion, usuario]
    );
    res.json({ message: "Historial registrado" });
  } catch (err) {
    console.error("Error en POST /alumnos/:id/historial", err);
    res.status(500).json({ error: "Error guardando historial" });
  }
});

// Nota alumno
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

// Instrumento asignado
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

// Exportar alumnos CSV
app.get("/alumnos/export", async (req, res) => {
  try {
    const { format = "csv", search, estado, programa_id } = req.query;
    const alumnos = await fetchAlumnosWithPrograms({ search, estado, programa_id });

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
      res.setHeader("Content-Disposition", `attachment; filename="alumnos_export_${Date.now()}.csv"`);
      return res.send(csv);
    }

    res.status(400).json({ error: "Formato no soportado (usa format=csv por ahora)" });
  } catch (err) {
    console.error("Error en GET /alumnos/export", err);
    res.status(500).json({ error: "Error exportando alumnos" });
  }
});

// =======================
// INSTRUMENTOS
// =======================

app.get("/instrumentos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Instrumento");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/instrumentos", async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      numero_serie,
      estado,
      fecha_adquisicion,
      ubicacion,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Instrumento (nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion]
    );

    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/instrumentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria,
      numero_serie,
      estado,
      fecha_adquisicion,
      ubicacion,
    } = req.body;

    await pool.query(
      `UPDATE Instrumento
       SET nombre=?, categoria=?, numero_serie=?, estado=?, fecha_adquisicion=?, ubicacion=?
       WHERE id_instrumento=?`,
      [nombre, categoria, numero_serie, estado, fecha_adquisicion, ubicacion, id]
    );

    res.json({ message: "Instrumento actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/instrumentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Instrumento WHERE id_instrumento=?", [id]);
    res.json({ message: "Instrumento eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// EVENTOS
// =======================

app.get("/eventos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Evento");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/eventos", async (req, res) => {
  try {
    const { titulo, descripcion, fecha_evento, lugar } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Evento (titulo, descripcion, fecha_evento, lugar) VALUES (?, ?, ?, ?)",
      [titulo, descripcion, fecha_evento, lugar]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_evento, lugar } = req.body;

    await pool.query(
      "UPDATE Evento SET titulo=?, descripcion=?, fecha_evento=?, lugar=? WHERE id_evento=?",
      [titulo, descripcion, fecha_evento, lugar, id]
    );

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

// Eventos futuros
app.get("/eventos/futuros", async (req, res) => {
  const { programa_id } = req.query;
  try {
    let query = `
      SELECT id_evento, titulo, descripcion, fecha_evento, lugar
      FROM Evento
      WHERE fecha_evento >= NOW()
    `;
    const params = [];

    if (programa_id) {
      query += " AND id_programa = ?";
      params.push(programa_id);
    }

    query += " ORDER BY fecha_evento ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo eventos futuros:", error);
    res.status(500).json({ error: "Error obteniendo eventos futuros" });
  }
});

// =======================
// REPORTES (muchos-a-muchos)
// =======================

// Número de alumnos por programa
app.get("/reportes/alumnos-por-programa", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.nombre AS programa, COUNT(ap.id_alumno) AS total_alumnos
      FROM Programa p
      LEFT JOIN alumno_programa ap ON p.id_programa = ap.id_programa
      GROUP BY p.id_programa
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
    const [rows] = await pool.query(`
      SELECT estado, COUNT(id_instrumento) AS cantidad
      FROM Instrumento
      GROUP BY estado
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error en /reportes/instrumentos-por-estado:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// USUARIOS
// =======================

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
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const [result] = await pool.query(
      "INSERT INTO Usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, password, rol]
    );
    res.json({ id: result.insertId, nombre, email, rol });
  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const [result] = await pool.query(
      "UPDATE Usuario SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?",
      [nombre, email, rol, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ id, nombre, email, rol });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM Usuario WHERE id_usuario = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// =======================
// DASHBOARD
// =======================

// Estadísticas rápidas
app.get("/dashboard/stats", async (req, res) => {
  try {
    const { programa_id } = req.query;

    // --- Total alumnos ---
    let queryAlumnos = `
      SELECT COUNT(DISTINCT a.id_alumno) AS total
      FROM alumno a
      ${programa_id ? "JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno" : ""}
      ${programa_id ? "WHERE ap.id_programa = ?" : ""}
    `;
    const [alumnos] = await pool.query(queryAlumnos, programa_id ? [programa_id] : []);

    // --- Activos ---
    let queryActivos = `
      SELECT COUNT(DISTINCT a.id_alumno) AS total
      FROM alumno a
      ${programa_id ? "JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno" : ""}
      WHERE a.estado = 'Activo'
      ${programa_id ? "AND ap.id_programa = ?" : ""}
    `;
    const [activos] = await pool.query(queryActivos, programa_id ? [programa_id] : []);

    // --- Nuevos hoy ---
    let queryNuevos = `
      SELECT COUNT(DISTINCT a.id_alumno) AS total
      FROM alumno a
      ${programa_id ? "JOIN alumno_programa ap ON a.id_alumno = ap.id_alumno" : ""}
      WHERE DATE(a.creado_en) = CURDATE()
      ${programa_id ? "AND ap.id_programa = ?" : ""}
    `;
    const [nuevos] = await pool.query(queryNuevos, programa_id ? [programa_id] : []);

    // --- Personal activo ---
    const [personal] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuario WHERE rol = 'Admin'`
    );

    res.json({
      totalAlumnos: alumnos[0].total,
      activos: activos[0].total,
      nuevosHoy: nuevos[0].total,
      personal: personal[0].total,
    });
  } catch (err) {
    console.error("Error en /dashboard/stats:", err);
    res.status(500).json({ error: "Error cargando estadísticas" });
  }
});

// Próximo evento (multi-programa)
app.get("/dashboard/proximo-evento", async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `
      SELECT e.* 
      FROM Evento e
      ${programa_id ? "WHERE e.id_programa = ?" : "WHERE 1=1"}
      AND e.fecha_evento >= CURDATE()
      ORDER BY e.fecha_evento ASC 
      LIMIT 1
    `;
    const [rows] = await pool.query(query, programa_id ? [programa_id] : []);
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error en /dashboard/proximo-evento:", err);
    res.status(500).json({ error: "Error cargando próximo evento" });
  }
});

// Eventos futuros (multi-programa)
app.get("/dashboard/eventos-futuros", async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = `
      SELECT e.* 
      FROM Evento e
      ${programa_id ? "WHERE e.id_programa = ?" : "WHERE 1=1"}
      AND e.fecha_evento >= CURDATE()
      ORDER BY e.fecha_evento ASC
    `;
    const [rows] = await pool.query(query, programa_id ? [programa_id] : []);
    res.json(rows);
  } catch (err) {
    console.error("Error en /dashboard/eventos-futuros:", err);
    res.status(500).json({ error: "Error cargando eventos futuros" });
  }
});


app.get("/dashboard/eventos-mes", async (req, res) => {
  const { year, month } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT id_evento, titulo, fecha_evento 
       FROM Evento 
       WHERE YEAR(fecha_evento)=? AND MONTH(fecha_evento)=?`,
      [year, month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== SERVIDOR ======================
app.get("/", (req, res) => {
  res.send("API del Sistema Nacional de Orquestas funcionando 🚀");
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
