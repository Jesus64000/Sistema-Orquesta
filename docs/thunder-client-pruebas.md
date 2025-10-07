# Guía de Pruebas con Thunder Client

Esta guía te ayuda a validar las funcionalidades principales del backend usando Thunder Client (VS Code). Incluye endpoints, headers, body y el orden sugerido para probar.

> Base URL por defecto: `http://localhost:4000`

## 0) Preparación

- Asegúrate de tener el backend corriendo.
- Migraciones: por defecto se ejecutan y crean usuario admin: `admin@local` con contraseña `admin`.
- Simulación de usuario: agrega el header `x-user-id` con el ID del usuario que quieres “ser”.
  - Para empezar, usaremos el administrador (generalmente ID 1). Si no sabes el ID, primero lista usuarios.

Header común (opcional):
- `Content-Type: application/json`
- `x-user-id: 1`  (para simular el admin)

## 1) Perfil actual /me

- Método: GET
- URL: `/me`
- Headers: `x-user-id: 1`
- Cuerpo: —
- Esperado: datos del usuario (id, nombre, email, rol, permisos). Sin header → `{ "anonimo": true }`.

## 2) Roles (administración)

- Listar roles
  - GET `/administracion/roles`
  - Esperado: array con `id_rol, nombre, permisos` (permisos como array si son JSON válidos).

- Crear rol
  - POST `/administracion/roles`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "coordinador",
      "permisos": ["alumnos:read", "eventos:read", "eventos:write"]
    }
    ```
  - Esperado: `{ "success": true, "id_rol": <number> }`

- Editar rol
  - PUT `/administracion/roles/:id`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "coordinador",
      "permisos": ["alumnos:read", "eventos:*"]
    }
    ```
  - Esperado: `{ "success": true }`

- Eliminar rol
  - DELETE `/administracion/roles/:id`
  - Esperado: `{ "success": true }`

## 3) Usuarios

- Listar usuarios
  - GET `/usuarios`
  - Esperado: lista con `id_usuario, nombre, email, id_rol, rol_nombre`.

- Crear usuario
  - POST `/usuarios`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "María Test",
      "email": "maria@test.local",
      "password": "123456",
      "id_rol": 2
    }
    ```
  - Esperado: `201` con `{ id_usuario, nombre, email, id_rol }`.

- Actualizar usuario
  - PUT `/usuarios/:id`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "María Actualizada",
      "email": "maria@test.local",
      "id_rol": 3
    }
    ```
  - Esperado: `{ id, nombre, email, id_rol }`

- Eliminar usuario
  - DELETE `/usuarios/:id`
  - Esperado: `{ "message": "Usuario eliminado" }`

