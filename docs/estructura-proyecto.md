# Estructura del Proyecto

Este documento describe la organización de carpetas y archivos del Sistema Nacional de Orquestas, facilitando la comprensión, mantenimiento y escalabilidad del sistema.

---

## 1. Vista General

```
Sistema-Orquesta/
│
├── backend/                  # API REST (Node.js, Express, MySQL)
│   ├── index.js              # Punto de entrada principal
│   ├── controllers/          # Lógica de negocio por entidad
│   ├── routes/               # Definición de rutas REST
│   ├── models/               # Modelos de datos y acceso a BD
│   ├── middlewares/          # Validaciones y manejo de errores
│   ├── utils/                # Funciones auxiliares (exportación, reportes)
│   ├── uploads/              # Archivos subidos por usuarios
│   ├── package.json          # Dependencias y configuración
│   └── ...
│
├── sistema-orquesta/         # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/              # Comunicación con la API
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Vistas principales
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── context/          # Contextos globales
│   │   └── ...
│   ├── public/               # Recursos estáticos
│   ├── package.json          # Dependencias y configuración
│   └── ...
│
├── docs/                     # Documentación técnica
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
└── README.md                 # Documentación principal
```

---

## 2. Descripción de Carpetas Clave

### backend/
- **controllers/**: Lógica de negocio y operaciones por entidad.
- **routes/**: Definición de rutas RESTful.
- **models/**: Modelos de datos y acceso a la base de datos.
- **middlewares/**: Validaciones, autenticación y manejo de errores.
- **utils/**: Funciones auxiliares (exportación, reportes, helpers).
- **uploads/**: Archivos subidos por los usuarios.

### sistema-orquesta/src/
- **api/**: Lógica de comunicación con la API (fetch, axios).
- **components/**: Componentes reutilizables (modales, formularios, selectores).
- **pages/**: Vistas principales (Alumnos, Programas, Instrumentos, Eventos, Dashboard).
- **hooks/**: Hooks personalizados para lógica compartida.
- **context/**: Contextos globales para usuario, sesión y estado.

### docs/
- Documentación técnica y guías (API, arquitectura, modelos, instalación, seguridad, changelog, contribución).

---

## 3. Recomendaciones

- Mantener la estructura modular para facilitar la escalabilidad y el mantenimiento.
- Documentar cada carpeta y archivo relevante.
- Actualizar este archivo conforme evolucione el sistema y se agreguen nuevos módulos.