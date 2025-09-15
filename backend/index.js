// backend/index.js
// index.js - API completa y consolidada para Sistema Nacional de Orquestas
// ESM module (package.json: { "type": "module" })

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./db.js"; // Asegúrate de tener la conexión a la base de datos
import alumnosRouter from "./routes/alumnos.js"; // Importa las rutas de alumnos
import programasRouter from "./routes/programas.js"; // Importa las rutas de programas
import instrumentosRouter from "./routes/instrumentos.js"; // Importa las rutas de instrumentos
import representantesRouter from "./routes/representantes.js"; // Importa las rutas de representantes
import eventosRouter from "./routes/eventos.js"; // Importa las rutas de eventos
import reportesRouter from "./routes/reportes.js"; // Importa las rutas de reportes
import usuariosRouter from "./routes/usuarios.js"; // Importa las rutas de usuarios
import dashboardRouter from "./routes/dashboard.js"; // Importa las rutas de dashboard

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/alumnos", alumnosRouter); // Rutas de alumnos
app.use("/programas", programasRouter); // Rutas de programas
app.use("/instrumentos", instrumentosRouter); // Rutas de instrumentos
app.use("/representantes", representantesRouter); // Rutas de representantes
app.use("/eventos", eventosRouter); // Rutas de eventos
app.use("/reportes", reportesRouter); // Rutas de reportes
app.use("/usuarios", usuariosRouter); // Rutas de usuarios
app.use("/dashboard", dashboardRouter); // Rutas de dashboard

// --------------------
// Servidor
// --------------------
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1"); // prueba de conexión
    console.log("Conexión a DB OK");
    app.listen(PORT, () =>
      console.log(`API escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Error conectando a la DB:", err);
    process.exit(1);
  }
}

start();