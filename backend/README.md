# Sistema Orquesta — Backend

API REST para gestión de alumnos, programas, representantes, instrumentos y eventos.

## Tecnologías
- Node.js (ESM)
- Express
- MySQL (mysql2/promise)
- Multer (uploads)

## Requisitos
- Node.js 18+ (recomendado 20 o superior)
- MySQL 8.x
- PowerShell o CMD (Windows)

## Instalación
1) Clonar el repo y abrir la carpeta backend:
```powershell
cd F:\sistema-orquesta\backend
```

2) Instalar dependencias:
```powershell
npm install
```

3) Configurar la conexión a la base de datos en `db.js` (host, puerto, usuario, contraseña y base). Opciones:
- Editar directamente `db.js` con tus credenciales.
- O usar variables de entorno si tu `db.js` ya las lee (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).

4) Asegúrate de tener la carpeta de uploads:
```
F:\sistema-orquesta\backend\uploads\
```

5) Ejecutar en desarrollo:
```powershell
node .\index.js
```

## Estructura
```
backend/
  db.js
  index.js
  package.json
  uploads.config.js
  uploads/
  helpers/
    alumnos.js
    historial.js
  routes/
    alumnos.js
    programas.js
    representantes.js
    instrumentos.js
    eventos.js
    reportes.js
    dashboard.js
```

## Convenciones importantes
- ESM: se usa `import`/`export`. Asegúrate de tener `"type": "module"` en package.json.
- Rutas con Router: cada archivo en `routes/` usa `Router()` y exporta `export default router`.
- Prefijos: dentro de cada archivo de rutas no se repite el prefijo del recurso. El prefijo real se define en `index.js` con `app.use(...)`.
- Exports nombrados en helpers:
  - `helpers/alumnos.js` exporta: `fetchProgramasPorAlumnos`, `fetchAlumnosWithPrograms`.
  - `helpers/historial.js` exporta: `registrarHistorial`, `registrarHistorialInstrumento`.

Ejemplo de import correcto:
```js
import { fetchAlumnosWithPrograms } from '../helpers/alumnos.js';
```

## Montaje de rutas (referencia)
Verifica `index.js`. Debe ser similar a:
```js
import express from 'express';
import alumnos from './routes/alumnos.js';
import programas from './routes/programas.js';
import representantes from './routes/representantes.js';
import instrumentos from './routes/instrumentos.js';
import eventos from './routes/eventos.js';
import reportes from './routes/reportes.js';
import dashboard from './routes/dashboard.js';

const app = express();
app.use(express.json());

// Ajusta el prefijo que prefieras (ej. '/api')
app.use('/alumnos', alumnos);
app.use('/programas', programas);
app.use('/representantes', representantes);
app.use('/instrumentos', instrumentos);
app.use('/eventos', eventos);
app.use('/reportes', reportes);
app.use('/dashboard', dashboard);

app.listen(3000, () => console.log('API escuchando en http://localhost:3000'));
```

## Subidas de archivos
`uploads.config.js` configura Multer y crea la carpeta `uploads/` si no existe. Si necesitas guardar por alumno (ej. `/uploads/alumnos/:id`), se puede adaptar el destino en función de `req.params.id`.

## Descripción de módulos
- `db.js`: crea el pool de conexiones MySQL.
- `helpers/alumnos.js`:
  - `fetchProgramasPorAlumnos(idsAlumnos)`
  - `fetchAlumnosWithPrograms({ search, estado, programa_id, ids })`
