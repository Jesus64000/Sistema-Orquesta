-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-10-2025 a las 16:10:09
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prueba_db`
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
(1, 'Juan Perez', '2000-05-10', 'Masculino', '04241235468', NULL, 'Inactivo', '2025-09-18 14:01:36', '2025-09-18 14:01:36', NULL),
(2, 'Maria Perez', '1999-11-30', 'Femenino', '4245659871', NULL, 'Activo', '2025-09-18 14:01:58', '2025-09-18 14:01:58', NULL),
(3, 'alumno 3', '1999-01-02', 'Masculino', '04245123654', NULL, 'Inactivo', '2025-09-18 22:53:36', '2025-09-18 22:53:36', NULL),
(4, 'pedro Perez', '2008-04-10', 'Masculino', '04213541534', NULL, 'Activo', '2025-09-21 01:11:12', '2025-09-21 01:11:12', NULL),
(5, 'Valeria Gonzales', '2015-07-10', 'Femenino', '04241564875', NULL, 'Activo', '2025-09-21 03:16:55', '2025-09-21 03:16:55', NULL),
(7, 'Miguel Romero', '2007-05-18', 'Masculino', '04246120476', NULL, 'Activo', '2025-09-21 15:03:06', '2025-09-21 15:03:06', NULL),
(8, 'Luis Matteus', '1999-11-30', 'Masculino', '4245123654', NULL, 'Activo', '2025-09-21 15:39:25', '2025-09-21 15:39:25', NULL),
(9, 'Maria Ramirez', '2008-03-27', 'Femenino', '04215456213', NULL, 'Activo', '2025-09-21 15:56:08', '2025-09-21 15:56:08', NULL),
(10, 'Mario Castañeda', '1999-05-14', 'Masculino', '04241523654', NULL, 'Activo', '2025-09-22 03:50:45', '2025-09-22 03:50:45', NULL),
(11, 'nuevo alumno 48', '1998-05-01', 'Masculino', 'ssss', NULL, 'Activo', '2025-09-23 03:51:31', '2025-09-23 03:51:31', NULL),
(12, 'Nuevo alumno 6565', '2009-02-20', 'Masculino', '04245451235', NULL, 'Activo', '2025-09-23 12:27:53', '2025-09-23 12:27:53', NULL),
(14, 'alumno Preuba nuevo', '2001-10-24', 'Masculino', '', NULL, 'Activo', '2025-09-26 01:58:27', '2025-09-26 01:58:27', NULL),
(15, 'Nuevo alumno 5467', '1999-04-25', 'Masculino', '04245678746', NULL, 'Activo', '2025-09-26 16:08:02', '2025-09-26 16:08:02', NULL),
(16, 'Nuevo', '2014-04-24', 'Femenino', '', 1, 'Activo', '2025-09-27 02:24:57', '2025-09-27 02:24:57', NULL),
(17, 'alumno Preuba nsadasdads', '2017-06-14', 'Masculino', '04246120867', NULL, 'Activo', '2025-10-01 12:24:49', '2025-10-01 12:24:49', NULL),
(18, 'prueba 6578', '2001-08-24', 'Masculino', '', NULL, 'Activo', '2025-10-01 12:33:14', '2025-10-01 12:33:14', NULL),
(19, 'alumno 44523423423415424625243224', '2000-01-02', 'Masculino', '04125674654', NULL, 'Activo', '2025-10-07 18:50:29', '2025-10-07 18:50:29', NULL);

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
(1, 1, 'CREACION', 'Alumno creado y asignado a programas: 3', 'sistema', '2025-09-18 14:01:36'),
(2, 2, 'CREACION', 'Alumno creado y asignado a programas: 1', 'sistema', '2025-09-18 14:01:58'),
(3, 1, 'ESTADO', 'Alumno cambiado a Inactivo', 'Sistema', '2025-09-18 14:03:49'),
(4, 1, 'ESTADO', 'Alumno cambiado a Activo', 'Sistema', '2025-09-18 14:03:54'),
(5, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-18 14:04:13'),
(6, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 devuelto', 'sistema', '2025-09-18 14:04:28'),
(7, 3, 'CREACION', 'Alumno creado y asignado a programas: 4', 'sistema', '2025-09-18 22:53:36'),
(8, 2, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-18 22:54:13'),
(9, 1, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 4', 'sistema', '2025-09-18 22:54:34'),
(10, 1, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2', 'sistema', '2025-09-19 00:57:32'),
(11, 3, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-19 00:57:39'),
(12, 3, 'ESTADO', 'Alumno cambiado a Inactivo', 'Sistema', '2025-09-21 01:04:32'),
(13, 4, 'CREACION', 'Alumno creado y asignado a programas: 3, 2', 'sistema', '2025-09-21 01:11:12'),
(14, 5, 'CREACION', 'Alumno creado y asignado a programas: 1', 'sistema', '2025-09-21 03:16:55'),
(15, 7, 'CREACION', 'Alumno creado y asignado a programas: ', 'sistema', '2025-09-21 15:03:06'),
(16, 7, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: ', 'sistema', '2025-09-21 15:04:31'),
(17, 7, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-21 15:04:52'),
(18, 2, 'ASIGNACION_INSTRUMENTO', 'Instrumento 1 asignado', 'sistema', '2025-09-21 15:26:11'),
(19, 2, 'ASIGNACION_INSTRUMENTO', 'Instrumento 1 devuelto', 'sistema', '2025-09-21 15:26:38'),
(20, 2, 'ASIGNACION_INSTRUMENTO', 'Instrumento 1 asignado', 'sistema', '2025-09-21 15:27:03'),
(21, 8, 'CREACION', 'Alumno creado y asignado a programas: 1, 3', 'sistema', '2025-09-21 15:39:25'),
(22, 9, 'CREACION', 'Alumno creado y asignado a programas: 3, 1', 'sistema', '2025-09-21 15:56:08'),
(23, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-21 15:57:15'),
(24, 9, 'ASIGNACION_INSTRUMENTO', 'Instrumento 3 asignado', 'sistema', '2025-09-21 15:59:53'),
(25, 9, 'ASIGNACION_INSTRUMENTO', 'Instrumento 3 devuelto', 'sistema', '2025-09-21 16:00:05'),
(26, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 devuelto', 'sistema', '2025-09-21 16:04:46'),
(27, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-21 16:04:56'),
(28, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 3 asignado', 'sistema', '2025-09-21 16:49:21'),
(29, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 devuelto', 'sistema', '2025-09-21 16:52:00'),
(30, 8, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-21 16:52:04'),
(31, 1, 'ASIGNACION_INSTRUMENTO', 'Instrumento 3 devuelto', 'sistema', '2025-09-21 16:52:23'),
(32, 1, 'ESTADO', 'Alumno cambiado a Inactivo', 'Sistema', '2025-09-21 16:52:26'),
(33, 10, 'CREACION', 'Alumno creado y asignado a programas: 6, 3', 'sistema', '2025-09-22 03:50:45'),
(34, 8, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 asignado', 'sistema', '2025-09-22 04:09:24'),
(35, 8, 'ASIGNACION_INSTRUMENTO', 'Instrumento 2 devuelto', 'sistema', '2025-09-22 04:09:32'),
(42, 4, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-22 21:08:53'),
(43, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-22 21:08:53'),
(44, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-22 21:09:28'),
(45, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-22 21:09:28'),
(46, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-22 21:09:28'),
(47, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-22 21:09:28'),
(48, 1, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 01:27:23'),
(49, 4, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 01:27:23'),
(50, 2, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 01:51:05'),
(51, 8, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 01:51:05'),
(52, 2, 'ESTADO', 'Estado cambiado a Activo', 'sistema', '2025-09-23 01:51:17'),
(53, 3, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(54, 2, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(55, 9, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(56, 10, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(57, 7, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(58, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:29'),
(59, 3, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(60, 2, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(61, 9, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(62, 10, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(63, 7, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(64, 5, 'ESTADO', 'Estado cambiando masivo a Retirado', 'sistema', '2025-09-23 02:50:34'),
(65, 3, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(66, 2, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(67, 9, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(68, 10, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(69, 7, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(70, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 02:50:40'),
(71, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(72, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(73, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(74, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(75, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(76, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 02:53:32'),
(77, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 02:54:36'),
(78, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 02:54:36'),
(79, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 02:54:36'),
(80, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:27'),
(81, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:27'),
(82, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:27'),
(83, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:27'),
(84, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:27'),
(85, 3, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(86, 1, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(87, 8, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(88, 2, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(89, 9, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(90, 10, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(91, 7, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(92, 4, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(93, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 03:04:51'),
(94, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(95, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(96, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(97, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(98, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(99, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(100, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:55'),
(101, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:56'),
(102, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:04:56'),
(103, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 03:35:41'),
(104, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 03:47:03'),
(105, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 03:47:21'),
(106, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 03:47:38'),
(107, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 03:47:43'),
(108, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 03:47:49'),
(109, 11, 'CREACION', 'Alumno creado y asignado a programas: 2', 'sistema', '2025-09-23 03:51:31'),
(110, 8, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-23 03:51:57'),
(111, 2, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-23 03:52:03'),
(112, 9, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-23 03:55:23'),
(113, 9, 'ESTADO', 'Estado cambiado a Activo', 'sistema', '2025-09-23 03:55:43'),
(114, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(115, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(116, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(117, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(118, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(119, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(120, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(121, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 04:02:18'),
(122, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 04:15:13'),
(123, 12, 'CREACION', 'Alumno creado y asignado a programas: 2', 'sistema', '2025-09-23 12:27:53'),
(124, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(125, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(126, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(127, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(128, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(129, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(130, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(131, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(132, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(133, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:29:58'),
(134, 5, 'ESTADO', 'Estado cambiado a Activo', 'sistema', '2025-09-23 12:30:04'),
(135, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(136, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(137, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(138, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(139, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(140, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(141, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(142, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(143, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(144, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:18'),
(145, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(146, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(147, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(148, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(149, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(150, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(151, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(152, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(153, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:39'),
(154, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(155, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(156, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(157, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(158, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(159, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(160, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(161, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(162, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:30:45'),
(163, 2, 'ASIGNACION_INSTRUMENTO', 'Instrumento 1 devuelto', 'sistema', '2025-09-23 12:31:05'),
(164, 2, 'ESTADO', 'Estado cambiado a Inactivo', 'sistema', '2025-09-23 12:31:08'),
(165, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(166, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(167, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(168, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(169, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(170, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(171, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(172, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(173, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(174, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:18'),
(175, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(176, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(177, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(178, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(179, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(180, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(181, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(182, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(183, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(184, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:31:28'),
(185, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(186, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(187, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(188, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(189, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(190, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(191, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(192, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(193, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(194, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(195, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:31:36'),
(196, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(197, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(198, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(199, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(200, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(201, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(202, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(203, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(204, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(205, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(206, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:31'),
(207, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(208, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(209, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(210, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(211, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(212, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(213, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(214, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(215, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(216, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(217, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:39'),
(218, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(219, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(220, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(221, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(222, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(223, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(224, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(225, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(226, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(227, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(228, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:54:47'),
(229, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(230, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(231, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(232, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(233, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(234, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(235, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(236, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(237, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(238, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(239, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 12:54:55'),
(240, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:55:24'),
(241, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:55:24'),
(242, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:55:24'),
(243, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 12:55:24'),
(244, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:02:40'),
(245, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:02:40'),
(246, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:21:33'),
(247, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:03'),
(248, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:11'),
(249, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:11'),
(250, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:11'),
(251, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:11'),
(252, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(253, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(254, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(255, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(256, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(257, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(258, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(259, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(260, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(261, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(262, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:24:23'),
(263, 1, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:33'),
(264, 3, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:24:33'),
(265, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(266, 4, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(267, 5, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(268, 7, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(269, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(270, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(271, 10, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(272, 11, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(273, 12, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 13:27:44'),
(274, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(275, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(276, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(277, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(278, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(279, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(280, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(281, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(282, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(283, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(284, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-23 13:27:52'),
(285, 3, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-23 13:48:11'),
(286, 1, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-23 13:53:14'),
(287, 1, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 2, 3', 'sistema', '2025-09-23 14:00:06'),
(288, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:01:31'),
(289, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:03:03'),
(290, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:03:03'),
(291, 8, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:03:09'),
(292, 2, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:03:09'),
(293, 9, 'ESTADO', 'Desactivación masiva (estado=Inactivo)', 'sistema', '2025-09-23 14:03:09'),
(294, 10, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-23 14:09:07'),
(295, 10, 'ASIGNACION_INSTRUMENTO', 'Instrumento 33 asignado', 'sistema', '2025-09-23 14:10:09'),
(296, 10, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(297, 7, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(298, 11, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(299, 12, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(300, 4, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(301, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-23 19:08:14'),
(302, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(303, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(304, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(305, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(306, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(307, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(308, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(309, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(310, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(311, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(312, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:18:48'),
(313, 8, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:02'),
(314, 9, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:02'),
(315, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:02'),
(316, 3, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(317, 1, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(318, 8, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(319, 2, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(320, 9, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(321, 10, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(322, 7, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(323, 11, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(324, 12, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(325, 4, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(326, 5, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:19:25'),
(327, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(328, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(329, 8, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(330, 2, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(331, 9, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(332, 10, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(333, 7, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(334, 11, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(335, 12, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(336, 4, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(337, 5, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:19:38'),
(338, 3, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:46:58'),
(339, 1, 'ESTADO', 'Estado cambiando masivo a Activo', 'sistema', '2025-09-24 02:46:58'),
(340, 3, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:47:07'),
(341, 1, 'ESTADO', 'Estado cambiando masivo a Inactivo', 'sistema', '2025-09-24 02:47:08'),
(343, 14, 'CREACION', 'Alumno creado y asignado a programas: 3', 'sistema', '2025-09-26 01:58:27'),
(344, 15, 'CREACION', 'Alumno creado y asignado a programas: 3', 'sistema', '2025-09-26 16:08:02'),
(345, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-26 16:13:33'),
(346, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-26 16:13:40'),
(347, 5, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-26 16:13:44'),
(348, 16, 'CREACION', 'Alumno creado y asignado a programas: 3, 1', 'sistema', '2025-09-27 02:24:57'),
(349, 16, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 1, 3', 'sistema', '2025-09-27 20:31:53'),
(350, 14, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-28 18:43:10'),
(351, 14, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-28 18:43:31'),
(352, 14, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-28 18:47:55'),
(353, 14, 'ACTUALIZACION', 'Alumno actualizado. Programas ahora: 3', 'sistema', '2025-09-28 18:52:52'),
(354, 17, 'CREACION', 'Alumno creado y asignado a programas: 1', 'sistema', '2025-10-01 12:24:49'),
(355, 18, 'CREACION', 'Alumno creado y asignado a programas: 3, 2', 'sistema', '2025-10-01 12:33:14'),
(356, 19, 'CREACION', 'Alumno creado y asignado a programas: 1', 'sistema', '2025-10-07 18:50:29');

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
(9, 4, 2, '2025-09-21 01:11:12'),
(11, 7, 3, '2025-09-21 15:04:52'),
(21, 4, 3, '2025-09-22 20:46:24'),
(29, 11, 2, '2025-09-23 03:51:31'),
(30, 8, 1, '2025-09-23 03:51:57'),
(31, 8, 3, '2025-09-23 03:51:57'),
(32, 2, 3, '2025-09-23 03:52:03'),
(33, 9, 1, '2025-09-23 03:55:23'),
(34, 9, 3, '2025-09-23 03:55:23'),
(35, 12, 2, '2025-09-23 12:27:53'),
(36, 3, 3, '2025-09-23 13:48:11'),
(39, 1, 2, '2025-09-23 14:00:06'),
(40, 1, 3, '2025-09-23 14:00:06'),
(41, 10, 3, '2025-09-23 14:09:07'),
(44, 15, 3, '2025-09-26 16:08:02'),
(49, 5, 1, '2025-09-26 16:13:44'),
(50, 5, 3, '2025-09-26 16:13:44'),
(53, 16, 1, '2025-09-27 20:31:53'),
(54, 16, 3, '2025-09-27 20:31:53'),
(58, 14, 3, '2025-09-28 18:52:52'),
(59, 17, 1, '2025-10-01 12:24:49'),
(60, 18, 3, '2025-10-01 12:33:14'),
(61, 18, 2, '2025-10-01 12:33:14'),
(62, 19, 1, '2025-10-07 18:50:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno_representante`
--

