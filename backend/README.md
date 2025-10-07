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
  - `registrarHistorial(id_alumno, tipo, descripcion, usuario)`
  - `registrarHistorialInstrumento(id_instrumento, tipo, descripcion, usuario)`
- `routes/*`: controladores Express organizados por recurso.

## Endpoints principales
El prefijo base depende de cómo montes las rutas en `index.js`. A continuación se asume sin `/api` y con el mismo nombre del recurso:

- Alumnos: `GET /alumnos`, `GET /alumnos/:id`, `POST /alumnos`, `PUT /alumnos/:id`, `PUT /alumnos/:id/desactivar`, etc.
- Programas: `GET /programas`, `POST /programas`, `PUT /programas/:id`, `DELETE /programas/:id`
- Representantes: `GET /representantes`, `GET /representantes/:id`, `POST /representantes`, `PUT /representantes/:id`, `DELETE /representantes/:id`
- Instrumentos: `GET /instrumentos`, `GET /instrumentos/:id`, `POST /instrumentos`, `PUT /instrumentos/:id`, `DELETE /instrumentos/:id`, `GET /instrumentos/:id/historial`, `POST /instrumentos/:id/historial`
- Eventos: `GET /eventos`, `PUT /eventos/:id`, `DELETE /eventos/:id`, `GET /eventos/futuros`, `GET /eventos/futuros2`
- Reportes: `GET /reportes/alumnos-por-programa`, `GET /reportes/instrumentos-por-estado`
- Dashboard: `GET /dashboard/stats`, `GET /dashboard/proximo-evento`, `GET /dashboard/eventos-futuros`, `GET /dashboard/eventos-mes?year=YYYY&month=MM`

## Ejemplos (PowerShell/curl)
- Listar programas:
```powershell
curl http://localhost:3000/programas
```
- Crear representante:
```powershell
curl -X POST http://localhost:3000/representantes `
  -H "Content-Type: application/json" `
  -d '{ "nombre":"Juan", "telefono":"555-123", "email":"juan@correo.com" }'
```
- Eventos futuros por programa:
```powershell
curl "http://localhost:3000/eventos/futuros?programa_id=1"
```

## Errores comunes y solución
- app is not defined: usa `Router` en archivos de `routes/` y exporta `export default router`.
- The requested module ... does not provide an export named ...:
  - Asegura que el helper exporta con nombre y que importas con llaves.
- ESM: si falla `import`, verifica `"type": "module"` en `package.json`.

## Seguridad
- Pendiente: hashear passwords en `routes/usuarios.js` (bcrypt).
- Validar inputs y usar parámetros `?` en queries (ya se hace en el código).

## Troubleshooting
- Ver logs de Node:
```powershell
node .\index.js
```
- Probar conexión a DB desde `db.js` (hacer un `SELECT 1`).
- Confirmar que las tablas existen: `Alumno`, `Programa`, `Representante`, `Instrumento`, `Evento`,
  relaciones `alumno_programa`, y tablas de historial `Alumno_Historial`, `Instrumento_Historial`.

---
Cualquier ajuste de prefijos o nuevas rutas, recuerda montarlas en `index.js` y no repetir el prefijo dentro del archivo de ruta.