- `helpers/historial.js`:
  # Sistema Orquesta — Backend

  API REST para gestión de alumnos, programas, representantes, instrumentos y eventos.

  ## Tecnologías

  - Node.js (ESM)
  - Express
  - MySQL (mysql2/promise)
  - Multer (subida de archivos)

  ## Requisitos mínimos

  - Node.js 18+ (recomendado 20+)
  - MySQL 8.x o compatible

  ## Instalación y ejecución (rápida)

  1. Abrir la carpeta `backend`:

  ```powershell
  cd F:\sistema-orquesta\backend
  ```

  2. Instalar dependencias:

  ```powershell
  npm install
  ```

  3. Crear un archivo `.env` con las variables necesarias (ver sección "Variables de entorno").

  4. Asegúrate de la carpeta de uploads existe (o será creada por `uploads.config.js`):

  ```
  F:\sistema-orquesta\backend\uploads\
  ```

  5. Levantar el servidor (por defecto puerto 4000):

  ```powershell
  npm start
  ```

  > El servidor hace un `SELECT 1` al inicio para verificar la conexión a la base de datos y ejecuta migraciones definidas salvo que `MIGRATIONS=off`.

  ## Variables de entorno sugeridas

  Define estas variables en `.env` (NO comitear el `.env`):

  - DB_HOST (ej. localhost)
  - DB_USER
  - DB_PASS
  - DB_NAME
  - DB_PORT (opcional)
  - JWT_SECRET (obligatorio en producción)
  - PORT (por defecto 4000)
  - MIGRATIONS (on|off)
  - TRUST_PROXY (0|1)
  - ALLOW_DEV_USER (1 para permitir carga de usuario dev en desarrollo)

  Ejemplo `.env`:

  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=
  DB_NAME=sistema_orquesta
  JWT_SECRET=clave_segura_local
  PORT=4000
  MIGRATIONS=on
  TRUST_PROXY=0
  ALLOW_DEV_USER=1
  ```

  ## Estructura principal

  ```
  backend/
    ├─ db.js                # Pool MySQL (exporta default = pool)
    ├─ index.js             # Arranque: chequear BD, correr migraciones y levantar app
    ├─ app.js               # Configuración de Express y montaje de rutas
    ├─ uploads.config.js    # Configuración de multer y destinos de subida
    ├─ middleware/          # auth, rateLimit, requirePermiso, etc.
    ├─ routes/              # Rutas por recurso
    ├─ helpers/             # Lógica de negocio reutilizable
    ├─ migrations/          # Scripts de migración/seed
    └─ tests/               # Tests unitarios/integración (node --test)
  ```

  ## Convenciones y notas de desarrollo

  - ESM: el proyecto usa import/export y `
  ESM: el proyecto usa import/export y `"type": "module"` en `package.json`.

  ### Contraseñas

  - El sistema utiliza `bcrypt` para comparar/hashear contraseñas en login y cambio de contraseña.
  - Atención: hay un `TODO` en `routes/usuarios.js` para asegurar que la creación de usuarios siempre hashee las contraseñas. Revisar y corregir antes de producción.

  ## Endpoints principales (resumen)

  Nota: los endpoints están montados desde `app.js` y se asumen sin prefijo `/api`. Ajusta según tu montaje.

  - Auth
    - POST /auth/login  — login (email, password) -> { token, user }
    - GET  /auth/me     — información del usuario autenticado

  - Usuarios
    - GET    /usuarios
    - POST   /usuarios
    - PUT    /usuarios/:id
    - DELETE /usuarios/:id
    - PUT    /usuarios/:id/activo
    - POST   /usuarios/:id/reset-password
    - PUT    /usuarios/me
    - PUT    /usuarios/me/password

  - Alumnos, Programas, Instrumentos, Representantes, Eventos, Reportes, Dashboard
    - CRUD y endpoints específicos en `routes/` (ver archivos). Ejemplos: `/alumnos`, `/programas`, `/instrumentos`, `/eventos`, `/reportes`.

  ## Ejemplos (curl / PowerShell)

  - Login:

  ```bash
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@local","password":"secret"}'
  ```

  - Obtener sesión (usar token devuelto):

  ```bash
  curl http://localhost:4000/auth/me -H "Authorization: Bearer <TOKEN>"
  ```

  - Listar programas:

  ```bash
  curl http://localhost:4000/programas
  ```

  ## Migraciones

  - Las migraciones/seed inicial están en `migrations/`.
  - `index.js` ejecuta `ensureMigrations` al inicio salvo que `MIGRATIONS=off`.

  Si necesitas correr migraciones manualmente, revisa `migrations/ensureMigrations.js` y los archivos dentro de `migrations/`.

  ## Tests

  - Ejecutar tests del backend:

  ```powershell
  cd backend
  npm test
  ```

  Los tests usan el runner embebido `node --test`. Asegúrate de no correr pruebas contra la BD de producción.

  ## Seguridad y despliegue

  - No dejar `ALLOW_DEV_USER` activo en producción.
  - Asegurar `JWT_SECRET` fuerte y rotación periódica si aplica.
  - Usar HTTPS en producción y configurar `TRUST_PROXY=1` si la app está detrás de proxy/load balancer.
  - Para despliegues en múltiples instancias, reemplazar `rateLimit` en memoria por un backend compartido (Redis).

  ## Troubleshooting

  - Error conectando a DB: confirmar variables de entorno o credenciales en `db.js`.
  - Error "Unknown column": posible desalineación entre migraciones y código; revisar `migrations/`.
  - Problemas con ESM: confirmar `"type": "module"` en `package.json` y que Node.js sea versión compatible.

  ## Contribuciones

  - Abrir issues para bugs y features.
  - Crear ramas por feature/fix y abrir PR con descripción y tests.

  ---

  Si quieres, puedo:

  - aplicar el fix inmediato para hashear contraseñas en `routes/usuarios.js`.
  - crear un `backend/.env.example` con variables de entorno sugeridas.

  Indica si continúo con esos cambios.