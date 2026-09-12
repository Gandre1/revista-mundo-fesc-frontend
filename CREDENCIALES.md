# CREDENCIALES DEL SISTEMA

## Sistema de Gestión Editorial - Revista Mundo FESC

### Accesos de Prueba

#### Administrador
- **Usuario:** admin@fesc.edu.co
- **Contraseña:** admin123
- **Rol:** Administrador del sistema
- **Permisos:** Acceso completo al dashboard, gestión de envíos, asignación de editores, métricas

#### Autor
- **Usuario:** usuario@fesc.edu.co  
- **Contraseña:** usuario123
- **Rol:** Autor
- **Permisos:** Crear y enviar artículos

#### Revisor
- **Usuario:** revisor@fesc.edu.co
- **Contraseña:** revisor123
- **Rol:** Revisor/Editor
- **Permisos:** Revisar artículos asignados

---

## Funcionalidades PRO Implementadas

### 1. Dashboard Ejecutivo
- Métricas en tiempo real (total envíos, en revisión, aceptados, rechazados)
- Gráficos de envíos mensuales
- Tasa de aceptación automática
- Tiempo promedio de revisión
- Estadísticas de autores activos y revisores

### 2. Sistema de Autenticación Real
- Login funcional con validación de credenciales
- Sesiones persistentes con localStorage
- Roles diferenciados (admin, autor, revisor)
- Logout y gestión de sesión

### 3. Centro de Notificaciones
- Notificaciones en tiempo real
- Badge con contador de no leídas
- Diferentes tipos (envío nuevo, advertencias, info)
- Marcar como leída / eliminar
- Panel desplegable elegante

### 4. Gestión Avanzada de Envíos
- Búsqueda en tiempo real por título, número o autor
- Filtros múltiples (estado, sección)
- Tabs organizados (Todos, Mi lista, Sin asignar, Archivado)
- Asignación de editores
- Exportación de datos
- Eliminación de envíos
- Menú contextual por envío

### 5. Workflow Completo
- Wizard de envío por pasos con validación
- Guardado de borradores
- Timeline de estados
- Historial de cambios
- Comentarios internos

### 6. Interfaz Estilo OJS
- Diseño profesional inspirado en Open Journal Systems
- Header institucional con ISSN
- Navegación contextual
- Colores corporativos FESC
- Tipografía Roboto + Calibri

### 7. Métricas y Reportes
- Contadores en vivo
- Gráficos de barras interactivos
- Indicadores de progreso
- Alertas de envíos sin asignar
- KPIs editoriales

---

## Tecnología

- **Frontend:** React + TypeScript
- **Routing:** React Router v7
- **Estilos:** Tailwind CSS v4
- **Iconos:** Lucide React
- **Estado:** Context API
- **Persistencia:** localStorage

---

## Notas

- Este es un prototipo funcional standalone
- Los datos son mock pero realistas
- El sistema es completamente navegable
- Todas las interacciones funcionan
- Preparado para integración con backend real