- (Admin) Crear usuario desde administración
  - POST `/administracion/usuarios`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "Juan Admin",
      "email": "juan@local",
      "password": "abc123",
      "id_rol": 1
    }
    ```
  - Esperado: `{ "success": true }`

## 4) Representantes

- Listar representantes (con búsqueda)
  - GET `/representantes?q=gar`
  - Esperado: lista con campos `nombre, apellido, ci, telefono_movil, email, parentesco_nombre, alumnos_count`.

- Crear representante
  - POST `/representantes`
  - Body JSON ejemplo:
    ```json
    {
      "nombre": "Pedro",
      "apellido": "García",
      "ci": "V1234567",
      "telefono_movil": "04141234567",
      "email": "pedro@example.com",
      "id_parentesco": 1,
      "activo": 1
    }
    ```
  - Esperado: `201` con `id_representante`.

- Editar representante
  - PUT `/representantes/:id`
  - Body JSON ejemplo (campos opcionales, actualiza parciales):
    ```json
    {
      "telefono_movil": "04145556666",
      "id_parentesco": 2,
      "activo": 1
    }
    ```
  - Esperado: JSON con los campos actualizados.

- Eliminar representante
  - DELETE `/representantes/:id`
  - Esperado: `{ "message": "Representante eliminado correctamente" }`

- Exportar representantes
  - POST `/representantes/export`
  - Body JSON ejemplo:
    ```json
    {
      "ids": [1,2,3],
      "format": "xlsx",
      "search": "gar"
    }
    ```
  - Esperado: archivo descargable (ajusta `format` a `csv` o `pdf`).

## 5) Eventos

- Crear evento
  - POST `/eventos`
  - Body JSON ejemplo:
    ```json
    {
      "titulo": "Concierto de Primavera",
      "descripcion": "Evento anual",
      "fecha_evento": "2025-12-20",
      "hora_evento": "19:30",
      "lugar": "Teatro Municipal",
      "id_programa": 1,
      "estado": "PROGRAMADO"
    }
    ```
  - Regla: si `estado` es PROGRAMADO/EN_CURSO, la `fecha_evento` no puede ser pasada.

- Editar evento (dispara historial por campo cambiado)
  - PUT `/eventos/:id`
  - Body JSON ejemplo (cambiando estado):
    ```json
    {
      "titulo": "Concierto de Primavera",
      "descripcion": "Evento anual",
      "fecha_evento": "2025-12-20",
      "hora_evento": "19:30",
      "lugar": "Teatro Municipal",
      "id_programa": 1,
      "estado": "EN_CURSO"
    }
    ```
  - Esperado: respuesta con nuevo estado; `evento_historial` con registro de diff.

- Listar eventos
  - GET `/eventos?search=conc`
  - Esperado: lista filtrada por título/lugar/descripcion.

- Ver evento por ID
  - GET `/eventos/:id`
  - Esperado: detalle con `estado` incluido.

- Historial de evento
  - GET `/eventos/:id/historial`
  - Esperado: lista de cambios (campo, valor_anterior, valor_nuevo, usuario, creado_en).

- Eventos futuros / pasados
  - GET `/eventos/futuros`
  - GET `/eventos/pasados`

- Sugerencias
  - GET `/eventos/suggest?q=conc&limit=8`

- Exportar eventos
  - POST `/eventos/export`
  - Body JSON ejemplo:
    ```json
    {
      "ids": [],
      "format": "csv",
      "search": "navidad"
    }
    ```

## 6) Reportes

- Alumnos
  - GET `/reportes/alumnos-total`
  - GET `/reportes/alumnos-activos`
  - GET `/reportes/alumnos-inactivos`
  - GET `/reportes/alumnos-por-programa`
  - GET `/reportes/alumnos-por-programa-anio?anio1=2024&anio2=2025`
  - GET `/reportes/alumnos-por-edad?programa=Infantil`
  - GET `/reportes/alumnos-por-genero?programa=Infantil`

- Instrumentos
  - GET `/reportes/instrumentos-total`
  - GET `/reportes/instrumentos-por-estado?id_estado=1,2`
  - GET `/reportes/instrumentos-por-categoria?id_categoria=1`
  - GET `/reportes/instrumentos-top-asignados`

- Representantes
  - GET `/reportes/representantes-total`
  - GET `/reportes/representantes-por-alumnos`

- Eventos
  - GET `/reportes/eventos-total`
  - GET `/reportes/eventos-por-mes`

- Usuarios
  - GET `/reportes/usuarios-total`
  - GET `/reportes/usuarios-por-rol`

## 7) Notas y tips

- Si recibes errores 500, revisa el mensaje de error y valida que el esquema de BD sea el del archivo `docs/sistema_orquesta_db(estructura).sql`.
- Los permisos no bloquean rutas por defecto. Para simular distintos perfiles, cambia el header `x-user-id` por el ID de diferentes usuarios con distintos roles.
- Los roles y permisos se guardan en la tabla `rol`. El campo `permisos` es JSON, por ejemplo:
  ```json
  ["alumnos:read", "eventos:write", "instrumentos:*", "*"]
  ```
- El usuario admin por defecto: email `admin@local`, contraseña `admin`. Puedes crear más usuarios y asignar roles desde `/usuarios` o `/administracion/usuarios`.

---

¿Quieres que te exporte una colección Thunder Client (.thunder-collection) con todos estos requests preconfigurados? Puedo generarla y agregarla al repositorio.
