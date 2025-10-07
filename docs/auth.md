# Autenticación (Fase Inicial JWT 24h)

Esta fase introduce autenticación vía JSON Web Tokens (JWT) con expiración de 24 horas y transición progresiva a contraseñas hasheadas con bcrypt.

---
## Índice
- [1. Objetivos](#1-objetivos)
- [2. Alcance Actual](#2-alcance-actual)
- [3. Endpoints](#3-endpoints)
- [4. Flujo de Login](#4-flujo-de-login)
- [5. Estructura del Token](#5-estructura-del-token)
- [6. Expiración (24h) y Razonamiento](#6-expiración-24h-y-razonamiento)
- [7. Contraseñas y Migración a bcrypt](#7-contraseñas-y-migración-a-bcrypt)
- [8. Middleware de Autenticación](#8-middleware-de-autenticación)
- [9. Integración con Autorización (Permisos)](#9-integración-con-autorización-permisos)
- [10. Errores Comunes](#10-errores-comunes)
- [11. Próximas Fases](#11-próximas-fases)

---
## 1. Objetivos
Proveer una capa mínima de autenticación segura: emisión de JWT con expiración conocida y base para futuras mejoras (refresh, revocación, auditoría).

## 2. Alcance Actual
Incluye:
- Login por email + password.
- Generación de token JWT válido 24h.
- Endpoint `GET /auth/me` para obtener usuario y permisos.
- Rehash transparente de contraseñas no hasheadas (migración gradual).
- Middleware opcional (`authOptional`) que, si encuentra token válido, carga `req.user`.

No incluye todavía:
- Refresh tokens / rotación / lista negra.
- Forzado de hash al crear usuario (de momento podría existir texto plano pre-migrado).
- Limitar intentos / bloqueo de cuenta.

## 3. Endpoints
| Método | Ruta        | Body / Header | Descripción |
|--------|-------------|---------------|-------------|
| POST   | /auth/login | { email, password } | Devuelve token + user + permisos |
| GET    | /auth/me    | Authorization: Bearer <token> | Retorna usuario cargado desde el token |

## 4. Flujo de Login
1. Cliente envía `POST /auth/login`.
2. API busca usuario por email (case-insensitive).
3. Si `password_hash`:
   - Es bcrypt → `bcrypt.compare()`.
   - Es texto plano → compara directo y si coincide se re-hashea en background (`bcrypt.hash` cost=10).
4. Genera JWT con `exp = ahora + 24h`.
5. Devuelve payload:
```json
{
  "token": "<JWT>",
  "token_type": "Bearer",
  "expires_in_seconds": 86400,
  "user": { "id_usuario": 1, "nombre": "...", "rol": {"nombre": "Admin"}, "effectivePerms": {"alumnos":["read"]} }
}
```
6. Cliente guarda token (ej. memory + localStorage según estrategia) y lo envía en header en llamadas posteriores.

## 5. Estructura del Token
Payload básico:
```json
{
  "sub": 123,        // id_usuario
  "rol": "Coordinador",
  "v": 1,            // versión de claims (para invalidar futura)
  "iat": 1730496000,
  "exp": 1730582400
}
```
Firmado con secreto `JWT_SECRET` (env) y algoritmo HS256 (default `jsonwebtoken`).

## 6. Expiración (24h) y Razonamiento
- Límite de ventana si el token se filtra.
- Reduce necesidad inmediata de refresh tokens para panel interno.
- 24h permite sesiones de trabajo diarias sin pedir credenciales constantemente.
- Futuro: acortar a 2h y añadir refresh tokens si se requiere mayor seguridad.

## 7. Contraseñas y Migración a bcrypt
Estado actual:
- Algunos usuarios pueden tener `password_hash` = texto plano (legado inicial).
- Al primer login exitoso: se recalcula hash en formato bcrypt `$2b$...` y se actualiza la fila.
- Detección de hash: empieza por `$2a$`, `$2b$` o `$2y$`.

Recomendación futura:
- Forzar hashing en creación/actualización de usuario.
- Ejecutar script de auditoría para confirmar que no quedan contraseñas planas.
- Ajustar cost (rounds) según performance (default 10). Subir a 12 si el servidor lo permite.

## 8. Middleware de Autenticación
Archivo: `middleware/auth.js`
- `authOptional`: si encuentra header `Authorization: Bearer <token>` lo verifica y carga `req.user`.
- No rompe si no hay header → permite seguir usando `_devrole` durante desarrollo.

Integración (`index.js`):
```js
app.use(authOptional);
app.use('/auth', authRouter);
```

## 9. Integración con Autorización (Permisos)
- Una vez que `req.user` existe (vía token) los middlewares de permisos usan `req.user.effectivePerms`.
- Si no hay token pero estás en desarrollo, `loadUserDev` puede inyectar un rol simulado.
- En producción se recomienda eliminar el fallback dev para evitar accesos sin token.

## 10. Errores Comunes
| Código | Situación | Respuesta |
|--------|-----------|-----------|
| 400 MISSING_FIELDS | Falta email o password | Campos requeridos |
| 401 INVALID_CREDENTIALS | Email o password inválidos | Mensaje genérico |
| 401 TOKEN_EXPIRED | `exp` vencido | Renovar token con nuevo login |
| 401 TOKEN_INVALID | Firma incorrecta / token malformado | Reautenticar |
| 401 NO_AUTH | Acceso a `/auth/me` sin token | Enviar header Authorization |

## 11. Próximas Fases
Fase 2:
- Forzar hash siempre.
- Eliminar contraseñas planas restantes.
- Endpoints de cambio de contraseña y reset (token temporal).

Fase 3:
- Refresh tokens (tabla + rotación).
- Lista de revocación (logout global / invalidación por seguridad).
- Auditoría (tabla de accesos, IP, user-agent).

Fase 4:
- MFA opcional (correo / TOTP).
- Rate limiting en login.

---
**Notas Operativas**
- Variable `JWT_SECRET` debe configurarse distinta en cada entorno.
- No almacenar tokens en localStorage si se decide política más estricta contra XSS (alternativa: cookies httpOnly + CSRF token). Para la fase actual se asume SPA interna controlada.

*Actualizado: 2025-10-02*
