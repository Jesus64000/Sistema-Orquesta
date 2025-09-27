// backend/index.js
// index.js - API completa y consolidada para Sistema Nacional de Orquestas
// ESM module (package.json: { "type": "module" })

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./db.js"; // Asegúrate de tener la conexión a la base de datos

import alumnosRouter from "./routes/alumnos.js";
import programasRouter from "./routes/programas.js";
import instrumentosRouter from "./routes/instrumentos.js";
import representantesRouter from "./routes/representantes.js";
import eventosRouter from "./routes/eventos.js";
import reportesRouter from "./routes/reportes.js";
import usuariosRouter from "./routes/usuarios.js";
import dashboardRouter from "./routes/dashboard.js";

// Administración
import adminUsuariosRouter from "./routes/administracion/usuarios.js";
import adminRolesRouter from "./routes/administracion/roles.js";
import adminCategoriasRouter from "./routes/administracion/categorias.js";
import adminInstrumentosRouter from "./routes/administracion/instrumentos.js";
// import adminInstrumentosRouter from "./routes/administracion/instrumentos.js";
import adminEstadosRouter from "./routes/administracion/estados.js";
import adminRepresentantesRouter from "./routes/administracion/representantes.js";
// import adminRepresentantesRouter from "./routes/administracion/representantes.js";
import adminEventosRouter from "./routes/administracion/eventos.js";
// import adminEventosRouter from "./routes/administracion/eventos.js";
import adminProgramasRouter from "./routes/administracion/programas.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Rutas principales
app.use("/alumnos", alumnosRouter);
app.use("/programas", programasRouter);
app.use("/instrumentos", instrumentosRouter);
app.use("/representantes", representantesRouter);
app.use("/eventos", eventosRouter);
app.use("/reportes", reportesRouter);
app.use("/usuarios", usuariosRouter);
app.use("/dashboard", dashboardRouter);

// Rutas de administración (todas bajo /administracion/{entidad})
app.use("/administracion/usuarios", adminUsuariosRouter);
app.use("/administracion/roles", adminRolesRouter);
app.use("/administracion/categorias", adminCategoriasRouter);
// app.use("/administracion/instrumentos", adminInstrumentosRouter);
app.use("/administracion/estados", adminEstadosRouter);
// app.use("/administracion/representantes", adminRepresentantesRouter);
app.use("/administracion/eventos", adminEventosRouter);
// app.use("/administracion/eventos", adminEventosRouter);
app.use("/administracion/programas", adminProgramasRouter);

// --------------------
// Servidor
// --------------------
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1"); // prueba de conexión
    console.log("Conexión a DB OK");

    // Migraciones ligeras en caliente (idempotentes)
    await ensureMigrations();
    app.listen(PORT, () =>
      console.log(`API escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Error conectando a la DB:", err);
    process.exit(1);
  }
}

start();

// --------------------
// Migraciones simples
// --------------------
async function ensureMigrations() {
  try {
    // 1. Verificar columna estado en Evento
    const [cols] = await pool.query("SHOW COLUMNS FROM Evento LIKE 'estado'");
    if (cols.length === 0) {
      console.log('[migracion] Añadiendo columna estado a Evento');
      await pool.query("ALTER TABLE Evento ADD COLUMN estado ENUM('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROGRAMADO' AFTER id_programa");
    }

    // 2. Verificar tabla evento_historial
    const [tbl] = await pool.query("SHOW TABLES LIKE 'evento_historial'");
    if (tbl.length === 0) {
      console.log('[migracion] Creando tabla evento_historial');
      await pool.query(`CREATE TABLE evento_historial (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_evento INT NOT NULL,
        campo VARCHAR(50) NOT NULL,
        valor_anterior TEXT,
        valor_nuevo TEXT,
        usuario VARCHAR(100) DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_evento) REFERENCES Evento(id_evento) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }
  } catch (err) {
    console.error('Error en migraciones automáticas:', err.message);
  }
}