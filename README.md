
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
- [🖥️ Estructura del Frontend](#estructura-del-frontend)
- [🔒 Seguridad y buenas prácticas](#seguridad-y-buenas-prácticas)
- [📝 Buenas prácticas de desarrollo](#buenas-prácticas-de-desarrollo)
- [📜 Historial de cambios](docs/changelog.md)
- [📖 Guía de instalación](docs/instalacion.md)
- [🔐 Guía de seguridad](docs/seguridad.md)
- [🤝 Guía para colaboradores](docs/contribuir.md)
- [📊 Modelos de datos](docs/modelos.md)
- [🏛️ Arquitectura](docs/arquitectura.md)

</details>

---

## 📦 Estructura del Proyecto

```text
Sistema-Orquesta/
│
├── backend/              # API REST Node.js/Express/MySQL
│   ├── db.js             # Configuración de conexión a MySQL
│   ├── index.js          # Inicialización del servidor y rutas
│   ├── package.json      # Dependencias y scripts
│   ├── uploads.config.js # Configuración de subida de archivos
│   ├── helpers/          # Funciones auxiliares de negocio
│   ├── routes/           # Endpoints RESTful para cada entidad
│   ├── uploads/          # Archivos subidos por usuarios
│   └── ...
│
├── sistema-orquesta/     # Frontend React (Vite)
│   ├── src/
│   │   ├── api/          # Llamadas centralizadas al backend
│   │   ├── components/   # Componentes reutilizables y específicos
│   │   ├── pages/        # Vistas principales
│   │   ├── context/      # Contextos globales
│   │   ├── assets/       # Imágenes, íconos y estilos
│   │   ├── utils/        # Funciones auxiliares
│   │   └── ...
│   ├── public/           # Archivos estáticos
│   ├── package.json      # Dependencias y scripts
│   └── ...
│
├── docs/                 # Documentación técnica y de usuario
│   ├── api.md            # Endpoints y ejemplos de la API
│   ├── arquitectura.md   # Arquitectura y diagramas
│   ├── changelog.md      # Historial de cambios
│   ├── contribuir.md     # Guía para colaboradores
│   ├── instalacion.md    # Guía de instalación detallada
│   ├── modelos.md        # Modelos de datos y relaciones
│   ├── seguridad.md      # Buenas prácticas de seguridad
│   └── estructura-proyecto.md # Detalle de carpetas y archivos
│
├── .gitignore
├── README.md
└── ...
```

---

## 🚀 Descripción General del Sistema

> **Visión:**
> Plataforma modular, escalable y segura para la gestión de orquestas, adaptable a cualquier institución musical.

El sistema está dividido en dos grandes módulos:

### 1. Backend (API REST)

- **Tecnologías:** Node.js, Express, MySQL
- **Funcionalidad:**
   - Gestión de programas musicales (CRUD)
   - Gestión integral de alumnos (asociación a programas, historial, instrumentos, documentos, filtros, paginación)
   - Administración de instrumentos (registro, estado, reportes, asignación)
   - Gestión de eventos (futuros, históricos, participación, asistencia)
   - Reportes agregados (alumnos por programa, instrumentos por estado, relaciones N:M)
   - Administración de usuarios y roles
   - Dashboard con métricas clave
- **Características técnicas:**
   - API RESTful modular
   - Manejo avanzado de errores y validaciones
   - Exportación de datos y archivos
   - Integración sencilla con cualquier frontend

### 2. Frontend (React + Vite)

- **Tecnologías:** React, Vite, Axios
- **Funcionalidad:**
   - Paneles administrativos y dashboards
   - Formularios avanzados y filtros
   - Visualización de estadísticas y reportes
   - Componentes reutilizables y diseño responsivo
- **Componentes principales:**
   - Modal, ConfirmDialog, MultiSelect, InfoDialog, Loader
   - AlumnoDetalle, AlumnoForm, AlumnoHistorial, AlumnoInstrumento, ToggleAlumnoEstado
   - InstrumentoDetalle, InstrumentoForm, InstrumentoHistorial, InstrumentoAsignacion
   - EventoDetalle, EventoForm
   - Páginas: Alumnos, Configuraciones, Dashboard, Eventos, Instrumentos, Miembros, Reportes
   - Contextos y hooks personalizados

> **Nota:** La arquitectura está pensada para facilitar la extensión y el mantenimiento, permitiendo agregar nuevos módulos y funcionalidades de forma sencilla.

---

## ⚙️ Instalación y Ejecución

### Requisitos previos

- Node.js y npm (backend y frontend)
- MySQL (puedes usar XAMPP, WAMP, Docker, etc.)
- Vite (opcional, para desarrollo frontend moderno)

### Instalación Backend

```bash
cd backend
npm install
# Configura la conexión a MySQL en db.js y variables en .env
node index.js
# El backend estará disponible en http://localhost:4000
```

### Instalación Frontend

```bash
cd sistema-orquesta
npm install
npm run dev
# El frontend estará disponible en http://localhost:5173
```

> **Importante:** Consulta la [guía de instalación detallada](docs/instalacion.md) para pasos avanzados, configuración de variables de entorno y troubleshooting.

---

## 📚 Documentación de la API

La documentación completa de los endpoints, ejemplos de uso y modelos de datos está en:

- [docs/api.md](docs/api.md) — Endpoints, métodos, ejemplos de request/response
- [docs/modelos.md](docs/modelos.md) — Modelos de datos y relaciones
- [docs/arquitectura.md](docs/arquitectura.md) — Arquitectura y diagramas

> **Recomendación:** Consulta estos documentos antes de consumir la API o desarrollar nuevas funcionalidades.

---

## 🛠️ Dependencias principales

### Backend

| Paquete         | Descripción                                              |
|-----------------|----------------------------------------------------------|
| express         | Framework para crear la API REST                         |
| cors            | Permite peticiones entre dominios                        |
| mysql2/promise  | Cliente MySQL con soporte para promesas                  |
| multer          | Gestión de archivos subidos (documentos)                 |
| dotenv          | Variables de entorno para configuración segura           |

Instalación:
```bash
npm install express cors mysql2 multer dotenv
```

### Frontend

| Paquete | Descripción                                 |
|---------|---------------------------------------------|
| react   | Biblioteca principal para interfaces de usuario |
| vite    | Herramienta para desarrollo rápido de React  |
| axios   | Cliente HTTP para consumir la API           |

Instalación:
```bash
npm install react axios
```

---

## 🗄️ Estructura del Backend

| Archivo/Carpeta      | Descripción                                      |
|----------------------|--------------------------------------------------|
| db.js                | Configuración y conexión a MySQL                 |
| index.js             | Inicialización del servidor y rutas              |
| routes/              | Endpoints RESTful para cada entidad              |
| helpers/             | Funciones auxiliares de negocio                  |
| uploads/             | Archivos subidos por usuarios                    |
| uploads.config.js    | Configuración de subida de archivos              |
| package.json         | Dependencias y scripts                           |
| README.md            | Documentación técnica                            |

---

## 🖥️ Estructura del Frontend

| Carpeta/Archivo      | Descripción                                      |
|----------------------|--------------------------------------------------|
| src/api/             | Llamadas centralizadas al backend                |
| src/components/      | Componentes reutilizables y específicos          |
| src/pages/           | Vistas principales (Alumnos, Dashboard, etc.)    |
| src/context/         | Contextos globales                               |
| src/hooks/           | Hooks personalizados                             |
| src/assets/          | Imágenes, íconos y estilos                       |
| src/utils/           | Funciones auxiliares                             |
| public/              | Archivos estáticos (index.html, favicon, etc.)   |
| README.md            | Documentación específica del frontend            |

> **Nota:** La estructura modular permite escalar el sistema y agregar nuevas funcionalidades de manera sencilla.

---

## 🔒 Seguridad y buenas prácticas

- Las contraseñas de usuario deben almacenarse como hash seguro (bcrypt recomendado)
- Implementar autenticación y autorización para ambientes productivos
- Validaciones exhaustivas en backend y frontend
- Uso de CORS para desarrollo y producción
- Configuración de variables de entorno para credenciales y rutas sensibles
- Manejo centralizado de errores y respuestas consistentes
- Logs de auditoría y monitoreo recomendados

> Consulta la [guía de seguridad](docs/seguridad.md) para recomendaciones avanzadas y ejemplos de configuración.

---

## 📝 Buenas prácticas de desarrollo

- Código modular y reutilizable (separación de lógica, presentación y API)
- Componentes funcionales y hooks en React para gestión eficiente del estado
- Documentación técnica y de usuario actualizada en `docs/`
- Pruebas unitarias y de integración recomendadas
- Uso de control de versiones (git) y ramas para nuevas funcionalidades
- Comentarios claros y documentación en el código fuente
- Actualizar el changelog y la documentación con cada versión

> Consulta la [guía para colaboradores](docs/contribuir.md) para estándares de código, flujos de trabajo y recomendaciones de contribución.

---

## 📜 Recursos y documentación adicional

- [Documentación de la API](docs/api.md)
- [Modelos de datos](docs/modelos.md)
- [Arquitectura del sistema](docs/arquitectura.md)
- [Guía de instalación](docs/instalacion.md)
- [Guía de seguridad](docs/seguridad.md)
- [Historial de cambios](docs/changelog.md)
- [Guía para colaboradores](docs/contribuir.md)

---

## 💡 Contacto y soporte

¿Tienes dudas, sugerencias o encontraste un error?

- Consulta la documentación técnica en la carpeta `docs/`
- Abre un issue en el repositorio
- Contacta al equipo responsable del proyecto

---