CREATE TABLE `alumno_representante` (
  `id` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_representante` int(11) NOT NULL,
  `id_parentesco` int(11) DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno_representante`
--

INSERT INTO `alumno_representante` (`id`, `id_alumno`, `id_representante`, `id_parentesco`, `principal`, `creado_en`) VALUES
(1, 16, 1, 7, 1, '2025-09-28 18:49:52'),
(2, 14, 4, 2, 1, '2025-09-28 18:52:52'),
(3, 17, 5, 5, 1, '2025-10-01 12:24:49');

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
(9, 33, 10, '2025-09-23', NULL, NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Cuerda', 'Instrumentos de cuerda frotada o pulsada'),
(2, 'Viento Madera', 'Instrumentos de viento de madera'),
(3, 'Viento Metal', 'Instrumentos de viento de metal'),
(4, 'Percusión', 'Instrumentos de percusión'),
(5, 'Accesorios', 'Accesorios y equipamiento musical');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id_estado`, `nombre`) VALUES
(1, 'Disponible'),
(2, 'Asignado'),
(3, 'Mantenimiento'),
(4, 'Baja');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `id_evento` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` date NOT NULL,
  `hora_evento` time NOT NULL,
  `lugar` varchar(150) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_programa` int(11) DEFAULT NULL,
  `estado` enum('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROGRAMADO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento`
--

INSERT INTO `evento` (`id_evento`, `titulo`, `descripcion`, `fecha_evento`, `hora_evento`, `lugar`, `creado_en`, `id_programa`, `estado`) VALUES
(1, 'Funcion Navidad', 'Concierto Navideño', '2025-10-18', '10:00:00', 'Teatro', '2025-09-18 14:03:37', NULL, 'PROGRAMADO'),
(2, 'prueva 2', 'asc', '2025-09-27', '05:00:00', 'dddddddds', '2025-09-18 20:01:11', NULL, 'FINALIZADO'),
(3, 'Funcion 2 Navidad', 'Concierto Navideño', '2025-12-18', '16:00:00', 'Teatro', '2025-09-18 22:10:06', NULL, 'PROGRAMADO'),
(6, 'evento halloween', 'Evento de halloween', '2025-10-31', '20:00:00', 'teatro', '2025-09-18 22:32:29', NULL, 'PROGRAMADO'),
(7, 'evento resalte', 'asdfh', '2025-09-29', '16:00:00', 'ciudad', '2025-09-19 00:03:56', NULL, 'FINALIZADO'),
(8, 'evento fn de año ', 'EVENTO FIN DE AÑO ', '2025-12-30', '18:00:00', 'TEATRO BARALT', '2025-09-21 15:41:46', NULL, 'PROGRAMADO'),
(10, 'Evento 5687', 'askjda', '2025-11-30', '17:00:00', 'Teatro', '2025-09-23 12:29:05', NULL, 'PROGRAMADO'),
(11, 'evento halloween212121', '', '2025-10-01', '10:00:00', 'lugar 2', '2025-09-27 13:44:46', NULL, 'FINALIZADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_historial`
--

CREATE TABLE `evento_historial` (
  `id` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `campo` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento_historial`
--

INSERT INTO `evento_historial` (`id`, `id_evento`, `campo`, `valor_anterior`, `valor_nuevo`, `usuario`, `creado_en`) VALUES
(1, 2, 'fecha_evento', 'Sat Sep 27 2025 00:00:00 GMT-0400 (hora de Venezuela)', '2025-09-27', NULL, '2025-09-27 16:47:37'),
(2, 2, 'hora_evento', '05:00:00', '05:00', NULL, '2025-09-27 16:47:37'),
(3, 2, 'lugar', 'ds', 'dddddddds', NULL, '2025-09-27 16:47:37'),
(4, 7, 'fecha_evento', 'Mon Sep 29 2025 00:00:00 GMT-0400 (hora de Venezuela)', '2025-09-29', NULL, '2025-10-01 12:49:15'),
(5, 7, 'hora_evento', '16:00:00', '16:00', NULL, '2025-10-01 12:49:15'),
(6, 7, 'estado', 'PROGRAMADO', 'FINALIZADO', NULL, '2025-10-01 12:49:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instrumento`
--

CREATE TABLE `instrumento` (
  `id_instrumento` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `numero_serie` varchar(50) NOT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_estado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instrumento`
--

INSERT INTO `instrumento` (`id_instrumento`, `nombre`, `numero_serie`, `fecha_adquisicion`, `foto_url`, `ubicacion`, `id_categoria`, `id_estado`) VALUES
(7, 'Violín 4/4 Profesional', 'VLN-001-2024', '2024-01-15', NULL, 'Estante A1', 1, 1),
(8, 'Violín 3/4 Estudiantil', 'VLN-002-2024', '2024-01-15', NULL, 'Estante A1', 1, 1),
(9, 'Viola Profesional', 'VLA-001-2024', '2023-12-10', NULL, 'Estante A2', 1, 2),
(10, 'Violonchelo 4/4', 'VLC-001-2024', '2024-02-20', NULL, 'Suelo A', 1, 1),
(11, 'Contrabajo 3/4', 'CB-001-2024', '2023-11-05', NULL, 'Taller', 1, 3),
(12, 'Flauta Traversa Yamaha', 'FLT-001-2024', '2024-01-30', NULL, 'Estante B1', 2, 1),
(13, 'Clarinete Sib Buffet', 'CLR-001-2024', '2024-02-15', NULL, 'Estante B2', 2, 2),
(14, 'Oboe Profesional', 'OBO-001-2024', '2023-12-20', NULL, 'Estante B3', 2, 1),
(15, 'Fagot Estudiantil', 'FGT-001-2024', '2024-03-01', NULL, 'Estante B4', 2, 1),
(16, 'Saxofón Alto Yamaha', 'SAX-A-001-2024', '2024-01-10', NULL, 'Estante C1', 2, 2),
(17, 'Trompeta Bach Stradivarius', 'TMP-001-2024', '2024-02-25', NULL, 'Estante D1', 3, 1),
(18, 'Trombón de Varas', 'TRB-001-2024', '2023-12-15', NULL, 'Estante D2', 3, 1),
(19, 'Trompa Francesa', 'TRH-001-2024', '2024-01-20', NULL, 'Estante D3', 3, 2),
(20, 'Tuba Sib', 'TUB-001-2024', '2024-03-05', NULL, 'Suelo B', 3, 1),
(21, 'Bombardino', 'BMB-001-2024', '2023-11-30', NULL, 'Taller', 3, 3),
(22, 'Timbal Profesional', 'TMB-001-2024', '2024-02-10', NULL, 'Área Percusión', 4, 1),
(23, 'Bombo Sinfónico', 'BMB-002-2024', '2024-01-25', NULL, 'Área Percusión', 4, 1),
(24, 'Platillos Orquestales', 'PLT-001-2024', '2024-02-28', NULL, 'Área Percusión', 4, 2),
(25, 'Xilófono Profesional', 'XIL-001-2024', '2023-12-05', NULL, 'Área Percusión', 4, 1),
(26, 'Marimba 4.3 Octavas', 'MRM-001-2024', '2024-03-10', NULL, 'Área Percusión', 4, 1),
(27, 'Piano Digital Yamaha', 'PNO-001-2024', '2024-01-05', NULL, 'Sala Ensayos', 5, 2),
(28, 'Arpa Estudiantil', 'ARP-001-2024', '2024-02-12', NULL, 'Esquina Harpas', 1, 1),
(29, 'Guitarra Clásica', 'GTR-001-2024', '2024-01-18', NULL, 'Estante E1', 1, 1),
(30, 'Violín 1/2', 'VLN-003-2024', '2024-03-08', NULL, 'Estante A1', 1, 1),
(31, 'Violín 1/4', 'VLN-004-2024', '2024-03-08', NULL, 'Estante A1', 1, 1),
(32, 'Flauta Dulce Soprano', 'FLD-001-2024', '2024-02-22', NULL, 'Estante B1', 2, 2),
(33, 'Armónica Cromática', 'HRM-001-2024', '2024-01-14', NULL, 'Cajón Accesorios', 2, 2),
(34, 'Triángulo Orquestal', 'TRI-001-2024', '2024-02-05', NULL, 'Cajón Percusión', 4, 1),
(35, 'Pandereta Profesional', 'PND-001-2024', '2024-03-12', NULL, 'Cajón Percusión', 4, 2),
(36, 'Metrónomo Digital', 'MTR-001-2024', '2024-01-08', NULL, 'Mesa Director', 5, 1);

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
(42, 33, 'ASIGNACION', 'Asignado al alumno ID: 10', 'sistema', '2025-09-23 14:10:09', NULL);

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

CREATE TABLE `parentesco` (
  `id_parentesco` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parentesco`
--

INSERT INTO `parentesco` (`id_parentesco`, `nombre`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'Padre', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(2, 'Madre', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(3, 'Tutor', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(4, 'Hermano', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(5, 'Abuelo', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(6, 'Otro', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32'),
(7, 'Prueba 2.0', 1, '2025-09-28 18:52:32', '2025-09-28 18:52:32');

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
(1, 'Infantil', 'Programa Infantil'),
(2, 'Juevenil', 'Programa Juvenil'),
(3, 'Coral', 'Programa Coral');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `representante`
--

CREATE TABLE `representante` (
  `id_representante` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `telefono_movil` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `id_parentesco` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `creado_por` int(11) DEFAULT NULL,
  `actualizado_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `representante`
--

INSERT INTO `representante` (`id_representante`, `nombre`, `apellido`, `ci`, `telefono`, `telefono_movil`, `email`, `id_parentesco`, `activo`, `creado_en`, `actualizado_en`, `creado_por`, `actualizado_por`) VALUES
(1, 'Represnetante', '1', '187898754', '04241542654', '04245645132', 'correorepresentante@gmail.com', 7, 1, '2025-09-28 04:47:37', '2025-09-28 15:38:57', NULL, NULL),
(3, 'nuebo', 'oopo', '30045784', NULL, '04542365987', 'correo@gmail.com', 5, 1, '2025-09-28 15:43:40', '2025-09-28 15:43:40', NULL, NULL),
(4, 'sss', 'asasas', '2313123', NULL, '0424564564', 'sdasd@ganm.com', 5, 1, '2025-09-28 18:19:44', '2025-09-28 18:19:44', NULL, NULL),
(5, 'Repre 4', 'Asd', 'V-4512454', NULL, '04246521057', 'correo@gmail.com', NULL, 1, '2025-10-01 12:23:31', '2025-10-01 12:23:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `permisos` text DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre`, `permisos`, `creado_en`, `actualizado_en`) VALUES
(1, 'administrador', '[\"*\"]', '2025-10-07 18:09:03', '2025-10-07 18:09:03'),
(2, 'supervisor', '{\"alumnos\":[\"*\"],\"instrumentos\":[\"*\"],\"eventos\":[\"*\"],\"representantes\":[\"*\"],\"programas\":[\"*\"],\"roles\":[\"read\"],\"usuarios\":[\"*\"],\"reportes\":[\"*\"],\"$nivel\":1}', '2025-10-07 18:09:03', '2025-10-13 23:38:40'),
(3, 'profesor', '{\"asistencia\":[\"read\",\"create\",\"update\"],\"dashboard\":[\"*\"],\"eventos\":[\"read\"],\"alumnos\":[\"read\",\"create\",\"update\"],\"instrumentos\":[\"read\",\"create\",\"update\"],\"representantes\":[\"read\",\"create\",\"update\"],\"programas\":[\"read\"],\"$nivel\":2}', '2025-10-07 18:09:03', '2025-10-13 20:09:25'),
(4, 'mastes', '[\"alumnos:read\",\"instrumentos:read\",\"eventos:read\"]', '2025-10-07 18:09:03', '2025-10-07 18:09:03'),
(5, 'coordinador', '{\"eventos\":[\"read\"],\"dashboard\":[\"read\"],\"instrumentos\":[\"read\"]}', '2025-10-07 18:16:06', '2025-10-13 00:45:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `password_hash`, `id_rol`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'Admin Sistema', 'admin@local', '$2b$10$TfrKcLMofbyuGxZReMtGcuGsrOX6U9YrNnG3S6EHF4IdknzbjQzbu', 1, 1, '2025-10-07 18:09:03', '2025-10-11 21:03:18'),
(2, 'María Test', 'maria@test.local', '$2b$10$zDFrw4yBsPePZ5euopoYDu/LVkCw7VBJVgwapO/uFntZ0V3MypcmO', 2, 1, '2025-10-07 18:17:49', '2025-10-11 21:03:40'),
(3, 'Juan Admin', 'juan@local', 'abc123', 1, 1, '2025-10-07 18:19:15', '2025-10-07 18:19:15'),
(4, 'Supervisor Demo', 'supervisor@local', 'supervisor', 2, 1, '2025-10-07 18:46:04', '2025-10-07 18:46:04'),
(5, 'Profesor Demo', 'profesor@local', '$2b$10$x7jKadl762uyiVDcGqi1eeusMpDyvMLZMblJEEbRDYdjMLnT49Djm', 3, 1, '2025-10-07 18:46:04', '2025-10-14 14:02:59'),
(6, 'Mastes Demo', 'mastes@local', 'mastes', 4, 1, '2025-10-07 18:46:04', '2025-10-07 18:46:04');

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
-- Indices de la tabla `alumno_representante`
--
ALTER TABLE `alumno_representante`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_alumno_representante` (`id_alumno`,`id_representante`),
  ADD KEY `id_parentesco` (`id_parentesco`),
  ADD KEY `idx_alurep_alumno` (`id_alumno`),
  ADD KEY `idx_alurep_representante` (`id_representante`);

--
-- Indices de la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD KEY `id_instrumento` (`id_instrumento`),
  ADD KEY `id_alumno` (`id_alumno`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`id_evento`);

--
-- Indices de la tabla `evento_historial`
--
ALTER TABLE `evento_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_evento` (`id_evento`);

--
-- Indices de la tabla `instrumento`
--
ALTER TABLE `instrumento`
  ADD PRIMARY KEY (`id_instrumento`),
  ADD UNIQUE KEY `numero_serie` (`numero_serie`),
  ADD KEY `fk_instrumento_categoria` (`id_categoria`),
  ADD KEY `fk_instrumento_estado` (`id_estado`);

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
-- Indices de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD PRIMARY KEY (`id_parentesco`);

--
-- Indices de la tabla `programa`
--
ALTER TABLE `programa`
  ADD PRIMARY KEY (`id_programa`);

--
-- Indices de la tabla `representante`
--
ALTER TABLE `representante`
  ADD PRIMARY KEY (`id_representante`),
  ADD KEY `fk_representante_parentesco` (`id_parentesco`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uq_rol_nombre` (`nombre`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uq_usuario_email` (`email`),
  ADD KEY `fk_usuario_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=357;

--
-- AUTO_INCREMENT de la tabla `alumno_programa`
--
ALTER TABLE `alumno_programa`
  MODIFY `id_alumno_programa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `alumno_representante`
--
ALTER TABLE `alumno_representante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  MODIFY `id_asignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `evento`
--
ALTER TABLE `evento`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `evento_historial`
--
ALTER TABLE `evento_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `instrumento`
--
ALTER TABLE `instrumento`
  MODIFY `id_instrumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `instrumento_historial`
--
ALTER TABLE `instrumento_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `programa`
--
ALTER TABLE `programa`
  MODIFY `id_programa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `representante`
--
ALTER TABLE `representante`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Filtros para la tabla `alumno_representante`
--
ALTER TABLE `alumno_representante`
  ADD CONSTRAINT `alumno_representante_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumno_representante_ibfk_2` FOREIGN KEY (`id_representante`) REFERENCES `representante` (`id_representante`) ON DELETE CASCADE,
  ADD CONSTRAINT `alumno_representante_ibfk_3` FOREIGN KEY (`id_parentesco`) REFERENCES `parentesco` (`id_parentesco`) ON DELETE SET NULL;

--
-- Filtros para la tabla `asignacion_instrumento`
--
ALTER TABLE `asignacion_instrumento`
  ADD CONSTRAINT `asignacion_instrumento_ibfk_1` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumento` (`id_instrumento`),
  ADD CONSTRAINT `asignacion_instrumento_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`);

--
-- Filtros para la tabla `evento_historial`
--
ALTER TABLE `evento_historial`
  ADD CONSTRAINT `evento_historial_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `instrumento`
--
ALTER TABLE `instrumento`
  ADD CONSTRAINT `fk_instrumento_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_instrumento_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`) ON DELETE SET NULL;

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

--
-- Filtros para la tabla `representante`
--
ALTER TABLE `representante`
  ADD CONSTRAINT `fk_representante_parentesco` FOREIGN KEY (`id_parentesco`) REFERENCES `parentesco` (`id_parentesco`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
