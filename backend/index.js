// backend/index.js
// Punto de entrada: levanta servidor usando la app exportada

import pool from './db.js';
import app from './app.js';
import { migrateLegacyPaths } from './boot/migrateLegacyPaths.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Antes de tocar DB o levantar servidor, migra rutas legadas de archivos
    migrateLegacyPaths();

    await pool.query('SELECT 1');
    console.log('Conexión a DB OK');

    // Migraciones automáticas desactivadas para producción/entrega
    // Se debe usar docs/Base_de_datos_estructura.sql y docs/datos_semilla.sql

    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error conectando a la DB:', err);
    process.exit(1);
  }
}

start();