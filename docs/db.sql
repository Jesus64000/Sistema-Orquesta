-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-09-2025 a las 19:59:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_orquesta_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `id_alumno` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('Masculino','Femenino','Otro') NOT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `id_representante` int(11) DEFAULT NULL,
  `estado` enum('Activo','Inactivo','Retirado') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `nota` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id_alumno`, `nombre`, `fecha_nacimiento`, `genero`, `telefono_contacto`, `id_representante`, `estado`, `fecha_creacion`, `creado_en`, `nota`) VALUES
(3, 'María González', '2012-03-10', 'Femenino', '04142345678', NULL, 'Activo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(5, 'Prueba Multiple Edit Actualizado', '2011-01-01', 'Masculino', '04141234568', NULL, 'Activo', '2025-09-03 15:43:38', '2025-09-03 16:37:27', NULL),
(6, 'Miguel Perez', '2002-04-02', 'Masculino', '04124578954', NULL, 'Activo', '2025-09-03 16:38:53', '2025-09-03 16:38:53', NULL),
(9, 'Luis Torres', '2011-08-15', 'Masculino', '04124567890', 1, 'Activo', '2025-09-05 03:42:26', '2025-09-05 03:42:26', NULL),
(12, 'Prueba Multiple Edit', '2011-01-01', 'Masculino', '04141234567', NULL, 'Activo', '2025-09-05 04:35:16', '2025-09-05 04:35:16', 'Alumno destacado en violín'),
(16, 'Marco Perez', '2000-04-15', 'Masculino', '04246587945', 1, 'Activo', '2025-09-07 03:48:30', '2025-09-07 03:48:30', NULL),
(17, 'Pedro Picapiedras', '1999-07-05', 'Masculino', '04245784135', NULL, 'Activo', '2025-09-07 23:11:09', '2025-09-07 23:11:09', NULL),
(20, 'Nuevo Alumno', '2001-03-15', 'Masculino', '04241542365', 1, 'Activo', '2025-09-08 17:24:13', '2025-09-08 17:24:13', NULL),
(21, 'niña 2', '2015-04-15', 'Femenino', '04241564875', 1, 'Activo', '2025-09-12 23:19:38', '2025-09-12 23:19:38', NULL),
(22, '', '0000-00-00', '', NULL, NULL, '', '2025-09-13 03:07:13', '2025-09-13 03:07:13', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno_asistencia`
--

CREATE TABLE `alumno_asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `asistio` tinyint(1) NOT NULL,
  `usuario` varchar(100) DEFAULT 'sistema',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno_documento`
--

