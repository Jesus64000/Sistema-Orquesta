# Documentación Técnica de la API - Sistema Nacional de Orquestas

Esta API REST permite gestionar los datos del Sistema Nacional de Orquestas: programas, alumnos, instrumentos, eventos, reportes, usuarios y dashboard.

---

## Endpoints principales

### PROGRAMAS
- `GET /programas`  
  Lista todos los programas musicales.
- `POST /programas`  
  Crea un nuevo programa.
- `PUT /programas/:id`  
  Actualiza un programa existente.
- `DELETE /programas/:id`  
  Elimina un programa.

### ALUMNOS
- `GET /alumnos`  
  Lista todos los alumnos, incluyendo el nombre del programa al que pertenecen.
- `POST /alumnos`  
  Crea un nuevo alumno.
- `PUT /alumnos/:id`  
  Actualiza los datos de un alumno.
- `DELETE /alumnos/:id`  
  Elimina un alumno.

### INSTRUMENTOS
- `GET /instrumentos`  
  Lista todos los instrumentos musicales.
- `POST /instrumentos`  
  Crea un nuevo instrumento.
- `PUT /instrumentos/:id`  
  Actualiza los datos de un instrumento.
- `DELETE /instrumentos/:id`  
  Elimina un instrumento.

### EVENTOS
- `GET /eventos`  
  Lista todos los eventos registrados.
- `POST /eventos`  
  Crea un nuevo evento.
- `PUT /eventos/:id`  
  Actualiza los datos de un evento.
- `DELETE /eventos/:id`  
  Elimina un evento.
- `GET /eventos/futuros`  
  Lista los eventos futuros (puede filtrar por programa).

### REPORTES
- `GET /reportes/alumnos-por-programa`  
  Devuelve el número de alumnos agrupados por programa.
- `GET /reportes/instrumentos-por-estado`  
  Devuelve el número de instrumentos agrupados por estado.

### USUARIOS
- `GET /usuarios`  
  Lista todos los usuarios del sistema.
- `POST /usuarios`  
  Crea un nuevo usuario.
- `PUT /usuarios/:id`  
  Actualiza los datos de un usuario.
- `DELETE /usuarios/:id`  
  Elimina un usuario.

### DASHBOARD
- `GET /dashboard/stats`  
  Devuelve estadísticas rápidas (total alumnos, activos, nuevos hoy, personal).
- `GET /dashboard/proximo-evento`  
  Devuelve el próximo evento.
- `GET /dashboard/eventos-futuros`  
  Lista los eventos futuros.
- `GET /dashboard/eventos-mes?year=YYYY&month=MM`  
  Lista los eventos de un mes específico.

---

## Ejemplos de uso (curl)

**Crear un alumno**
```sh
curl -X POST http://localhost:4000/alumnos \
-H "Content-Type: application/json" \
-d '{"nombre":"Juan Pérez","fecha_nacimiento":"2005-06-01","genero":"M","telefono_contacto":"04141234567","id_programa":1,"estado":"Activo"}'
```

**Listar instrumentos**
```sh
curl http://localhost:4000/instrumentos
```

**Reporte: alumnos por programa**
```sh
curl http://localhost:4000/reportes/alumnos-por-programa
```

---

## Ejemplo de respuesta

**GET /alumnos**
```json
[
  {
    "id_alumno": 1,
    "nombre": "Juan Pérez",
    "fecha_nacimiento": "2005-06-01",
    "genero": "M",
    "telefono_contacto": "04141234567",
    "id_programa": 1,
    "estado": "Activo",
    "programa_nombre": "Orquesta Juvenil"
  }
]
```

**GET /dashboard/stats**
```json
{
  "totalAlumnos": 120,
  "activos": 110,
  "nuevosHoy": 2,
  "personal": 5
}
```

---

## Errores comunes

- **400**: Datos faltantes o inválidos.
- **404**: Recurso no encontrado.
- **500**: Error interno del servidor.

---

## Notas técnicas

- Todas las rutas aceptan y devuelven datos en formato JSON.
- El backend utiliza promesas para las consultas a MySQL.
- Se recomienda agregar autenticación y validaciones en producción.

---
