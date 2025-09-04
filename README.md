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
- **Alumnos:** Gestión completa de alumnos, incluyendo asociación a programas y consulta avanzada.
- **Instrumentos:** Registro y administración de instrumentos musicales.
- **Eventos:** Gestión de eventos, consulta de eventos futuros y por mes.
- **Reportes:** Consultas agregadas como alumnos por programa e instrumentos por estado.
- **Usuarios:** Administración de usuarios del sistema.
- **Dashboard:** Estadísticas rápidas y consultas para paneles administrativos.

El backend se conecta a una base de datos MySQL y expone endpoints para cada entidad y reporte, permitiendo la integración con cualquier frontend o sistema externo.

### 2. Frontend
Desarrollado en **React** (Vite), permite la visualización y gestión de todos los módulos anteriores. Incluye paneles administrativos, formularios y dashboards con estadísticas.

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

Cada endpoint sigue el patrón estándar REST:  
- `GET` para consultar  
- `POST` para crear  
- `PUT` para actualizar  
- `DELETE` para eliminar

---

## 🔒 Seguridad y buenas prácticas

- Las contraseñas de usuario deben almacenarse como hash (actualmente solo para pruebas, se recomienda encriptar en producción).
- Se recomienda agregar autenticación y autorización para ambientes productivos.
- El sistema está preparado para ampliarse con validaciones, logs y manejo avanzado de errores.

---

## 👨‍💻 Autor

- Jesús64000

---