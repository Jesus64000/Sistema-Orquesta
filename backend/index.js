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

    // 3. Tabla Parentesco
    const [tblPar] = await pool.query("SHOW TABLES LIKE 'Parentesco'");
    if (tblPar.length === 0) {
      console.log('[migracion] Creando tabla Parentesco');
      await pool.query(`CREATE TABLE Parentesco (
        id_parentesco INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      // Semillas básicas
      await pool.query("INSERT INTO Parentesco (nombre) VALUES ('Padre'),('Madre'),('Tutor'),('Hermano'),('Abuelo'),('Otro')");
    }

    // 3b. Asegurar columnas creado_en / actualizado_en en Parentesco si la tabla ya existía antes
    else {
      try {
        const [cCreado] = await pool.query("SHOW COLUMNS FROM Parentesco LIKE 'creado_en'");
        if (cCreado.length === 0) {
          console.log('[migracion] Añadiendo columna creado_en a Parentesco');
          await pool.query("ALTER TABLE Parentesco ADD COLUMN creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER activo");
        }
      } catch (err) { console.error('Error añadiendo creado_en a Parentesco:', err.message); }
      try {
        const [cAct] = await pool.query("SHOW COLUMNS FROM Parentesco LIKE 'actualizado_en'");
        if (cAct.length === 0) {
          console.log('[migracion] Añadiendo columna actualizado_en a Parentesco');
          await pool.query("ALTER TABLE Parentesco ADD COLUMN actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER creado_en");
        }
      } catch (err) { console.error('Error añadiendo actualizado_en a Parentesco:', err.message); }
    }

    // 4. Columnas nuevas en Representante (apellido, ci, telefono_movil, id_parentesco, activo, creado_en, actualizado_en, creado_por, actualizado_por)
    const newColumns = [
      { name: 'apellido', ddl: "ALTER TABLE Representante ADD COLUMN apellido VARCHAR(100) NULL AFTER nombre" },
      { name: 'ci', ddl: "ALTER TABLE Representante ADD COLUMN ci VARCHAR(20) NULL AFTER apellido" },
      { name: 'telefono_movil', ddl: "ALTER TABLE Representante ADD COLUMN telefono_movil VARCHAR(20) NULL AFTER telefono" },
      { name: 'id_parentesco', ddl: "ALTER TABLE Representante ADD COLUMN id_parentesco INT NULL AFTER email" },
      { name: 'activo', ddl: "ALTER TABLE Representante ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER id_parentesco" },
      { name: 'creado_en', ddl: "ALTER TABLE Representante ADD COLUMN creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER activo" },
      { name: 'actualizado_en', ddl: "ALTER TABLE Representante ADD COLUMN actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER creado_en" },
      { name: 'creado_por', ddl: "ALTER TABLE Representante ADD COLUMN creado_por INT NULL AFTER actualizado_en" },
      { name: 'actualizado_por', ddl: "ALTER TABLE Representante ADD COLUMN actualizado_por INT NULL AFTER creado_por" }
    ];
    for (const col of newColumns) {
      try {
        const [c] = await pool.query(`SHOW COLUMNS FROM Representante LIKE '${col.name}'`);
        if (c.length === 0) {
          console.log(`[migracion] Añadiendo columna ${col.name} a Representante`);
          await pool.query(col.ddl);
        }
      } catch (err) {
        console.error(`Error añadiendo columna ${col.name}:`, err.message);
      }
    }

    // 5. FK id_parentesco si no existe
    try {
      const [fk] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME='Representante' AND COLUMN_NAME='id_parentesco' AND CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL");
      if (fk.length === 0) {
        console.log('[migracion] Añadiendo FK Representante.id_parentesco -> Parentesco.id_parentesco');
        await pool.query("ALTER TABLE Representante ADD CONSTRAINT fk_representante_parentesco FOREIGN KEY (id_parentesco) REFERENCES Parentesco(id_parentesco) ON DELETE SET NULL");
      }
    } catch (err) {
      console.error('Error añadiendo FK parentesco:', err.message);
    }

    // 6. Tabla puente alumno_representante (relación N:1 actual, preparada para N:N futura)
    const [tblAluRep] = await pool.query("SHOW TABLES LIKE 'alumno_representante'");
    if (tblAluRep.length === 0) {
      console.log('[migracion] Creando tabla alumno_representante');
      await pool.query(`CREATE TABLE alumno_representante (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_alumno INT NOT NULL,
        id_representante INT NOT NULL,
        id_parentesco INT NULL,
        principal TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_alumno) REFERENCES Alumno(id_alumno) ON DELETE CASCADE,
        FOREIGN KEY (id_representante) REFERENCES Representante(id_representante) ON DELETE CASCADE,
        FOREIGN KEY (id_parentesco) REFERENCES Parentesco(id_parentesco) ON DELETE SET NULL,
        INDEX idx_alurep_alumno (id_alumno),
        INDEX idx_alurep_representante (id_representante)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      // Migrar vínculos existentes (uno por alumno si existe)
      console.log('[migracion] Migrando vínculos alumno -> representante existentes a alumno_representante');
      await pool.query(`INSERT INTO alumno_representante (id_alumno, id_representante, id_parentesco, principal)
        SELECT a.id_alumno, a.id_representante, r.id_parentesco, 1
        FROM Alumno a
        JOIN Representante r ON a.id_representante = r.id_representante
        WHERE a.id_representante IS NOT NULL`);
    }

    // 7. Índice único para evitar duplicados de vínculo
    try {
      const [idx] = await pool.query("SHOW INDEX FROM alumno_representante WHERE Key_name='uniq_alumno_representante'");
      if (idx.length === 0) {
        console.log('[migracion] Añadiendo UNIQUE (id_alumno,id_representante) en alumno_representante');
        // Limpiar duplicados previos conservando el más antiguo
        await pool.query(`DELETE ar1 FROM alumno_representante ar1
          JOIN alumno_representante ar2
            ON ar1.id_alumno = ar2.id_alumno
           AND ar1.id_representante = ar2.id_representante
           AND ar1.id > ar2.id`);
        await pool.query("ALTER TABLE alumno_representante ADD UNIQUE KEY uniq_alumno_representante (id_alumno,id_representante)");
      }
    } catch (err) {
      console.error('Error añadiendo UNIQUE alumno_representante:', err.message);
    }
  } catch (err) {
    console.error('Error en migraciones automáticas:', err.message);
  }
}