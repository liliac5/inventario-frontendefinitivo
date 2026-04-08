# Inventario YAVIRAC

Sistema web para administrar los bienes de la institución, asignaciones de aulas y reportes de incidencias. Está pensado para que el personal pueda **registrar, consultar y dar seguimiento** a todo el inventario desde una sola plataforma, con un flujo claro y ordenado para cada área.

## ¿Qué hace el sistema?

- Registra y administra bienes (equipos, mobiliario, etc.).
- Asigna aulas a usuarios y controla esas asignaciones.
- Permite solicitudes de cambio y reportes de daños.
- Muestra historial de bienes y permite descargar actas en PDF.
- Tiene vistas distintas según el rol del usuario.

## ¿Cómo funciona en general?

1. El usuario inicia sesión con su **cédula**.
2. Según su rol, ve los módulos disponibles.
3. En cada módulo puede crear, editar, consultar o descargar información.
4. Las acciones quedan organizadas por módulo, para que cada rol vea solo lo que necesita.

## Módulos principales

### Login
Ingreso al sistema con cédula.

### Gestión de Usuarios (Admin)
Crear, editar y administrar usuarios con sus roles. Permite mantener al personal actualizado y con accesos correctos.

### Inventario (Admin/Coordinador)
Registrar y editar bienes con toda su información (códigos, categoría, estado, origen, ubicación y observaciones). Es el centro del sistema.

### Asignación de Aula (Admin/Coordinador)
Asignar aulas a usuarios y ver el historial de asignaciones. Facilita saber quién es responsable de cada aula.

### Solicitudes de Cambio (Admin/Coordinador)
Revisar solicitudes y aprobar o rechazar. Útil para cambios de aula o movimientos de bienes con control.

### Reportes (Admin/Coordinador)
Ver reportes de incidencias y dar seguimiento. Permite controlar daños, reparaciones y estados.

### Portal Docente
Registro de solicitudes por parte del docente. El docente puede reportar necesidades o cambios.

### Reportes Docente
Registro de reportes de daños y consulta del historial. Incluye acceso a las actas disponibles.

### Historial de Bienes
Listado completo del historial de bienes asignados, con información clave para auditoría y seguimiento.

## ¿Qué contiene cada módulo?

- **Inventario:** registro completo de bienes con datos técnicos y administrativos.
- **Asignación de Aula:** relación entre usuario y aula, con fecha y estado.
- **Solicitudes de Cambio:** solicitudes con estado y trazabilidad.
- **Reportes:** incidencias reportadas y su seguimiento.
- **Historial de Bienes:** registro consolidado de movimientos y asignaciones.

## Roles y permisos (resumen)

- **Admin:** acceso total.
- **Coordinador:** inventario, asignaciones, solicitudes, reportes e historial.
- **Docente:** portal docente, reportes y mi aula asignada.

## Notas

- Las actas PDF se descargan cuando el sistema las muestra disponibles.
- El contenido del acta depende de la configuración del sistema.

