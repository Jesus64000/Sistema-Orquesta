// backend/app.js
// Configuración de la app Express (sin levantar servidor)
// ESM module

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import pool from './db.js';
import authOptional from './middleware/auth.js';

// Routers principales
import alumnosRouter from './routes/alumnos.js';
import programasRouter from './routes/programas.js';
import instrumentosRouter from './routes/instrumentos.js';
import representantesRouter from './routes/representantes.js';
import eventosRouter from './routes/eventos.js';
import reportesRouter from './routes/reportes.js';
import usuariosRouter from './routes/usuarios.js';
import dashboardRouter from './routes/dashboard.js';
import authRouter from './routes/auth.js';

// Administración
import adminUsuariosRouter from './routes/administracion/usuarios.js';
import adminRolesRouter from './routes/administracion/roles.js';
import adminCategoriasRouter from './routes/administracion/categorias.js';
import adminInstrumentosRouter from './routes/administracion/instrumentos.js';
import adminEstadosRouter from './routes/administracion/estados.js';
import adminRepresentantesRouter from './routes/administracion/representantes.js';
import adminEventosRouter from './routes/administracion/eventos.js';
import adminProgramasRouter from './routes/administracion/programas.js';
import adminParentescosRouter from './routes/administracion/parentescos.js';

const app = express();

// Middleware base
app.use(cors());
app.use(bodyParser.json());

// Habilitar confianza en proxy si está detrás de uno (relevante para rate limiting por IP)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Autenticación JWT opcional: carga req.user si hay token válido
app.use(authOptional);

// Middleware: usuario simulado (solo dev) por header x-user-id
// Se desactiva en entorno de test para evitar accesos a DB durante pruebas
if (process.env.NODE_ENV !== 'test') {
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
}

// Ruta utilitaria para comprobar el usuario cargado (dev)
app.get('/me', (req, res) => {
  if (!req.user) return res.status(200).json({ anonimo: true });
  res.json(req.user);
});

// Healthcheck simple
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// Rutas Auth
app.use('/auth', authRouter);

// Rutas principales
app.use('/alumnos', alumnosRouter);
app.use('/programas', programasRouter);
app.use('/instrumentos', instrumentosRouter);
app.use('/representantes', representantesRouter);
app.use('/eventos', eventosRouter);
app.use('/reportes', reportesRouter);
app.use('/usuarios', usuariosRouter);
app.use('/dashboard', dashboardRouter);

// Rutas de administración
app.use('/administracion/usuarios', adminUsuariosRouter);
app.use('/administracion/roles', adminRolesRouter);
app.use('/administracion/categorias', adminCategoriasRouter);
app.use('/administracion/instrumentos', adminInstrumentosRouter);
app.use('/administracion/estados', adminEstadosRouter);
app.use('/administracion/representantes', adminRepresentantesRouter);
app.use('/administracion/eventos', adminEventosRouter);
app.use('/administracion/programas', adminProgramasRouter);
app.use('/administracion/parentescos', adminParentescosRouter);

export default app;
