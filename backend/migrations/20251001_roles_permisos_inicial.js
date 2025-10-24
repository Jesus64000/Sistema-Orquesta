// Migración idempotente para añadir columnas de permisos y descripciones
// Ejecutar manualmente: node migrations/20251001_roles_permisos_inicial.js
// Requiere conexión válida (ver db.js)

import db from '../db.js';
import { permissionsCatalog } from '../permissionsCatalog.js';

async function columnExists(table, column) {
  const [rows] = await db.query(
    'SELECT COUNT(*) as ok FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column]
  );
  return rows[0].ok > 0;
}

async function tableExists(table) {
  const [rows] = await db.query(
    'SELECT COUNT(*) as ok FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',[table]
  );
  return rows[0].ok > 0;
}

async function ensureRoleColumns() {
  if (!(await tableExists('rol'))) return;
  if (!(await columnExists('rol','permisos'))) {
    await db.query("ALTER TABLE rol ADD COLUMN permisos TEXT NOT NULL DEFAULT '{}' AFTER nombre");
  }
  if (!(await columnExists('rol','descripcion'))) {
    await db.query("ALTER TABLE rol ADD COLUMN descripcion VARCHAR(150) NULL AFTER permisos");
  }
}

async function ensureUserColumns() {
  if (!(await tableExists('usuarios'))) return;
  if (!(await columnExists('usuarios','password_hash'))) {
    await db.query("ALTER TABLE usuarios ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
  }
  if (!(await columnExists('usuarios','permisos_extra'))) {
    await db.query("ALTER TABLE usuarios ADD COLUMN permisos_extra TEXT NOT NULL DEFAULT '{}' AFTER id_rol");
  }
  if (!(await columnExists('usuarios','permisos_denegados'))) {
    await db.query("ALTER TABLE usuarios ADD COLUMN permisos_denegados TEXT NOT NULL DEFAULT '{}' AFTER permisos_extra");
  }
  if (!(await columnExists('usuarios','last_login'))) {
    await db.query("ALTER TABLE usuarios ADD COLUMN last_login DATETIME NULL AFTER permisos_denegados");
  }
}

async function seedRoles() {
  // Si ya existe algún rol con wildcard asumimos semillas creadas.
  const [rows] = await db.query('SELECT id_rol, nombre, permisos FROM rol');
  if (rows.some(r => (r.permisos||'').includes('*'))) return; // ya sembrado algo similar

  const adminPerms = Object.keys(permissionsCatalog).reduce((acc,k)=>{acc[k] = ['*']; return acc;}, {});
  const coordinadorPerms = {
    alumnos: ['read','create','update'],
    eventos: ['read','create','update'],
    instrumentos: ['read'],
    programas: ['read'],
    representantes: ['read','create','update'],
    personal: ['read','create','update'],
    dashboard: ['read']
  };
  const consultaPerms = {
    alumnos: ['read'],
    eventos: ['read'],
    instrumentos: ['read'],
    programas: ['read'],
    representantes: ['read'],
    personal: ['read'],
    dashboard: ['read']
  };

  const insertRole = async (nombre, descripcion, permisos) => {
    await db.query('INSERT INTO rol (nombre, descripcion, permisos) VALUES (?,?,?)',[nombre, descripcion, JSON.stringify(permisos)]);
  };

  await insertRole('Admin','Acceso total', adminPerms);
  await insertRole('Coordinador','Gestión operativa sin acciones destrictivas', coordinadorPerms);
  await insertRole('Consulta','Solo lectura', consultaPerms);
}

async function run() {
  try {
    await ensureRoleColumns();
    await ensureUserColumns();
    await seedRoles();
    console.log('Migración/semillas completadas.');
    process.exit(0);
  } catch (e) {
    console.error('Error en migración:', e);
    process.exit(1);
  }
}

run();
