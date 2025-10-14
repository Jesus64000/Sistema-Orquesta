# Administración de Usuarios

Este documento describe los endpoints y el flujo básico para gestionar usuarios administradores.

Permisos requeridos: según el helper actual `requirePermission('admin:usuarios:manage')`.

Endpoints (backend):
- GET /administracion/usuarios
- POST /administracion/usuarios { nombre, email, id_rol, password }
- PUT /administracion/usuarios/:id { nombre, email, id_rol }
- DELETE /administracion/usuarios/:id
- POST /administracion/usuarios/:id/password { current_password, new_password, confirm_password }

Notas de seguridad:
- Las contraseñas se almacenan con bcrypt. Si existían hashes legados en texto plano, se rehashan al primer login exitoso.
- El cambio de contraseña valida: coincidencia de confirmación, longitud mínima (8), y que no sea igual a la anterior.
- Rate limiting activado para POST /auth/login (5 intentos por 15 minutos por IP). Configurable en `backend/middleware/rateLimit.js` y `routes/auth.js`.

Frontend:
- La vista de Usuarios Admin muestra y limita las acciones según permisos efectivos del usuario autenticado.
- Para crear un usuario, usar el modal “+ Nuevo Usuario”. Para cambiar contraseña, usar la acción “Contraseña”.

Pruebas:
- Ejecutar pruebas del backend: `npm run test` desde la carpeta `backend`.
