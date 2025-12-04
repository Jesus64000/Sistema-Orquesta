-- Datos semilla para Sistema Orquesta
-- Ejecutar después de crear la estructura con Base_de_datos_estructura.sql

-- 1. Roles
INSERT INTO `rol` (`nombre`, `descripcion`, `permisos`) VALUES
('Admin', 'Acceso total', '{"alumnos": ["*"], "eventos": ["*"], "instrumentos": ["*"], "programas": ["*"], "representantes": ["*"], "personal": ["*"], "dashboard": ["*"], "usuarios": ["*"], "roles": ["*"], "configuracion": ["*"], "$nivel": 0}'),
('Coordinador', 'Gestión operativa sin acciones destructivas', '{"alumnos": ["read", "create", "update"], "eventos": ["read", "create", "update"], "instrumentos": ["read"], "programas": ["read"], "representantes": ["read", "create", "update"], "personal": ["read", "create", "update"], "dashboard": ["read"], "$nivel": 1}'),
('Consulta', 'Solo lectura', '{"alumnos": ["read"], "eventos": ["read"], "instrumentos": ["read"], "programas": ["read"], "representantes": ["read"], "personal": ["read"], "dashboard": ["read"], "$nivel": 2}'),
('Supervisor', 'Supervisión general', '{"alumnos": ["read", "write"], "instrumentos": ["read", "write"], "eventos": ["read", "write"], "representantes": ["read", "write"], "$nivel": 1}'),
('Profesor', 'Acceso limitado a docencia', '{"alumnos": ["read"], "eventos": ["read"], "asistencia": ["write"], "$nivel": 2}'),
('Mastes', 'Maestros', '{"alumnos": ["read"], "instrumentos": ["read"], "eventos": ["read"], "$nivel": 2}');

-- 2. Usuario Admin (admin@local / admin1234)
-- El hash generado es para 'admin1234'
INSERT INTO `usuario` (`nombre`, `email`, `password_hash`, `id_rol`, `activo`, `nivel_acceso`, `must_change_password`) VALUES
('Admin Sistema', 'admin@local', '$2b$10$0OhOhRLC1TNpEgzF/EH2ReTLkSRV5l5DdBnuQ.fUDz/aC4zndTdpa', (SELECT id_rol FROM rol WHERE nombre = 'Admin'), 1, 0, 0);

-- 3. Cargos
INSERT INTO `cargo` (`nombre`, `activo`) VALUES
('Profesor', 1),
('Coordinador', 1),
('Administrativo', 1),
('Director', 1),
('Asistente', 1);

-- 4. Parentescos
INSERT INTO `parentesco` (`nombre`, `activo`) VALUES
('Padre', 1),
('Madre', 1),
('Tutor', 1),
('Hermano', 1),
('Abuelo', 1),
('Otro', 1);
