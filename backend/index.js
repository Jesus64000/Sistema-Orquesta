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
// ALUMNOS
// =======================

app.get("/alumnos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.nombre AS programa_nombre
       FROM Alumno a
       JOIN Programa p ON a.id_programa = p.id_programa`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/alumnos", async (req, res) => {
  try {
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      id_programa,
      estado,
    } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Alumno (nombre, fecha_nacimiento, genero, telefono_contacto, id_programa, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, id_programa, estado]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      fecha_nacimiento,
      genero,
      telefono_contacto,
      id_programa,
      estado,
    } = req.body;

    await pool.query(
      `UPDATE Alumno
       SET nombre=?, fecha_nacimiento=?, genero=?, telefono_contacto=?, id_programa=?, estado=?
       WHERE id_alumno=?`,
      [nombre, fecha_nacimiento, genero, telefono_contacto, id_programa, estado, id]
    );

    res.json({ message: "Alumno actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Alumno WHERE id_alumno=?", [id]);
    res.json({ message: "Alumno eliminado correctamente" });
  } catch (err) {
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

// Número de alumnos por programa
app.get("/reportes/alumnos-por-programa", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.nombre AS programa, COUNT(a.id_alumno) AS total_alumnos
      FROM Programa p
      LEFT JOIN Alumno a ON p.id_programa = a.id_programa
      GROUP BY p.id_programa
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Instrumentos por estado
app.get("/reportes/instrumentos-por-estado", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT estado, COUNT(*) AS total
      FROM Instrumento
      GROUP BY estado
    `);
    res.json(rows);
  } catch (err) {
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
