-- Eliminar base de datos existente si existe y crear una nueva
DROP DATABASE IF EXISTS `sistema_orquesta_db`;
CREATE DATABASE `sistema_orquesta_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sistema_orquesta_db`;

-- Configuración de SQL
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `programa`
CREATE TABLE `programa` (
  `id_programa` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_programa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `usuario`
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('Admin','Consultor') NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `alumno`
CREATE TABLE `alumno` (
  `id_alumno` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('Masculino','Femenino','Otro') NOT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `id_representante` int(11) DEFAULT NULL,
  `estado` enum('Activo','Inactivo','Retirado') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `nota` text DEFAULT NULL,
  PRIMARY KEY (`id_alumno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `alumno_programa`
CREATE TABLE `alumno_programa` (
  `id_alumno_programa` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `id_programa` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_alumno_programa`),
  UNIQUE KEY `uq_alumno_programa` (`id_alumno`,`id_programa`),
  KEY `fk_ap_programa` (`id_programa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `alumno_historial`
CREATE TABLE `alumno_historial` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `tipo` enum('CREACION','ACTUALIZACION','ESTADO','PROGRAMA','NOTA','ASIGNACION_INSTRUMENTO','OTRO') NOT NULL DEFAULT 'OTRO',
  `descripcion` text DEFAULT NULL,
  `usuario` varchar(150) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historial`),
  KEY `fk_hist_alumno` (`id_alumno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `instrumento`
CREATE TABLE `instrumento` (
  `id_instrumento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `categoria` enum('Cuerda','Viento','Percusión','Mobiliario','Teclado') NOT NULL,
  `numero_serie` varchar(50) NOT NULL,
  `estado` enum('Disponible','Asignado','Mantenimiento','Baja') NOT NULL DEFAULT 'Disponible',
  `fecha_adquisicion` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_instrumento`),
  UNIQUE KEY `numero_serie` (`numero_serie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `asignacion_instrumento`
CREATE TABLE `asignacion_instrumento` (
  `id_asignacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_instrumento` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_devolucion_prevista` date DEFAULT NULL,
  `fecha_devolucion_real` date DEFAULT NULL,
  `estado` enum('Activo','Finalizado','Vencida') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_asignacion`),
  KEY `id_instrumento` (`id_instrumento`),
  KEY `id_alumno` (`id_alumno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `Instrumento_Historial`

CREATE TABLE Instrumento_Historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_instrumento INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  usuario VARCHAR(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_instrumento) REFERENCES Instrumento(id_instrumento) ON DELETE CASCADE
);


-- --------------------------------------------------------
-- Estructura de tabla para la tabla `movimiento_inventario`
CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_instrumento` int(11) NOT NULL,
  `tipo_movimiento` enum('Entrada','Salida','Mantenimiento','Reingreso','Baja') NOT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL,
  `responsable` varchar(100) NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_instrumento` (`id_instrumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `evento`
CREATE TABLE `evento` (
  `id_evento` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` datetime NOT NULL,
  `lugar` varchar(150) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_programa` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_evento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `alumno_asistencia`
CREATE TABLE `alumno_asistencia` (
  `id_asistencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `asistio` tinyint(1) NOT NULL,
  `usuario` varchar(100) DEFAULT 'sistema',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_asistencia`),
  KEY `id_alumno` (`id_alumno`),
  KEY `id_evento` (`id_evento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `alumno_documento`
CREATE TABLE `alumno_documento` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT 'otro',
  `archivo_url` varchar(255) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_documento`),
  KEY `id_alumno` (`id_alumno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

----- estructura de tabla para la tabla "Representante"

CREATE TABLE Representante (
  id_representante INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100)
);

-- Relación alumno ↔ representante
ALTER TABLE Alumno
ADD CONSTRAINT fk_alumno_representante
  FOREIGN KEY (id_representante) REFERENCES Representante(id_representante)
  ON DELETE SET NULL;

-- --------------------------------------------------------
-- Restricciones para tablas volcadas
--

ALTER TABLE `alumno_programa`
  ADD CONSTRAINT `fk_ap_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ap_programa` FOREIGN KEY (`id_programa`) REFERENCES `programa` (`id_programa`) ON DELETE CASCADE;

ALTER TABLE `alumno_historial`
  ADD CONSTRAINT `fk_hist_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE;

ALTER TABLE `asignacion_instrumento`
  ADD CONSTRAINT `asignacion_instrumento_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`),
  ADD CONSTRAINT `asignacion_instrumento_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`);

ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`);

ALTER TABLE `alumno_asistencia`
  ADD CONSTRAINT `alumno_asistencia_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumno_asistencia_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE;

ALTER TABLE `alumno_documento`
  ADD CONSTRAINT `alumno_documento_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE;

-- --------------------------------------------------------
-- Insertar datos de ejemplo
--

INSERT INTO `programa` (`id_programa`, `nombre`, `descripcion`) VALUES
(1, 'Programa Infantil', 'Niños de 7 a 12 años'),
(2, 'Programa Juvenil Editado', 'Descripción actualizada'),
(3, 'Cátedra de Viento', 'Estudiantes de instrumentos de viento');

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `password_hash`, `rol`, `fecha_creacion`) VALUES
(1, 'Admin Test', 'admin@test.com', '123456', 'Admin', '2025-09-03 04:40:59');

INSERT INTO `alumno` (`id_alumno`, `nombre`, `fecha_nacimiento`, `genero`, `telefono_contacto`, `id_representante`, `estado`, `fecha_creacion`, `creado_en`, `nota`) VALUES
(2, 'Pedro Pérez', '2010-05-12', 'Masculino', '04141234567', NULL, 'Activo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(3, 'María González', '2012-03-10', 'Femenino', '04142345678', NULL, 'Activo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(4, 'María Perez', '2002-03-10', 'Femenino', '04142345678', NULL, 'Inactivo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(5, 'Juan Martinez', '2003-05-15', 'Masculino', '04126448795', NULL, 'Activo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(6, 'Miguel Perez', '2002-04-02', 'Masculino', '04124578954', NULL, 'Activo', '2025-09-03 16:38:53', '2025-09-03 16:38:53', NULL),
(7, 'martin perez', '2015-05-02', 'Masculino', '0212456124', NULL, 'Activo', '2025-09-03 16:40:02', '2025-09-03 16:40:02', NULL),
(9, 'Luis Torres', '2011-08-15', 'Masculino', '04124567890', NULL, 'Inactivo', '2025-09-05 03:42:26', '2025-09-05 03:42:26', NULL),
(10, 'Eliu Mall', '1998-09-19', 'Masculino', '04246121456', NULL, 'Activo', '2025-09-05 04:09:21', '2025-09-05 04:09:21', NULL),
(12, 'Prueba Multiple Edit', '2011-01-01', 'Masculino', '04141234567', NULL, 'Activo', '2025-09-05 04:35:16', '2025-09-05 04:35:16', 'Alumno destacado en violín');

INSERT INTO `alumno_programa` (`id_alumno_programa`, `id_alumno`, `id_programa`, `fecha_asignacion`) VALUES
(1, 2, 1, '2025-09-04 03:56:29'),
(2, 7, 1, '2025-09-04 03:56:29'),
(4, 6, 2, '2025-09-04 03:56:29'),
(6, 5, 3, '2025-09-04 03:56:29'),
(12, 9, 2, '2025-09-05 03:42:26'),
(13, 9, 3, '2025-09-05 03:42:26'),
(18, 12, 3, '2025-09-05 04:37:03'),
(19, 10, 1, '2025-09-05 04:38:25'),
(20, 10, 2, '2025-09-05 04:38:25'),
(21, 3, 3, '2025-09-05 04:38:32'),
(22, 4, 3, '2025-09-05 04:38:39');

INSERT INTO `instrumento` (`id_instrumento`, `nombre`, `categoria`, `numero_serie`, `estado`, `fecha_adquisicion`, `foto_url`, `ubicacion`) VALUES
(1, 'Violín 1/2', 'Cuerda', 'STR12345', 'Disponible', '2020-05-12', NULL, 'Depósito Central'),
(2, 'Clarinete Yamaha', 'Viento', 'WND54321', 'Asignado', '2019-08-20', NULL, 'Sala Juvenil'),
(3, 'Timbal', 'Percusión', 'PRC98765', 'Mantenimiento', '2018-02-14', NULL, 'Sala Principal'),
(4, 'Piano Yamaha U1', 'Teclado', 'KEY11111', 'Disponible', '2021-06-25', NULL, 'Sala Infantil'),
(5, 'Contrabajo 3/4', 'Cuerda', 'STR67890', 'Disponible', '2022-11-10', NULL, 'Depósito Central'),
(8, 'Timbala', 'Percusión', 'PRC98765s', 'Mantenimiento', '2018-02-14', NULL, 'Sala Principal'),
(9, 'Violin', 'Cuerda', 'ABC123', 'Disponible', '2023-05-10', NULL, 'Sala 1');

INSERT INTO `asignacion_instrumento` (`id_asignacion`, `id_instrumento`, `id_alumno`, `fecha_asignacion`, `fecha_devolucion_prevista`, `fecha_devolucion_real`, `estado`) VALUES
(1, 2, 3, '2024-09-01', '2025-03-01', NULL, 'Activo');

INSERT INTO `movimiento_inventario` (`id_movimiento`, `id_instrumento`, `tipo_movimiento`, `fecha_movimiento`, `descripcion`, `responsable`) VALUES
(1, 1, 'Entrada', '2025-09-02 16:30:40', 'Ingreso inicial al inventario', 'Admin'),
(2, 2, 'Salida', '2025-09-02 16:30:40', 'Asignado a Luis Romero', 'Profesor Juan Pérez'),
(3, 3, 'Mantenimiento', '2025-09-02 16:30:40', 'Revisión de parches', 'Técnico Carlos López');

INSERT INTO `evento` (`id_evento`, `titulo`, `descripcion`, `fecha_evento`, `lugar`, `creado_en`, `id_programa`) VALUES
(1, 'Concierto de Apertura', 'Presentación de la Orquesta Juvenil', '2025-09-15 00:00:00', 'Teatro Municipal', '2025-09-02 17:02:41', NULL),
(2, 'presentacion prueba', '', '2025-11-25 00:00:00', 'teatro', '2025-09-03 05:04:30', NULL),
(3, 'evento 6', '', '2025-09-10 00:00:00', 'plaza', '2025-09-03 15:58:40', NULL),
(4, 'evento4', '', '2025-10-11 00:00:00', 'concordia', '2025-09-03 15:59:06', NULL),
(6, 'Concierto de Navidad Editado', 'Ahora con invitados especiales', '2025-12-21 20:00:00', 'Auditorio Principal', '2025-09-05 03:47:24', NULL);

INSERT INTO `alumno_historial` (`id_historial`, `id_alumno`, `tipo`, `descripcion`, `usuario`, `creado_en`) VALUES
(1, 12, 'ESTADO', 'Alumno pasó a estado Inactivo', 'admin', '2025-09-05 17:38:40'),
(2, 12, 'ESTADO', 'Alumno pasó a estado antivo', 'admin', '2025-09-05 17:39:00'),
(3, 12, 'NOTA', 'Nota actualizada: Alumno destacado en violín', 'admin', '2025-09-05 17:40:36'),
(4, 10, 'OTRO', 'El alumno mostró mejoría notable', 'profesor_juan', '2025-09-05 19:10:08'),
(5, 9, 'ESTADO', 'Estado cambiado a Inactivo', 'admin', '2025-09-06 03:39:17');