CREATE TABLE `alumno_documento` (
  `id_documento` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT 'otro',
  `archivo_url` varchar(255) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno_historial`
--

CREATE TABLE `alumno_historial` (
  `id_historial` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `tipo` enum('CREACION','ACTUALIZACION','ESTADO','PROGRAMA','NOTA','ASIGNACION_INSTRUMENTO','OTRO') NOT NULL DEFAULT 'OTRO',
  `descripcion` text DEFAULT NULL,
  `usuario` varchar(150) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno_historial`
--

INSERT INTO `alumno_historial` (`id_historial`, `id_alumno`, `tipo`, `descripcion`, `usuario`, `creado_en`) VALUES
(1, 12, 'ESTADO', 'Alumno pasó a estado Inactivo', 'admin', '2025-09-05 17:38:40'),
(2, 12, 'ESTADO', 'Alumno pasó a estado antivo', 'admin', '2025-09-05 17:39:00'),
(3, 12, 'NOTA', 'Nota actualizada: Alumno destacado en violín', 'admin', '2025-09-05 17:40:36'),
(5, 9, 'ESTADO', 'Estado cambiado a Inactivo', 'admin', '2025-09-06 03:39:17'),
(9, 16, 'CREACION', 'Alumno creado y asignado a programas: 2', 'sistema', '2025-09-07 03:48:30'),
(10, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 2', 'thunder-client', '2025-09-07 04:08:04'),
(11, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2', 'thunder-client', '2025-09-07 04:08:28'),
(15, 12, 'ASIGNACION_INSTRUMENTO', 'Instrumento 1 asignado', 'admin', '2025-09-07 19:17:32'),
(16, 17, 'CREACION', 'Alumno creado y asignado a programas: 3, 2', 'sistema', '2025-09-07 23:11:09'),
(17, 17, 'NOTA', 'Nota del alumno', 'sistema', '2025-09-07 23:11:55'),
(18, 17, 'NOTA', 'otra mas', 'sistema', '2025-09-07 23:11:59'),
(22, 16, 'NOTA', 'noto porque si ', 'sistema', '2025-09-08 02:00:03'),
(25, 9, 'ASIGNACION_INSTRUMENTO', 'Instrumento 5 asignado', 'sistema', '2025-09-08 05:17:40'),
(26, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-08 05:18:05'),
(27, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-08 05:18:10'),
(29, 9, 'ASIGNACION_INSTRUMENTO', 'Instrumento 5 devuelto', 'sistema', '2025-09-08 16:35:35'),
(33, 16, 'ASIGNACION_INSTRUMENTO', 'Instrumento 16 asignado', 'sistema', '2025-09-08 17:20:53'),
(34, 20, 'CREACION', 'Alumno creado y asignado a programas: 2', 'sistema', '2025-09-08 17:24:13'),
(35, 20, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-08 17:25:58'),
(37, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-08 17:27:38'),
(38, 20, 'ASIGNACION_INSTRUMENTO', 'Instrumento 19 asignado', 'sistema', '2025-09-08 17:29:22'),
(39, 20, 'ASIGNACION_INSTRUMENTO', 'Instrumento 19 devuelto', 'sistema', '2025-09-08 17:31:14'),
(41, 17, 'ASIGNACION_INSTRUMENTO', 'Instrumento 8 asignado', 'sistema', '2025-09-08 17:32:12'),
(42, 16, 'ASIGNACION_INSTRUMENTO', 'Instrumento 16 devuelto', 'sistema', '2025-09-09 01:31:14'),
(43, 5, 'ASIGNACION_INSTRUMENTO', 'Instrumento 19 asignado', 'sistema', '2025-09-09 01:40:49'),
(44, 17, 'ASIGNACION_INSTRUMENTO', 'Instrumento 8 devuelto', 'sistema', '2025-09-09 01:56:25'),
(45, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-09 02:05:08'),
(46, 16, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2', 'sistema', '2025-09-09 02:05:14'),
(47, 3, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-09 02:05:18'),
(48, 17, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-09 02:05:23'),
(49, 12, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-09 02:05:39'),
(50, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2', 'sistema', '2025-09-09 02:05:42'),
(51, 21, 'CREACION', 'Alumno creado y asignado a programas: 1', 'sistema', '2025-09-12 23:19:38'),
(52, 21, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-12 23:20:09'),
(53, 21, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 devuelto', 'sistema', '2025-09-12 23:20:22'),
(54, 22, 'CREACION', 'Alumno creado y asignado a programas: ', 'sistema', '2025-09-13 03:07:13'),
(55, 22, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: ', 'sistema', '2025-09-13 03:07:34'),
(56, 22, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2', 'sistema', '2025-09-13 17:13:27'),
(57, 21, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-14 05:19:02'),
(58, 21, 'ASIGNACION_INSTRUMENTO', 'Instrumento 16 asignado', 'sistema', '2025-09-14 05:20:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno_programa`
--

CREATE TABLE `alumno_programa` (
  `id_alumno_programa` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_programa` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno_programa`
--

INSERT INTO `alumno_programa` (`id_alumno_programa`, `id_alumno`, `id_programa`, `fecha_asignacion`) VALUES
(4, 6, 2, '2025-09-04 03:56:29'),
(50, 20, 2, '2025-09-08 17:25:58'),
(51, 20, 3, '2025-09-08 17:25:58'),
(56, 9, 2, '2025-09-09 02:05:08'),
(57, 9, 3, '2025-09-09 02:05:08'),
(58, 16, 2, '2025-09-09 02:05:14'),
(59, 3, 3, '2025-09-09 02:05:18'),
(60, 17, 2, '2025-09-09 02:05:23'),
(61, 17, 3, '2025-09-09 02:05:23'),
(62, 12, 3, '2025-09-09 02:05:39'),
(63, 5, 2, '2025-09-09 02:05:42'),
(64, 21, 1, '2025-09-12 23:19:38'),
(65, 22, 2, '2025-09-13 17:13:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_instrumento`
--

CREATE TABLE `asignacion_instrumento` (
  `id_asignacion` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_devolucion_prevista` date DEFAULT NULL,
  `fecha_devolucion_real` date DEFAULT NULL,
  `estado` enum('Activo','Finalizado','Vencida') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_instrumento`
--

INSERT INTO `asignacion_instrumento` (`id_asignacion`, `id_instrumento`, `id_alumno`, `fecha_asignacion`, `fecha_devolucion_prevista`, `fecha_devolucion_real`, `estado`) VALUES
(1, 2, 3, '2024-09-01', '2025-03-01', '2025-09-08', 'Finalizado'),
(4, 1, 12, '2025-09-07', NULL, '2025-09-08', 'Finalizado'),
(6, 5, 9, '2025-09-08', NULL, '2025-09-08', 'Finalizado'),
(9, 16, 16, '2025-09-08', NULL, '2025-09-08', 'Finalizado'),
(10, 19, 20, '2025-09-08', NULL, '2025-09-08', 'Finalizado'),
(12, 8, 17, '2025-09-08', NULL, '2025-09-08', 'Finalizado'),
(13, 19, 5, '2025-09-08', NULL, '2025-09-08', 'Finalizado'),
(14, 2, 21, '2025-09-12', NULL, '2025-09-12', 'Finalizado'),
(15, 2, 21, '2025-09-14', NULL, NULL, 'Activo'),
(16, 16, 21, '2025-09-14', NULL, NULL, 'Activo'),
(17, 4, 21, '2025-09-14', NULL, NULL, 'Activo'),
(18, 4, 17, '2025-09-14', NULL, NULL, 'Activo'),
(19, 4, 17, '2025-09-14', NULL, NULL, 'Activo'),
(20, 4, 12, '2025-09-14', NULL, NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `id_evento` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` datetime NOT NULL,
  `lugar` varchar(150) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_programa` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento`
--

INSERT INTO `evento` (`id_evento`, `titulo`, `descripcion`, `fecha_evento`, `lugar`, `creado_en`, `id_programa`) VALUES
(1, 'Concierto de Apertura', 'Presentación de la Orquesta Juvenil', '2025-09-15 00:00:00', 'Teatro Municipal', '2025-09-02 17:02:41', NULL),
(2, 'presentacion prueba', '', '2025-11-25 00:00:00', 'teatro', '2025-09-03 05:04:30', NULL),
(3, 'evento 6', '', '2025-09-10 00:00:00', 'plaza', '2025-09-03 15:58:40', NULL),
(4, 'evento4', '', '2025-10-11 00:00:00', 'concordia', '2025-09-03 15:59:06', NULL),
(6, 'Concierto de Navidad Editado', 'Ahora con invitados especiales', '2025-12-21 20:00:00', 'Auditorio Principal', '2025-09-05 03:47:24', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instrumento`
--

CREATE TABLE `instrumento` (
  `id_instrumento` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` enum('Cuerda','Viento','Percusión','Mobiliario','Teclado') NOT NULL,
  `numero_serie` varchar(50) NOT NULL,
  `estado` enum('Disponible','Asignado','Mantenimiento','Baja') NOT NULL DEFAULT 'Disponible',
  `fecha_adquisicion` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instrumento`
--

INSERT INTO `instrumento` (`id_instrumento`, `nombre`, `categoria`, `numero_serie`, `estado`, `fecha_adquisicion`, `foto_url`, `ubicacion`) VALUES
(1, 'Violín 1/2', 'Cuerda', 'STR12345', 'Asignado', '2020-05-12', NULL, 'Depósito Central'),
(2, 'Clarinete Yamaha', 'Viento', 'WND54321', 'Asignado', '2019-08-20', NULL, 'Sala Juvenil'),
(3, 'Timbal', 'Percusión', 'PRC98765', 'Mantenimiento', '2018-02-14', NULL, 'Sala Principal'),
(4, 'Piano Yamaha U1', 'Teclado', 'KEY11111', 'Disponible', '2021-06-25', NULL, 'Sala Infantil'),
(5, 'Contrabajo 3/4', 'Cuerda', 'STR67890', 'Disponible', '2022-11-10', NULL, 'Depósito Central'),
(8, 'Timbala editado', 'Percusión', 'PRC98765s', 'Disponible', '2018-02-14', NULL, 'Sala Principal'),
(9, 'Violin', '', 'ABC123', 'Disponible', '2023-05-10', NULL, 'Sala 1'),
(13, 'Violín 3/4', 'Cuerda', 'V654321', 'Mantenimiento', '2023-08-15', NULL, 'Taller de luthería'),
(16, 'instrumento 4', 'Cuerda', '564654', 'Asignado', '0000-00-00', NULL, 'dfdsf'),
(17, 'otro', 'Cuerda', 'fd', 'Asignado', '0000-00-00', NULL, 'sd'),
(18, 'www', 'Cuerda', 'www', 'Disponible', '0000-00-00', NULL, 'www'),
(19, 'nuevo instrumento', 'Percusión', '41542', 'Disponible', '2020-12-12', NULL, 'almacen X');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instrumento_historial`
--

CREATE TABLE `instrumento_historial` (
  `id_historial` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_alumno` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instrumento_historial`
--

INSERT INTO `instrumento_historial` (`id_historial`, `id_instrumento`, `tipo`, `descripcion`, `usuario`, `creado_en`, `id_alumno`) VALUES
(1, 1, 'MANTENIMIENTO', 'Cambio de cuerdas', 'admin', '2025-09-07 19:15:19', NULL),
(2, 1, 'CREACION', 'Instrumento agregado al sistema', 'admin', '2025-09-08 01:46:18', NULL),
(3, 8, 'ACTUALIZACION', 'Instrumento actualizado: Timbala editado (PRC98765s)', 'sistema', '2025-09-08 01:56:37', NULL),
(11, 4, 'ASIGNACION', 'Asignado al alumno ID: 18', 'sistema', '2025-09-08 05:16:00', NULL),
(12, 5, 'ASIGNACION', 'Asignado al alumno ID: 9', 'sistema', '2025-09-08 05:17:40', NULL),
(13, 16, 'CREACION', 'Instrumento creado: instrumento 4 (564654)', 'sistema', '2025-09-08 16:04:57', NULL),
(14, 17, 'CREACION', 'Instrumento creado: otro (fd)', 'sistema', '2025-09-08 16:05:06', NULL),
(15, 18, 'CREACION', 'Instrumento creado: www (www)', 'sistema', '2025-09-08 16:05:13', NULL),
(16, 4, 'DEVOLUCION', 'Devuelto por alumno ID: 18', 'sistema', '2025-09-08 16:35:16', NULL),
(17, 5, 'DEVOLUCION', 'Devuelto por alumno ID: 9', 'sistema', '2025-09-08 16:35:35', NULL),
(18, 5, 'ASIGNACION', 'Asignado al alumno ID: 18', 'sistema', '2025-09-08 16:36:07', NULL),
(19, 5, 'DEVOLUCION', 'Devuelto por alumno ID: 18', 'sistema', '2025-09-08 16:36:24', NULL),
(20, 5, 'ASIGNACION', 'Asignado al alumno ID: 18', 'sistema', '2025-09-08 16:36:47', NULL),
(21, 16, 'ASIGNACION', 'Asignado al alumno ID: 16', 'sistema', '2025-09-08 17:20:53', NULL),
(22, 2, 'ELIMINACION', 'Instrumento eliminado', 'sistema', '2025-09-08 17:28:34', NULL),
(23, 2, 'ELIMINACION', 'Instrumento eliminado', 'sistema', '2025-09-08 17:28:38', NULL),
(24, 19, 'CREACION', 'Instrumento creado: nuevo instrumento (41542)', 'sistema', '2025-09-08 17:29:04', NULL),
(25, 19, 'ASIGNACION', 'Asignado al alumno ID: 20', 'sistema', '2025-09-08 17:29:22', NULL),
(26, 19, 'DEVOLUCION', 'Devuelto por alumno ID: 20', 'sistema', '2025-09-08 17:31:14', NULL),
(27, 17, 'ASIGNACION', 'Asignado al alumno ID: 18', 'sistema', '2025-09-08 17:31:27', NULL),
(28, 8, 'ASIGNACION', 'Asignado al alumno ID: 17', 'sistema', '2025-09-08 17:32:12', NULL),
(29, 16, 'DEVOLUCION', 'Devuelto por alumno ID: 16', 'sistema', '2025-09-09 01:31:14', NULL),
(30, 19, 'ASIGNACION', 'Asignado al alumno ID: 5', 'sistema', '2025-09-09 01:40:49', NULL),
(31, 8, 'DEVOLUCION', 'Devuelto por alumno ID: 17', 'sistema', '2025-09-09 01:56:25', NULL),
(32, 5, 'ACTUALIZACION', 'Instrumento actualizado: Contrabajo 3/4', 'sistema', '2025-09-09 02:05:59', NULL),
(33, 2, 'ACTUALIZACION', 'Instrumento actualizado: Clarinete Yamaha', 'sistema', '2025-09-09 02:06:07', NULL),
(34, 19, 'ACTUALIZACION', 'Instrumento actualizado: nuevo instrumento', 'sistema', '2025-09-09 02:06:18', NULL),
(35, 2, 'ASIGNACION', 'Asignado al alumno ID: 21', 'sistema', '2025-09-12 23:20:09', NULL),
(36, 2, 'DEVOLUCION', 'Devuelto por alumno ID: 21', 'sistema', '2025-09-12 23:20:22', NULL),
(37, 2, 'ASIGNACION', 'Asignado al alumno ID: 21', 'sistema', '2025-09-14 05:19:02', NULL),
(38, 16, 'ASIGNACION', 'Asignado al alumno ID: 21', 'sistema', '2025-09-14 05:20:19', NULL),
(39, 5, 'REPARACION', 'Cambio de cuerdas', 'admin', '2025-09-14 17:45:59', NULL),
(40, 5, 'ASIGNACION', 'Prestado a alumno', 'admin', '2025-09-14 17:47:46', 22),
(41, 5, 'ASIGNACION', 'Prestado a alumno', 'admin', '2025-09-14 17:48:42', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_inventario`
--

CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `tipo_movimiento` enum('Entrada','Salida','Mantenimiento','Reingreso','Baja') NOT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL,
  `responsable` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento_inventario`
--

INSERT INTO `movimiento_inventario` (`id_movimiento`, `id_instrumento`, `tipo_movimiento`, `fecha_movimiento`, `descripcion`, `responsable`) VALUES
(1, 1, 'Entrada', '2025-09-02 16:30:40', 'Ingreso inicial al inventario', 'Admin'),
(2, 2, 'Salida', '2025-09-02 16:30:40', 'Asignado a Luis Romero', 'Profesor Juan Pérez'),
(3, 3, 'Mantenimiento', '2025-09-02 16:30:40', 'Revisión de parches', 'Técnico Carlos López');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa`
--

CREATE TABLE `programa` (
  `id_programa` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programa`
--

INSERT INTO `programa` (`id_programa`, `nombre`, `descripcion`) VALUES
(1, 'Programa Infantil', 'Niños de 7 a 12 años'),
(2, 'Programa Juvenil Editado', 'Descripción actualizada'),
(3, 'Cátedra de Viento', 'Estudiantes de instrumentos de viento'),
(9, 'Programa Percusion', 'Formación inicial en percusion editado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `representante`
--

CREATE TABLE `representante` (
  `id_representante` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `representante`
--

INSERT INTO `representante` (`id_representante`, `nombre`, `telefono`, `email`) VALUES
(1, 'José Ramírez', '04125556666', 'jramirez@example.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('Admin','Consultor') NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `password_hash`, `rol`, `fecha_creacion`) VALUES
(1, 'Admin Test', 'admin@test.com', '123456', 'Admin', '2025-09-03 04:40:59');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id_alumno`),
  ADD KEY `fk_alumno_representante` (`id_representante`);

--
-- Indices de la tabla `alumno_asistencia`
--
ALTER TABLE `alumno_asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_evento` (`id_evento`);

--
-- Indices de la tabla `alumno_documento`
--
ALTER TABLE `alumno_documento`
  ADD PRIMARY KEY (`id_documento`),
  ADD KEY `id_alumno` (`id_alumno`);

--
-- Indices de la tabla `alumno_historial`
--
ALTER TABLE `alumno_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_hist_alumno` (`id_alumno`);

--
-- Indices de la tabla `alumno_programa`
--
ALTER TABLE `alumno_programa`
  ADD PRIMARY KEY (`id_alumno_programa`),
  ADD UNIQUE KEY `uq_alumno_programa` (`id_alumno`,`id_programa`),
  ADD KEY `fk_ap_programa` (`id_programa`);

--
-- Indices de la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD KEY `id_instrumento` (`id_instrumento`),
  ADD KEY `id_alumno` (`id_alumno`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`id_evento`);

--
-- Indices de la tabla `instrumento`
--
ALTER TABLE `instrumento`
  ADD PRIMARY KEY (`id_instrumento`),
  ADD UNIQUE KEY `numero_serie` (`numero_serie`);

--
-- Indices de la tabla `instrumento_historial`
--
ALTER TABLE `instrumento_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_instrumento` (`id_instrumento`),
  ADD KEY `fk_instrumento_historial_alumno` (`id_alumno`);

--
-- Indices de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_instrumento` (`id_instrumento`);

--
-- Indices de la tabla `programa`
--
ALTER TABLE `programa`
  ADD PRIMARY KEY (`id_programa`);

--
-- Indices de la tabla `representante`
--
ALTER TABLE `representante`
  ADD PRIMARY KEY (`id_representante`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `alumno_asistencia`
--
ALTER TABLE `alumno_asistencia`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alumno_documento`
--
ALTER TABLE `alumno_documento`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alumno_historial`
--
ALTER TABLE `alumno_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `alumno_programa`
--
ALTER TABLE `alumno_programa`
  MODIFY `id_alumno_programa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  MODIFY `id_asignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `evento`
--
ALTER TABLE `evento`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `instrumento`
--
ALTER TABLE `instrumento`
  MODIFY `id_instrumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `instrumento_historial`
--
ALTER TABLE `instrumento_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `programa`
--
ALTER TABLE `programa`
  MODIFY `id_programa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `representante`
--
ALTER TABLE `representante`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD CONSTRAINT `fk_alumno_representante` FOREIGN KEY (`id_representante`) REFERENCES `representante` (`id_representante`) ON DELETE SET NULL;

--
-- Filtros para la tabla `alumno_asistencia`
--
ALTER TABLE `alumno_asistencia`
  ADD CONSTRAINT `alumno_asistencia_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumno_asistencia_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `alumno_documento`
--
ALTER TABLE `alumno_documento`
  ADD CONSTRAINT `alumno_documento_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE;

--
-- Filtros para la tabla `alumno_historial`
--
ALTER TABLE `alumno_historial`
  ADD CONSTRAINT `fk_hist_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE;

--
-- Filtros para la tabla `alumno_programa`
--
ALTER TABLE `alumno_programa`
  ADD CONSTRAINT `fk_ap_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ap_programa` FOREIGN KEY (`id_programa`) REFERENCES `programa` (`id_programa`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  ADD CONSTRAINT `asignacion_instrumento_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`),
  ADD CONSTRAINT `asignacion_instrumento_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`);

--
-- Filtros para la tabla `instrumento_historial`
--
ALTER TABLE `instrumento_historial`
  ADD CONSTRAINT `fk_instrumento_historial_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE SET NULL,
  ADD CONSTRAINT `instrumento_historial_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
