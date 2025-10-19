# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


```markdown
# Frontend — sistema-orquesta (React + Vite)

Esta carpeta contiene la aplicación cliente desarrollada con React y Vite. La UI consume la API provista por el backend (ver `../backend`).

## Scripts útiles

- `npm run dev` — Levanta Vite en modo desarrollo (HMR). Por defecto en http://localhost:5173
- `npm run build` — Construye la versión de producción en `dist/`
- `npm run preview` — Sirve la build localmente para pruebas
- `npm run lint` — Ejecuta ESLint
- `npm test` — Ejecuta pruebas con Vitest (si están configuradas)

## Quick start (desarrollo)

1. Instala dependencias:

```bash
cd sistema-orquesta
npm install
```

2. Levanta la app en modo desarrollo:

```bash
npm run dev
```

3. Si el backend corre en `http://localhost:4000`, la configuración de Vite puede usar proxy para evitar CORS (ver `vite.config.js`).

## Configuración de proxy (Vite)

Si necesitas que las llamadas a `/auth` u otros endpoints se enruten al backend durante desarrollo, en `vite.config.js` se puede configurar un proxy. Ejemplo:

```js
// vite.config.js (extracto)
export default defineConfig({
	server: {
		proxy: {
			'/auth': 'http://localhost:4000',
			'/alumnos': 'http://localhost:4000',
			// ...otros endpoints
		}
	}
});
```

Con proxy activado, desde el frontend puedes usar rutas relativas (`/auth/login`) y las peticiones se redirigen al backend.

## Notas sobre autenticación y permisos

- `src/context/AuthContext.jsx` es la fuente de verdad de la sesión en el cliente. Guarda el token JWT en `localStorage` bajo la clave `auth_token` y rehidrata la sesión con `/auth/me`.
- `src/api/http.js` exporta un cliente axios que inyecta automáticamente el token en `Authorization: Bearer <token>` (usa `localStorage`). También mapea respuestas 403 a `{ data: { _denied: true } }` para facilidad de UI.
- En algunas rutas `AuthContext` usa `fetch` directamente para `POST /auth/login` y `GET /auth/me` (esto funciona pero podrías optar por centralizarlo en `http` para aprovechar interceptores).

## Recomendaciones de desarrollo

- Mantener sincronía en la representación de permisos entre backend y frontend: backend provee `effectivePerms` como objeto y el frontend lo transforma a tokens `recurso:accion`.
- Para testing local sin usuarios reales, el backend permite cargar un usuario de desarrollo (header `x-user-id` o query `_devrole`) si `ALLOW_DEV_USER=1`.
- Añadir tests unitarios para los helpers de permisos y para componentes que dependen de la autorización.

## Build y despliegue

- `npm run build` genera la carpeta `dist/` con la app lista para servir desde un servidor estático o integrarla en un contenedor.
- En producción, asegúrate de que el backend y frontend estén correctamente configurados para CORS/Proxy y que `JWT_SECRET` y otras variables sensibles estén definidas en el entorno del servidor.

## Recursos y documentación

- Revisa la documentación del backend en `../backend/README.md`.
- Documentación adicional: `../docs/` (API, modelos, arquitectura).

---

Si quieres, puedo:

- agregar un `sistema-orquesta/.env.example` con variables útiles para desarrollo (por ejemplo VITE_API_BASE_URL si se desea configurar baseURL para `http`).
- unificar `AuthContext` para que use `src/api/http.js` en lugar de `fetch`.

Indica si quieres que haga alguno de esos cambios ahora.

```
