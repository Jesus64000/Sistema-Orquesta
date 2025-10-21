-- Migration: create personalizacion table
-- Run this on your MySQL database used by the app
CREATE TABLE IF NOT EXISTS personalizacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tema JSON NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creado_por INT NULL,
  UNIQUE KEY ux_personalizacion_nombre (nombre)
);

-- Rollback
-- DROP TABLE IF EXISTS personalizacion;
