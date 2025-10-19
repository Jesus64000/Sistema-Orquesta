
# Sistema Nacional de Orquestas

<p align="center">
   <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Orquesta_Sinf%C3%B3nica_Nacional_de_Venezuela.jpg" width="400" alt="Sistema Nacional de Orquestas"/>
</p>

Plataforma web integral para la gestión de alumnos, programas, instrumentos, eventos y usuarios del Sistema Nacional de Orquestas.

---

## 📑 Tabla de Contenido

<details>
<summary><strong>Ver índice completo</strong></summary>

- [📦 Estructura del Proyecto](#estructura-del-proyecto)
- [🚀 Descripción General del Sistema](#descripción-general-del-sistema)
- [⚙️ Instalación y Ejecución](#instalación-y-ejecución)
- [📚 Documentación de la API](#documentación-de-la-api)
- [🛠️ Dependencias principales](#dependencias-principales)
- [🗄️ Estructura del Backend](#estructura-del-backend)
# Sistema Nacional de Orquestas

![Orquesta](https://upload.wikimedia.org/wikipedia/commons/6/6a/Orquesta_Sinf%C3%B3nica_Nacional_de_Venezuela.jpg)

Plataforma web para la gestión de alumnos, programas, instrumentos, eventos y usuarios del Sistema Nacional de Orquestas.

Este repositorio contiene la API (backend) construída con Node.js/Express y la interfaz cliente (frontend) con React + Vite.

---

## Índice rápido

- Descripción general
- Requisitos y Quick Start (backend y frontend)
- Variables de entorno importantes
- Estructura del proyecto
- Notas para desarrolladores
- Documentación y recursos

---

## Descripción general

El sistema está compuesto por dos piezas principales:

- Backend: API REST en Node.js y MySQL. Gestiona autenticación (JWT), permisos por roles, entidades (alumnos, programas, instrumentos, eventos, usuarios) y exportación de datos.
- Frontend: Single Page App en React (Vite). Consume la API, gestiona sesión en localStorage y aplica controles de UI basados en permisos.

La arquitectura es modular para facilitar extensiones y mantenimiento.

---

## Requisitos

- Node.js >= 18 (recomendado)
- npm (o pnpm/yarn)
- MySQL (local o en contenedor)

Recomendado usar un entorno de desarrollo con Docker para la base de datos o una instancia MySQL local.

---

## Quick Start

Estos son los pasos mínimos para levantar el proyecto en desarrollo.

1) Backend

```bash
cd backend
npm install
# configurar variables de entorno (ver sección "Variables de entorno")
# levantar la API (puerta por defecto 4000)
npm start
```

2) Frontend

```bash
cd sistema-orquesta
npm install
npm run dev
```

Por defecto el frontend de desarrollo (Vite) sirve en http://localhost:5173 y el backend en http://localhost:4000.

Si necesitas ejecutar las pruebas del backend (si existen y están preparadas):

```bash
cd backend
npm test
```

---

## Variables de entorno (principales)

Configura estas variables para entornos de desarrollo/producción (por ejemplo con un `.env`):

- DB_HOST — host de MySQL (ej. localhost)
- DB_USER — usuario de BD
- DB_PASS — contraseña
- DB_NAME — nombre de la base de datos
- JWT_SECRET — secreto para firmar tokens JWT (obligatorio en producción)
- PORT — puerto del backend (por defecto 4000)
- MIGRATIONS — `off` para desactivar la ejecución automática de migraciones en arranque
- TRUST_PROXY — `1` si la app está detrás de proxy y quiere confiar en X-Forwarded-* (relevante para rate limiting por IP)
- ALLOW_DEV_USER — (opcional) permitir carga de usuario de desarrollo (header `x-user-id` o query `_devrole`). Usar SOLO en desarrollo.

Ejemplo `.env` (NO subir a repositorio):

```
DB_HOST=localhost
DB_USER=root
DB_PASS=secreto
DB_NAME=sistema_orquesta
JWT_SECRET=una_clave_segura
PORT=4000
MIGRATIONS=on
TRUST_PROXY=0
ALLOW_DEV_USER=1
```

---

## Estructura del proyecto (resumen)

```
/backend                 # API Node.js + migraciones + routes
  ├─ db.js
  ├─ index.js
  ├─ app.js
  ├─ routes/
  ├─ middleware/
  └─ migrations/

/sistema-orquesta        # Frontend React (Vite)
  ├─ src/
  │  ├─ api/
  │  ├─ components/
  │  ├─ context/
  │  └─ pages/
  └─ package.json

/docs                    # Documentación técnica y guías

README.md
```

---

## Notas importantes para desarrolladores

- Contraseñas: el sistema usa bcrypt en varios puntos (login, cambio de contraseña). Hay un `TODO` en el endpoint de creación de usuarios (`backend/routes/usuarios.js`) para asegurar que siempre se hashee la contraseña al crear cuentas. Verificar antes de poner en producción.
- Permisos: el backend centraliza el catálogo de permisos en `backend/permissionsCatalog.js`. El frontend transforma `effectivePerms` en tokens `recurso:accion` para el control de UI.
- Usuario de desarrollo: existe soporte para inyectar un usuario de desarrollo (`x-user-id` o `_devrole`) para facilitar testing en local. Asegúrate de desactivar esto en producción (controlado por `ALLOW_DEV_USER` / `NODE_ENV`).
- Rate limiting: la implementación actual (`middleware/rateLimit.js`) es en memoria. No es adecuada para despliegues en múltiples instancias — se recomienda usar Redis o un servicio centralizado si se escala.

---

## Migraciones

Las migraciones están en `backend/migrations/`. Por defecto, en el arranque (`index.js`) se ejecuta `ensureMigrations` salvo que `MIGRATIONS=off`.

Si prefieres controlar las migraciones manualmente, pon `MIGRATIONS=off` y ejecuta el script que corresponda desde `migrations/`.

---

## Tests y calidad

- Backend: `npm test` en `backend/` ejecuta pruebas Node.js (`node --test`). Revisa `backend/tests/`.
- Frontend: `npm test` en `sistema-orquesta/` usa Vitest si está configurado.

Es recomendable añadir un pipeline CI que ejecute linter y tests para cada PR.

---

## Recursos y documentación

- Documentación de la API y modelos: ver carpeta `docs/` (`api.md`, `modelos.md`, `arquitectura.md`).
- Guía de instalación avanzada y troubleshooting: `docs/instalacion.md`.
- Historial de cambios: `docs/changelog.md`.

---

## Cómo contribuir

1. Abre un issue describiendo la mejora o bug.
2. Crea una rama con un nombre claro: `feature/<tema>` o `fix/<tema>`.
3. Añade tests para cambios de lógica cuando aplique.
4. Abre un pull request describiendo los cambios.

Consulta `docs/contribuir.md` para el flujo de trabajo y las convenciones de código.

---

## Contacto

Para dudas o soporte, abre un issue en el repositorio o contacta con el equipo responsable.

---

*Este README fue reorganizado para facilitar la incorporación de nuevos desarrolladores y la puesta en marcha rápida del proyecto. Si quieres que también actualice los README específicos de `backend/` y `sistema-orquesta/`, dime y los rehago manteniendo el mismo nivel de detalle.*