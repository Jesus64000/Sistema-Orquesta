// backend/db.js
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_orquesta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;