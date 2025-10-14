// backend/index.js
// Punto de entrada: levanta servidor usando la app exportada

import pool from './db.js';
import app from './app.js';
import { ensureMigrations } from './migrations/ensureMigrations.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a DB OK');

    if (process.env.MIGRATIONS !== 'off') {
      await ensureMigrations(pool);
    } else {
      console.log('Migraciones desactivadas por variable de entorno MIGRATIONS=off');
    }

    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error conectando a la DB:', err);
    process.exit(1);
  }
}

start();