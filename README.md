# Sistema Nacional de Orquestas

Plataforma web para la gestión integral de alumnos, programas, instrumentos, eventos y usuarios del Sistema Nacional de Orquestas.

---

## 📦 Estructura del Proyecto

```
Sistema-Orquesta/
│
├── backend/              # API REST (Node.js, Express, MySQL)
│   ├── index.js          # Código principal del backend
│   └── ... 
│
├── sistema-orquesta/     # Frontend (React)
│   ├── src/
│   │   ├── api/          # Lógica de comunicación con el backend
│   │   │   └── alumnos.js
│   │   ├── components/   # Componentes reutilizables
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── MultiSelect.jsx
│   │   │   ├── AlumnoForm.jsx
│   │   │   ├── AlumnoHistorial.jsx
│   │   │   └── AlumnoInstrumento.jsx
│   │   └── pages/
│   │       └── Alumnos.jsx
│   └── ...
│
├── docs/                 # Documentación técnica adicional
│   └── api.md
│
└── README.md             # Este archivo
```

---

## 🚀 Descripción General del Sistema

El sistema está dividido en dos grandes módulos:

### 1. Backend (API REST)
Desarrollado con **Node.js**, **Express** y **MySQL**. Expone una API RESTful que permite gestionar todos los datos del sistema:

- **Programas:** Alta, baja, modificación y consulta de programas musicales.
- **Alumnos:** Gestión completa de alumnos, incluyendo asociación a múltiples programas, historial de eventos, asignación y liberación de instrumentos, exportación de datos y consulta avanzada con filtros y paginación.
- **Instrumentos:** Registro, administración y estado de instrumentos musicales, con reportes agregados por estado.
- **Eventos:** Gestión de eventos, consulta de eventos futuros, eventos por mes y registro de participación de alumnos.
- **Reportes:** Consultas agregadas como alumnos por programa e instrumentos por estado, optimizadas para relaciones muchos-a-muchos.
- **Usuarios:** Administración de usuarios del sistema, con recomendaciones para seguridad y autenticación.
- **Dashboard:** Estadísticas rápidas y consultas para paneles administrativos, incluyendo métricas de alumnos, instrumentos y eventos.

El backend se conecta a una base de datos MySQL y expone endpoints para cada entidad y reporte, permitiendo la integración con cualquier frontend o sistema externo. Incluye manejo avanzado de errores, validaciones y estructura modular para facilitar el mantenimiento y la escalabilidad.

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
2. Configura la conexión a MySQL en `index.js` (usuario, contraseña, base de datos).
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

La documentación completa de los endpoints y ejemplos de uso está en [`docs/api.md`](docs/api.md).

---

## 🛠️ Dependencias principales

### Backend

- **express**: Framework para crear la API REST.
- **cors**: Permite peticiones entre dominios (útil para desarrollo frontend-backend).
- **mysql2/promise**: Cliente MySQL con soporte para promesas, usado para la conexión y consultas a la base de datos.

Instalación:
```sh
npm install express cors mysql2
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

- **Conexión a MySQL**: Configuración de pool de conexiones.
- **Rutas REST**: Endpoints para cada entidad (`/programas`, `/alumnos`, `/instrumentos`, `/eventos`, `/usuarios`, `/reportes`, `/dashboard`).
- **Manejo de errores**: Respuestas claras en caso de error de base de datos o datos inválidos.
- **Servidor Express**: Inicialización y escucha en el puerto 4000.
- **Módulos auxiliares**: Funciones para registro de historial, manejo de documentos y lógica de negocio.

Cada endpoint sigue el patrón estándar REST:  
- `GET` para consultar  
- `POST` para crear  
- `PUT` para actualizar  
- `DELETE` para eliminar

Incluye endpoints avanzados para reportes y exportación de datos.

---

## 🖥️ Estructura del Frontend

- **src/api/alumnos.js:** Centraliza todas las llamadas al backend relacionadas con alumnos, programas, historial e instrumentos.
- **src/components/**: Componentes reutilizables para formularios, modales, selección múltiple y gestión de datos.
- **src/pages/Alumnos.jsx:** Página principal para la gestión de alumnos, con integración total a la API y componentes auxiliares.

La estructura modular permite escalar el sistema y agregar nuevas funcionalidades de manera sencilla.

---

## 🔒 Seguridad y buenas prácticas

- Las contraseñas de usuario deben almacenarse como hash (actualmente solo para pruebas, se recomienda encriptar en producción).
- Se recomienda agregar autenticación y autorización para ambientes productivos.
- El sistema está preparado para ampliarse con validaciones, logs y manejo avanzado de errores.
- Uso de CORS para permitir el desarrollo y la integración entre frontend y backend.

---

## 📝 Buenas prácticas de desarrollo

- Código modular y reutilizable, con separación clara entre lógica de negocio, presentación y comunicación con la API.
- Uso de componentes funcionales y hooks en React para una gestión eficiente del estado y los efectos.
- Documentación técnica adicional en la carpeta `docs/` para facilitar la colaboración y el mantenimiento.