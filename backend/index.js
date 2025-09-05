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

/**
 * Helper: obtener programas por una lista de ids_alumno
 * devuelve array de filas: { id_alumno, id_programa, nombre }
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

// GET /alumnos  -> lista con filtros opcionales: ?search=&estado=&programa_id=
app.get("/alumnos", async (req, res) => {
  try {
    const { search, estado, programa_id } = req.query;

    const params = [];
    const where = [];

    // Busqueda por nombre o telefono
    if (search) {
      where.push("(a.nombre LIKE ? OR a.telefono_contacto LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (estado) {
      where.push("a.estado = ?");
      params.push(estado);
    }

    // Si se filtra por programa, necesitamos JOIN con alumno_programa
    const joinProgramFilter = programa_id ? "JOIN alumno_programa apf ON a.id_alumno = apf.id_alumno" : "";

    const sql = `
      SELECT DISTINCT a.*
      FROM Alumno a
      ${joinProgramFilter}
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY a.nombre ASC
      LIMIT 1000
    `;

    // si se filtró por programa, lo agregamos a params (apf condicion)
    if (programa_id) params.push(programa_id);

    const [alumnosRows] = await pool.query(sql, params);

    const ids = alumnosRows.map((r) => r.id_alumno);
    const programasRows = await fetchProgramasPorAlumnos(ids);

    // Agrupar programas por alumno
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

// GET /alumnos/:id -> detalle con programas
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

// POST /alumnos  -> acepta { nombre, fecha_nacimiento, genero, telefono_contacto, estado, programa_ids:[], programas:[] }
app.post("/alumnos", async (req, res) => {
  try {
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      estado,
      // soporte ambos nombres (frontend usa programa_ids)
      programa_ids,
      programas,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Alumno (nombre, fecha_nacimiento, genero, telefono_contacto, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, estado]
    );
    const id_alumno = result.insertId;

    // decidir array de programas a insertar (ids)
    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    // insertar relaciones (máx 2)
    if (progIds.length > 0) {
      const slice = progIds.slice(0, 2);
      for (const id_programa of slice) {
        await pool.query(
          `INSERT INTO alumno_programa (id_alumno, id_programa) VALUES (?, ?)`,
          [id_alumno, id_programa]
        );
      }
    }

    // devolver el nuevo alumno (con programas)
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

// PUT /alumnos/:id -> actualiza alumno y reemplaza programas
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

    // decidir array de programas
    const progIds = Array.isArray(programa_ids) && programa_ids.length ? programa_ids
      : Array.isArray(programas) && programas.length ? programas
      : [];

    // reemplazar relaciones: borramos y reinsertamos (máx 2)
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

    // devolver alumno actualizado
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

// =======================
// Eventos - Futuros
// =======================
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
// REPORTES (solo lectura)
// =======================


// =======================
// REPORTES (ajustados a muchos-a-muchos)
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




// =============================
// 📊 REPORTES
// =============================

// Alumnos por programa
app.get("/reportes/alumnos-por-programa", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.nombre AS programa, COUNT(a.id_alumno) AS cantidad
      FROM Programa p
      LEFT JOIN Alumno a ON p.id_programa = a.id_programa
      GROUP BY p.nombre
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reporte de alumnos" });
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
    res.status(500).json({ error: "Error al obtener reporte de instrumentos" });
  }
});

// =============================
// ⚙️ USUARIOS (CONFIGURACIONES)
// =============================

// Obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_usuario, nombre, email, rol FROM Usuario");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear usuario
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Guardamos la contraseña como hash
    const [result] = await pool.query(
      "INSERT INTO Usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, password, rol] // ⚠️ en producción deberíamos encriptar el password
    );
    res.json({ id: result.insertId, nombre, email, rol });
  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Actualizar usuario
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

// Eliminar usuario
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

// === DASHBOARD ===

// Estadísticas rápidas
app.get("/dashboard/stats", async (req, res) => {
  try {
    const { programa_id } = req.query;

    // --- Total alumnos ---
    let queryAlumnos = "SELECT COUNT(*) AS total FROM alumno a";
    let params = [];

    if (programa_id) {
      queryAlumnos += " WHERE a.id_programa = ?";
      params.push(programa_id);
    }

    const [alumnos] = await pool.query(queryAlumnos, params);

    // --- Activos ---
    let queryActivos = "SELECT COUNT(*) AS total FROM alumno a WHERE a.estado = 'Activo'";
    params = [];

    if (programa_id) {
      queryActivos += " AND a.id_programa = ?";
      params.push(programa_id);
    }

    const [activos] = await pool.query(queryActivos, params);

    // --- Nuevos hoy ---
    let queryNuevos = "SELECT COUNT(*) AS total FROM alumno a WHERE DATE(a.creado_en) = CURDATE()";
    params = [];

    if (programa_id) {
      queryNuevos += " AND a.id_programa = ?";
      params.push(programa_id);
    }

    const [nuevos] = await pool.query(queryNuevos, params);

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


// Próximo evento
app.get("/dashboard/proximo-evento", async (req, res) => {
  try {
    const { programa_id } = req.query;
    const filtro = programa_id ? "WHERE e.id_programa = ?" : "";
    const params = programa_id ? [programa_id] : [];

    const [rows] = await pool.query(
      `SELECT * FROM evento e 
       ${filtro} 
       AND e.fecha_evento >= CURDATE()
       ORDER BY e.fecha_evento ASC 
       LIMIT 1`,
      params
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error en /dashboard/proximo-evento:", err);
    res.status(500).json({ error: "Error cargando próximo evento" });
  }
});

app.get("/dashboard/eventos-futuros", async (req, res) => {
  try {
    const { programa_id } = req.query;
    const filtro = programa_id ? "WHERE e.id_programa = ?" : "";
    const params = programa_id ? [programa_id] : [];

    const [rows] = await pool.query(
      `SELECT * FROM evento e 
       ${filtro} 
       AND e.fecha_evento >= CURDATE()
       ORDER BY e.fecha_evento ASC`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("Error en /dashboard/eventos-futuros:", err);
    res.status(500).json({ error: "Error cargando eventos futuros" });
  }
});

// Eventos del mes (para calendario)
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
