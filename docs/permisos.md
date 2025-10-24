# Permisos y Roles (Fase 1)

Este documento describe el modelo de control de acceso implementado en la Fase 1: **autorización basada en roles y acciones por recurso**, sin autenticación real todavía (auth pospuesta a una fase posterior).

---
## Índice
- [1. Objetivos](#1-objetivos)
- [2. Alcance Fase 1](#2-alcance-fase-1)
- [3. Modelo Conceptual](#3-modelo-conceptual)
- [4. Catálogo de Recursos y Acciones](#4-catálogo-de-recursos-y-acciones)
- [5. Estructura en Base de Datos](#5-estructura-en-base-de-datos)
- [6. Cálculo de Permisos Efectivos](#6-cálculo-de-permisos-efectivos)
- [7. Overrides por Usuario](#7-overrides-por-usuario)
- [8. Middleware](#8-middleware)
- [9. Selector de Rol de Desarrollo](#9-selector-de-rol-de-desarrollo)
- [10. Endpoint Debug](#10-endpoint-debug)
- [11. Ejemplos de Respuesta y Errores](#11-ejemplos-de-respuesta-y-errores)
- [12. Roadmap Próximas Fases](#12-roadmap-próximas-fases)

---
## 1. Objetivos
Implementar una capa de **autorización** consistente y centralizada que permita:
- Limitar operaciones según rol.
- Extender acciones fácilmente.
- Preparar el terreno para autenticación real (JWT) y auditoría futura.

## 2. Alcance Fase 1
Incluye:
- Catálogo fijo de recursos → acciones.
- Roles con permisos declarados en JSON.
- Wildcard `"*"` permitido solo dentro del rol (no en overrides).
- `permisos_extra` (añadir acciones puntuales a un usuario).
- `permisos_denegados` almacenado pero aún NO aplicado.
- Middleware que calcula permisos efectivos y protege rutas.
- Selector de rol de desarrollo sin login.

No incluye todavía:
- Login / hash de contraseñas / tokens.
- Revocación de sesión / refresh tokens.
- Auditoría de acceso / logging detallado.

## 3. Modelo Conceptual
```
Usuario -- pertenece a --> Rol
Usuario -- puede tener --> permisos_extra (JSON recurso->[acciones])
Rol     -- define --> permisos (JSON recurso->[acciones | '*'])
```
Permisos efectivos = union(rol.expandido, permisos_extra) - (futuro: permisos_denegados)

## 4. Catálogo de Recursos y Acciones
Archivo: `backend/permissionsCatalog.js`
```js
export const permissionsCatalog = {
  alumnos: ["read","create","update","delete","export"],
  eventos: ["read","create","update","delete","finalize","cancel"],
  instrumentos: ["read","create","update","delete"],
  programas: ["read","create","update","delete"],
  representantes: ["read","create","update","delete"],
  personal: ["read","create","update","delete","export"],
  roles: ["read","create","update","delete"],
  usuarios: ["read","create","update","delete"],
  dashboard: ["read"],
  personalizacion: ["read","update","delete"],
};
```
Acciones genéricas: `read|create|update|delete`. Acciones especiales actuales: `export` (alumnos), `finalize|cancel` (eventos).

## 5. Estructura en Base de Datos
Tabla `Rol`:
- `permisos` (JSON) ejemplo:
```json
{
  "alumnos": ["read","create","update","delete","export"],
  "eventos": ["read","create","update","finalize"],
  "usuarios": ["read"],
  "roles": ["read"],
  "dashboard": ["read"]
}
```
Wildcard ejemplo Admin (incluye personal y personalización):
```json
{ "alumnos": ["*"], "eventos": ["*"], "instrumentos": ["*"], "programas": ["*"], "representantes": ["*"], "personal": ["*"], "roles": ["*"], "usuarios": ["*"], "dashboard": ["*"], "personalizacion": ["*"] }
```

Tabla `Usuario` (nuevas columnas fase 1):
- `password_hash` (reservado, sin uso todavía)
- `permisos_extra` (JSON)
- `permisos_denegados` (JSON, inactivo fase 1)
- `last_login` (timestamp futuro)

## 6. Cálculo de Permisos Efectivos
Funciones en `permissionsCatalog.js`:
1. `expandWildcardPermissions(perms)` → reemplaza `"*"` por listado completo del catálogo para cada recurso.
2. `mergeRoleAndUserExtras(rolePerms, userExtras)` → une ambos (Set) y retorna objeto consolidado.

Pseudocódigo middleware:
```
expandedRole = expandWildcard(role.permisos)
expandedExtras = expandWildcard(usuario.permisos_extra)
permisosEfectivos = merge(expandedRole, expandedExtras)
```

## 7. Overrides por Usuario
`permisos_extra` permite añadir acciones sin modificar el rol. Ej:
```json
{
  "eventos": ["finalize"],
  "alumnos": ["export"]
}
```
Futuro: aplicar `permisos_denegados` para restar acciones (precedencia > extra > rol).

## 8. Middleware
Archivo: `backend/middleware/requirePermiso.js`
Exporta:
- `loadUserDev` (inyecta usuario simulado mientras no exista auth)
- `requirePermiso(recurso, accion)` (protege endpoint)

Errores:
- 401 `NO_AUTH` si falta usuario (sólo ocurrirá cuando quitemos `loadUserDev` y aún no autentiques).
- 403 `PERMISO_DENEGADO` si falta acción.

## 9. Selector de Rol de Desarrollo
Sin login puedes forzar rol simulando:
- Query: `?_devrole=admin` | `coordinador` | `consulta`
- Cabecera: `X-Dev-Role: coordinador`

El middleware buscará el nombre exacto de rol:
- admin → Admin
- coordinador → Coordinador
- consulta → Consulta

Si no existe en DB, crea uno virtual (p. ej. `CoordinadorVirtual`).

Cabecera de respuesta expuesta: `X-Dev-Role-Active`.

## 10. Endpoint Debug
`GET /__dev/permisos` → responde:
```json
{
  "rol": { "id_rol": 1, "nombre": "Coordinador", "permisos": {"alumnos":["read","create","update"]} },
  "effectivePerms": { "alumnos":["read","create","update"], "dashboard":["read"] }
}
```
Usar junto a `_devrole` para validar combinaciones.

## 11. Ejemplos de Respuesta y Errores
403 típico:
```json
{ "error": { "code": "PERMISO_DENEGADO", "message": "Falta permiso alumnos.delete" } }
```
Cambio de rol:
```
GET /alumnos?_devrole=consulta → sólo listará (read) y un POST fallará 403
```

## 12. Roadmap Próximas Fases
Fase 2 (Auth Básica):
- POST /auth/login (email + password) → JWT corto.
- GET /auth/me → datos + permisos efectivos.
- Hash de password (bcrypt / argon2).
- Remover `loadUserDev` salvo entorno DEV.

Fase 3 (Hardening):
- `permisos_denegados` activos.
- Refresh tokens / revocación.
- Auditoría (quién hizo qué y cuándo).
- Logs estructurados.
- Cache de permisos en memoria con invalidación al editar rol.

Fase 4 (Avanzado):
- Scoping por fila (ej. programas asignados).
- Acciones compuestas y features flags.
- Registro histórico de cambios de rol/permisos.

---
**Notas:**
- Antes de producción: eliminar endpoints `__dev` y limpiar `_devrole`.
- Mantener catálogo sincronizado si se agregan nuevos módulos.

---
*Actualizado: 2025-10-02 (Fase 1 permisos)*
