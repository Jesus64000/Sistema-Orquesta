// backend/migrations/ensureMigrations.js
// Migrações ligeras e idempotentes ejecutadas al arranque (opcional)

export async function ensureMigrations(pool) {
  try {
    // 0. Usuarios y Roles (base para permisos)
    // Tabla rol (minúsculas para ser consistente con el dump SQL existente)
    let [tblRol] = await pool.query("SHOW TABLES LIKE 'rol'");
    if (tblRol.length === 0) {
      console.log('[migracion] Creando tabla rol');
      await pool.query(`CREATE TABLE rol (
        id_rol INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        permisos TEXT NULL,
        creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_rol_nombre (nombre)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }

    // Tabla usuario
    let [tblUsuario] = await pool.query("SHOW TABLES LIKE 'usuario'");
    if (tblUsuario.length === 0) {
      console.log('[migracion] Creando tabla usuario');
      await pool.query(`CREATE TABLE usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        id_rol INT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_usuario_email (email),
        CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }

    // Semillas de roles si faltan
    const defaultRoles = [
      { nombre: 'administrador', permisos: ['*'] },
      { nombre: 'supervisor', permisos: ['alumnos:read','alumnos:write','instrumentos:read','instrumentos:write','eventos:read','eventos:write','representantes:read','representantes:write'] },
      { nombre: 'profesor', permisos: ['alumnos:read','eventos:read','asistencia:write'] },
      { nombre: 'mastes', permisos: ['alumnos:read','instrumentos:read','eventos:read'] }
    ];
    for (const r of defaultRoles) {
      const [rExists] = await pool.query('SELECT id_rol FROM rol WHERE nombre = ?', [r.nombre]);
      if (rExists.length === 0) {
        console.log(`[migracion] Insertando rol ${r.nombre}`);
        await pool.query('INSERT INTO rol (nombre, permisos) VALUES (?, ?)', [r.nombre, JSON.stringify(r.permisos)]);
      }
    }

    // Semilla usuario admin básico si no existe
    const [adminExists] = await pool.query("SELECT u.id_usuario FROM usuario u WHERE u.email = 'admin@local'");
    if (adminExists.length === 0) {
      const [rolAdmin] = await pool.query("SELECT id_rol FROM rol WHERE nombre='administrador' LIMIT 1");
      const idRol = rolAdmin[0]?.id_rol ?? null;
      console.log('[migracion] Creando usuario administrador por defecto (admin@local / admin)');
      await pool.query(
        'INSERT INTO usuario (nombre, email, password_hash, id_rol) VALUES (?,?,?,?)',
        ['Admin Sistema', 'admin@local', 'admin', idRol]
      );
    }
    // Usuarios de prueba adicionales (idempotente)
    const testUsers = [
      { nombre: 'Supervisor Demo', email: 'supervisor@local', pass: 'supervisor', rol: 'supervisor' },
      { nombre: 'Profesor Demo', email: 'profesor@local', pass: 'profesor', rol: 'profesor' },
      { nombre: 'Mastes Demo', email: 'mastes@local', pass: 'mastes', rol: 'mastes' },
    ];
    for (const tu of testUsers) {
      const [exists] = await pool.query('SELECT id_usuario FROM usuario WHERE email = ?', [tu.email]);
      if (exists.length === 0) {
        const [[r]] = await pool.query('SELECT id_rol FROM rol WHERE nombre = ? LIMIT 1', [tu.rol]);
        const idRol = r?.id_rol ?? null;
        console.log(`[migracion] Creando usuario de prueba ${tu.email} / ${tu.pass}`);
        await pool.query(
          'INSERT INTO usuario (nombre, email, password_hash, id_rol) VALUES (?,?,?,?)',
          [tu.nombre, tu.email, tu.pass, idRol]
        );
      }
    }

    // Añadir columna nivel_acceso si falta
    try {
      const [colNivel] = await pool.query("SHOW COLUMNS FROM usuario LIKE 'nivel_acceso'");
      if (colNivel.length === 0) {
        console.log('[migracion] Añadiendo columna nivel_acceso a usuario');
        await pool.query('ALTER TABLE usuario ADD COLUMN nivel_acceso TINYINT NULL AFTER id_rol');
      }
      // Backfill si está vacía: usar $nivel del rol si existe, else heurística rol nombre
      console.log('[migracion] Backfill nivel_acceso nulos');
      // 1. Desde JSON $nivel
      await pool.query(`UPDATE usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        SET u.nivel_acceso = CAST(JSON_UNQUOTE(JSON_EXTRACT(r.permisos, '$."$nivel"')) AS SIGNED)
        WHERE u.nivel_acceso IS NULL
          AND r.permisos IS NOT NULL
          AND JSON_EXTRACT(r.permisos, '$."$nivel"') IS NOT NULL`);
      // 2. Heurística admin
      await pool.query(`UPDATE usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        SET u.nivel_acceso = 0
        WHERE u.nivel_acceso IS NULL AND r.nombre LIKE '%admin%'`);
      // 3. Resto: asignar 2 (básico) si sigue null
      await pool.query('UPDATE usuario SET nivel_acceso = 2 WHERE nivel_acceso IS NULL');
    } catch (err) {
      console.error('Error añadiendo/backfilling nivel_acceso:', err.message);
    }
    // 1. Verificar columna estado en Evento
  const [cols] = await pool.query("SHOW COLUMNS FROM evento LIKE 'estado'");
    if (cols.length === 0) {
      console.log('[migracion] Añadiendo columna estado a Evento');
  await pool.query("ALTER TABLE evento ADD COLUMN estado ENUM('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROGRAMADO' AFTER id_programa");
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
        FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }

    // 3. Tabla Parentesco
    const [tblPar] = await pool.query("SHOW TABLES LIKE 'parentesco'");
    if (tblPar.length === 0) {
      console.log('[migracion] Creando tabla Parentesco');
      await pool.query(`CREATE TABLE parentesco (
        id_parentesco INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      // Semillas básicas
      await pool.query("INSERT INTO parentesco (nombre) VALUES ('Padre'),('Madre'),('Tutor'),('Hermano'),('Abuelo'),('Otro')");
    } else {
      // 3b. Asegurar columnas creado_en / actualizado_en si la tabla ya existía antes
      try {
        const [cCreado] = await pool.query("SHOW COLUMNS FROM parentesco LIKE 'creado_en'");
        if (cCreado.length === 0) {
          console.log('[migracion] Añadiendo columna creado_en a Parentesco');
          await pool.query("ALTER TABLE parentesco ADD COLUMN creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER activo");
        }
      } catch (err) {
        console.error('Error añadiendo creado_en a Parentesco:', err.message);
      }
      try {
        const [cAct] = await pool.query("SHOW COLUMNS FROM parentesco LIKE 'actualizado_en'");
        if (cAct.length === 0) {
          console.log('[migracion] Añadiendo columna actualizado_en a Parentesco');
          await pool.query("ALTER TABLE parentesco ADD COLUMN actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER creado_en");
        }
      } catch (err) {
        console.error('Error añadiendo actualizado_en a Parentesco:', err.message);
      }
    }

    // 4. Columnas nuevas en Representante
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
        const [c] = await pool.query(`SHOW COLUMNS FROM representante LIKE '${col.name}'`);
        if (c.length === 0) {
          console.log(`[migracion] Añadiendo columna ${col.name} a Representante`);
          await pool.query(col.ddl.replace('Representante','representante'));
        }
      } catch (err) {
        console.error(`Error añadiendo columna ${col.name}:`, err.message);
      }
    }

    // 5. FK id_parentesco si no existe
    try {
      const [fk] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME='representante' AND COLUMN_NAME='id_parentesco' AND CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL");
      if (fk.length === 0) {
        console.log('[migracion] Añadiendo FK Representante.id_parentesco -> Parentesco.id_parentesco');
        await pool.query("ALTER TABLE representante ADD CONSTRAINT fk_representante_parentesco FOREIGN KEY (id_parentesco) REFERENCES parentesco(id_parentesco) ON DELETE SET NULL");
      }
    } catch (err) {
      console.error('Error añadiendo FK parentesco:', err.message);
    }

    // 6. Tabla puente alumno_representante
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
        FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE,
        FOREIGN KEY (id_representante) REFERENCES representante(id_representante) ON DELETE CASCADE,
        FOREIGN KEY (id_parentesco) REFERENCES parentesco(id_parentesco) ON DELETE SET NULL,
        INDEX idx_alurep_alumno (id_alumno),
        INDEX idx_alurep_representante (id_representante)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      // Migrar vínculos existentes (uno por alumno si existe)
      console.log('[migracion] Migrando vínculos alumno -> representante existentes a alumno_representante');
      await pool.query(`INSERT INTO alumno_representante (id_alumno, id_representante, id_parentesco, principal)
        SELECT a.id_alumno, a.id_representante, r.id_parentesco, 1
        FROM alumno a
        JOIN representante r ON a.id_representante = r.id_representante
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
