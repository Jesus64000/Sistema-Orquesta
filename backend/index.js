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
import adminParentescosRouter from "./routes/administracion/parentescos.js";
import { ensureMigrations } from "./migrations/ensureMigrations.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware: usuario simulado (solo para desarrollo, sin autenticación real)
app.use(async (req, _res, next) => {
  try {
    const userId = req.header('x-user-id');
    if (userId) {
      const [rows] = await pool.query(`
        SELECT u.id_usuario, u.nombre, u.email, u.id_rol, r.nombre AS rol_nombre, r.permisos
        FROM usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?
      `, [userId]);
      if (rows[0]) {
        const u = rows[0];
        req.user = {
          id: u.id_usuario,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol_nombre,
          id_rol: u.id_rol,
          permisos: (() => { try { return u.permisos ? JSON.parse(u.permisos) : []; } catch { return []; } })()
        };
      }
    }
  } catch {}
  next();
});

// Ruta utilitaria para comprobar el usuario cargado
app.get('/me', (req, res) => {
  if (!req.user) return res.status(200).json({ anonimo: true });
  res.json(req.user);
});


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
app.use("/administracion/parentescos", adminParentescosRouter);

// --------------------
// Servidor
// --------------------
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1"); // prueba de conexión
    console.log("Conexión a DB OK");

    // Migraciones ligeras en caliente (idempotentes)
    if (process.env.MIGRATIONS !== 'off') {
      await ensureMigrations(pool);
    } else {
      console.log("Migraciones desactivadas por variable de entorno MIGRATIONS=off");
    }
    app.listen(PORT, () =>
      console.log(`API escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Error conectando a la DB:", err);
    process.exit(1);
  }
}

start();