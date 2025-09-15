# Sistema Nacional de Orquestas

Plataforma web para la gestión integral de alumnos, programas, instrumentos, eventos y usuarios del Sistema Nacional de Orquestas.

---

## 📑 Tabla de contenido

- [📦 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Descripción General del Sistema](#-descripción-general-del-sistema)
- [⚙️ Instalación y Ejecución](#-instalación-y-ejecución)
- [📚 Documentación de la API](#-documentación-de-la-api)
- [🛠️ Dependencias principales](#-dependencias-principales)
- [🗄️ Estructura del Backend](#-estructura-del-backend)
- [🖥️ Estructura del Frontend](#-estructura-del-frontend)
- [🔒 Seguridad y buenas prácticas](#-seguridad-y-buenas-prácticas)
- [📝 Buenas prácticas de desarrollo](#-buenas-prácticas-de-desarrollo)
- [📜 Historial de cambios](docs/changelog.md)
- [📖 Guía de instalación](docs/instalacion.md)
- [🔐 Guía de seguridad](docs/seguridad.md)

---

## 📦 Estructura del Proyecto

```
Sistema-Orquesta/
│
├── backend/              
│   ├── index.js          
│   ├── controllers/
│   │   ├── alumnoController.js
│   │   ├── programaController.js
│   │   ├── instrumentoController.js
│   │   ├── eventoController.js
│   │   ├── usuarioController.js
│   │   └── orquestaController.js
│   ├── routes/
│   │   ├── alumnoRoutes.js
│   │   ├── programaRoutes.js
│   │   ├── instrumentoRoutes.js
│   │   ├── eventoRoutes.js
│   │   ├── usuarioRoutes.js
│   │   └── orquestaRoutes.js
│   ├── models/
│   │   ├── alumno.js
│   │   ├── programa.js
│   │   ├── instrumento.js
│   │   ├── evento.js
│   │   ├── usuario.js
│   │   └── orquesta.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── validateAlumno.js
│   │   ├── validatePrograma.js
│   │   └── validateEvento.js
│   ├── utils/
│   │   ├── exportExcel.js
│   │   ├── reportGenerator.js
│   │   ├── dateHelper.js
│   │   └── fileHelper.js
│   ├── uploads/
│   │   ├── alumnos/
│   │   ├── programas/
│   │   ├── eventos/
│   │   └── otros/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── logger.js
│   ├── tests/
│   │   ├── alumno.test.js
│   │   ├── programa.test.js
│   │   ├── evento.test.js
│   │   └── usuario.test.js
│   ├── .env
│   ├── README.md
│   └── ...
│
├── sistema-orquesta/
│   ├── src/
│   │   ├── api/
│   │   │   ├── alumnoApi.js
│   │   │   ├── programaApi.js
│   │   │   ├── instrumentoApi.js
│   │   │   ├── eventoApi.js
│   │   │   ├── usuarioApi.js
│   │   │   └── orquestaApi.js
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── MultiSelect.jsx
│   │   │   ├── AlumnoForm.jsx
│   │   │   ├── AlumnoHistorial.jsx
│   │   │   ├── AlumnoInstrumento.jsx
│   │   │   ├── TablaAlumnos.jsx
│   │   │   ├── TablaProgramas.jsx
│   │   │   ├── SelectorInstrumento.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Loader.jsx
│   │   ├── pages/
│   │   │   ├── Alumnos.jsx
│   │   │   ├── Programas.jsx
│   │   │   ├── Instrumentos.jsx
│   │   │   ├── Eventos.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   └── Orquestas.jsx
│   │   ├── hooks/
│   │   │   ├── useFetch.js
│   │   │   ├── useForm.js
│   │   │   ├── useAuth.js
│   │   │   └── useModal.js
│   │   ├── context/
│   │   │   ├── UserContext.js
│   │   │   ├── SessionContext.js
│   │   │   ├── OrquestaContext.js
│   │   │   └── AuthContext.js
│   │   ├── assets/
│   │   │   ├── logo.png
│   │   │   ├── fondo.jpg
│   │   │   ├── icono.svg
│   │   │   └── estilos.css
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   ├── dashboard.css
│   │   │   └── tabla.css
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   ├── validateEmail.js
│   │   │   └── helpers.js
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── tests/
│   │   ├── Modal.test.jsx
│   │   ├── FormAlumno.test.jsx
│   │   ├── TablaAlumnos.test.jsx
│   │   └── Dashboard.test.jsx
│   ├── README.md
│   └── ...
│
├── docs/
│   ├── api.md
│   ├── arquitectura.md
│   ├── changelog.md
│   ├── contribuir.md
│   ├── db.sql
│   ├── instalacion.md
│   ├── modelos.md
│   ├── seguridad.md
│   └── estructura-proyecto.md
│
└── README.md
```

---

## 🚀 Descripción General del Sistema

El sistema está dividido en dos grandes módulos:

### 1. Backend (API REST)
Desarrollado con **Node.js**, **Express** y **MySQL**. Expone una API RESTful que permite gestionar todos los datos del sistema:

- **Programas:** Alta, baja, modificación y consulta de programas musicales.
- **Alumnos:** Gestión completa de alumnos, incluyendo asociación a múltiples programas, historial de eventos, asignación y liberación de instrumentos, exportación de datos, gestión de documentos y consulta avanzada con filtros y paginación.
- **Instrumentos:** Registro, administración y estado de instrumentos musicales, con reportes agregados por estado y asignación a alumnos.
- **Eventos:** Gestión de eventos, consulta de eventos futuros, eventos por mes y registro de participación y asistencia de alumnos.
- **Reportes:** Consultas agregadas como alumnos por programa e instrumentos por estado, optimizadas para relaciones muchos-a-muchos.
- **Usuarios:** Administración de usuarios del sistema, con roles y recomendaciones para seguridad y autenticación.
- **Dashboard:** Estadísticas rápidas y consultas para paneles administrativos, incluyendo métricas de alumnos, instrumentos y eventos.

El backend se conecta a una base de datos MySQL y expone endpoints para cada entidad y reporte, permitiendo la integración con cualquier frontend o sistema externo. Incluye manejo avanzado de errores, validaciones, modularidad y soporte para exportación de datos y archivos.

### 2. Frontend
Desarrollado en **React** (Vite), permite la visualización y gestión de todos los módulos anteriores. Incluye paneles administrativos, formularios, dashboards con estadísticas y componentes reutilizables para una experiencia de usuario moderna y eficiente.

#### Componentes principales integrados:
- **Modal.jsx:** Ventanas modales reutilizables para formularios y confirmaciones.
- **ConfirmDialog.jsx:** Diálogos de confirmación para acciones críticas.
- **MultiSelect.jsx:** Selector múltiple para asignación de programas e instrumentos.
- **AlumnoForm.jsx:** Formulario para alta y edición de alumnos, con validaciones y soporte multi-programa.
- **AlumnoHistorial.jsx:** Visualización y gestión del historial de alumnos, incluyendo eventos y cambios de estado.
- **AlumnoInstrumento.jsx:** Asignación y liberación de instrumentos para alumnos, con integración directa a la API.
- **Alumnos.jsx:** Página principal de gestión de alumnos, con filtros, orden, paginación, selección múltiple y exportación a CSV.

La arquitectura del frontend está pensada para facilitar la extensión y el mantenimiento, permitiendo agregar nuevos módulos y funcionalidades de forma sencilla.

---

## ⚙️ Instalación y Ejecución

### Requisitos

- **Node.js** y **npm** (para backend y frontend)
- **MySQL** (puedes usar XAMPP)
- **Vite** (opcional, para frontend moderno)

### Instalación Backend

1. Instala dependencias:
   ```sh
   cd backend
   npm install
   ```
2. Configura la conexión a MySQL en `config/db.js` y variables en `.env`.
3. Ejecuta el servidor:
   ```sh
   node index.js
   ```
   El backend estará disponible en `http://localhost:4000`.

### Instalación Frontend

1. Instala dependencias:
   ```sh
   cd sistema-orquesta
   npm install
   ```
2. Ejecuta la app:
   ```sh
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:5173`.

---

## 📚 Documentación de la API

La documentación completa de los endpoints, ejemplos de uso y modelos de datos está en [`docs/api.md`](docs/api.md), [`docs/modelos.md`](docs/modelos.md) y [`docs/arquitectura.md`](docs/arquitectura.md).

---

## 🛠️ Dependencias principales

### Backend

- **express**: Framework para crear la API REST.
- **cors**: Permite peticiones entre dominios (útil para desarrollo frontend-backend).
- **mysql2/promise**: Cliente MySQL con soporte para promesas, usado para la conexión y consultas a la base de datos.
- **multer**: Gestión de archivos subidos (documentos).
- **dotenv**: Variables de entorno para configuración segura.

Instalación:
```sh
npm install express cors mysql2 multer dotenv
```

### Frontend

- **react**: Biblioteca principal para interfaces de usuario.
- **vite**: Herramienta para desarrollo rápido de React.
- **axios**: Cliente HTTP para consumir la API.

Instalación:
```sh
npm install react axios
```

---

## 🗄️ Estructura del Backend

El archivo principal `index.js` contiene:

- **Conexión a MySQL**: Configuración de pool de conexiones en `config/db.js`.
- **Rutas REST**: Endpoints para cada entidad (`/programas`, `/alumnos`, `/instrumentos`, `/eventos`, `/usuarios`, `/reportes`, `/dashboard`).
- **Manejo de errores**: Respuestas claras en caso de error de base de datos o datos inválidos.
- **Servidor Express**: Inicialización y escucha en el puerto 4000.
- **Módulos auxiliares**: Funciones para registro de historial, manejo de documentos y lógica de negocio.

Cada endpoint sigue el patrón estándar REST:  
- `GET` para consultar  
- `POST` para crear  
- `PUT` para actualizar  
- `DELETE` para eliminar

Incluye endpoints avanzados para reportes, exportación de datos y gestión de archivos.

---

## 🖥️ Estructura del Frontend

- **src/api/**: Centraliza todas las llamadas al backend relacionadas con alumnos, programas, historial, instrumentos y usuarios.
- **src/components/**: Componentes reutilizables para formularios, modales, selección múltiple y gestión de datos.
- **src/pages/**: Vistas principales para la gestión de alumnos, programas, instrumentos, eventos y dashboard.
- **src/hooks/**: Hooks personalizados para lógica compartida.
- **src/context/**: Contextos globales para usuario, sesión y estado de la aplicación.
- **src/assets/**: Imágenes, íconos y estilos.
- **src/styles/**: Archivos CSS globales y específicos.
- **src/utils/**: Funciones auxiliares para validaciones, formateo y helpers.
- **public/**: Archivos estáticos (index.html, favicon, manifest, robots.txt).
- **tests/**: Pruebas unitarias de componentes y vistas.

La estructura modular permite escalar el sistema y agregar nuevas funcionalidades de manera sencilla.

---

## 🔒 Seguridad y buenas prácticas

- Las contraseñas de usuario deben almacenarse como hash (actualmente solo para pruebas, se recomienda encriptar en producción).
- Se recomienda agregar autenticación y autorización para ambientes productivos.
- El sistema está preparado para ampliarse con validaciones, logs y manejo avanzado de errores.
- Uso de CORS para permitir el desarrollo y la integración entre frontend y backend.
- Configuración de variables de entorno para credenciales y rutas sensibles.
- Validaciones en backend y frontend para evitar datos inválidos y ataques comunes.
- Manejo centralizado de errores y respuestas consistentes.

---

## 📝 Buenas prácticas de desarrollo

- Código modular y reutilizable, con separación clara entre lógica de negocio, presentación y comunicación con la API.
- Uso de componentes funcionales y hooks en React para una gestión eficiente del estado y los efectos.
- Documentación técnica adicional en la carpeta `docs/` para facilitar la colaboración y el mantenimiento.
- Pruebas unitarias y de integración recomendadas para asegurar la calidad y estabilidad del sistema.
- Mantener la documentación y el changelog actualizados con cada nueva versión.
- Uso de control de versiones (git) y ramas para nuevas funcionalidades.
- Comentarios claros y documentación en el código fuente.

---

## 📜 Recursos y documentación adicional

- [Documentación de la API](docs/api.md)
- [Modelos de datos](docs/modelos.md)
- [Arquitectura del sistema](docs/arquitectura.md)
- [Guía de instalación](docs/instalacion.md)
- [Guía de seguridad](docs/seguridad.md)
- [Historial de cambios](docs/changelog.md)
- [Guía para colaboradores](docs/contribuir.md)
- [Script de base de datos](docs/db.sql)

---

## 💡 Contacto y soporte

Para dudas, sugerencias o reportes de errores, consulta la documentación técnica o contacta al equipo responsable del proyecto.

---