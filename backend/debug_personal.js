
import pool from './db.js';

async function checkPersonal() {
  try {
    const [rows] = await pool.query('SELECT * FROM personal');
    console.log('Total rows in personal:', rows.length);
    console.log('Rows:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error querying personal:', err);
  } finally {
    process.exit();
  }
}

checkPersonal();
