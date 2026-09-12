# 📋 Historial de Cambios - Revista Mundo FESC

Todos los cambios importantes del proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-04-16

### 🎉 Lanzamiento Inicial

Primera versión completa y funcional del Sistema de Gestión Editorial de Revista Mundo FESC.

### ✨ Características Agregadas

#### Sistema de Autenticación y Autorización
- Sistema de login con email y contraseña
- Registro de nuevos usuarios con validación
- Sesión persistente con localStorage
- Redirección automática según rol
- Logout con limpieza de sesión
- Soporte para ORCID en registro

#### Gestión de Usuarios por Roles
- **Rol Administrador:**
  - Vista completa de TODOS los envíos
  - Dashboard con estadísticas globales
  - Gestión completa de artículos
  - Asignación de revisores y editores
  - Acceso a todos los mensajes del sistema
  
- **Rol Autor:**
  - Vista solo de SUS envíos
  - Dashboard personal con sus estadísticas
  - Wizard de envío de artículos (4 pasos)
  - Mensajes enviados/recibidos
  - Seguimiento del estado de artículos
  
- **Rol Revisor:**
  - Vista solo de artículos ASIGNADOS
  - Dashboard con revisiones pendientes
  - Sistema de comentarios de revisión
  - Mensajes relacionados con asignaciones

#### Gestión Completa de Envíos
- Wizard de envío paso a paso:
  1. Información básica (título, resumen, palabras clave)
  2. Autores y contribuidores (con ORCID)
  3. Archivos del manuscrito
  4. Revisión y confirmación
- Estados del artículo:
  - Nuevo
  - En revisión
  - Revisiones requeridas
  - Aceptado
  - Rechazado
  - Publicado
- Sistema de ID único: `SUB-YYYY-###`
- Filtrado y búsqueda de envíos
- Gestión de comentarios (interno/revisión/autor)
- Sistema de borradores (auto-guardado)

#### Sistema de Mensajería Interna
- Bandeja de entrada (recibidos)
- Bandeja de salida (enviados)
- Composer para nuevos mensajes
- Selección de destinatario desde lista de usuarios
- Asociación de mensajes con envíos específicos
- Contador de mensajes no leídos
- Marcado automático como leído al abrir
- Búsqueda en mensajes
- Eliminación de mensajes
- Vista detallada de cada mensaje
- Actualización en tiempo real (polling cada 2 segundos)
- Permisos diferenciados por rol:
  - Admin: todos los mensajes
  - Autor: sus mensajes
  - Revisor: mensajes de asignaciones

#### Sistema de Notificaciones
- Notificaciones en tiempo real (polling 2s)
- Tipos: info, success, warning, danger
- Centro de notificaciones con:
  - Contador de no leídas
  - Lista completa de notificaciones
  - Marcar como leída/eliminar
  - Enlace directo al envío relacionado
- Notificaciones automáticas para:
  - Nuevos envíos
  - Cambios de estado
  - Nuevos comentarios
  - Asignaciones de revisión

#### Dashboard por Rol
- **Admin Dashboard:**
  - Estadísticas globales del sistema
  - Total de envíos
  - Distribución por estado
  - Tasa de aceptación
  - Tiempo promedio de revisión
  - Actividad reciente
  - Gráficos visuales
  
- **Autor Dashboard:**
  - Mis artículos (lista completa)
  - Estado de cada envío
  - Filtros por estado
  - Acceso rápido a nuevo envío
  - Notificaciones recientes
  
- **Revisor Dashboard:**
  - Artículos asignados
  - Pendientes de revisión
  - Revisiones completadas
  - Próximos deadlines

#### Internacionalización (i18n)
- Soporte para Español e Inglés
- Selector de idioma en topbar (🌐)
- Más de 50 traducciones implementadas
- Persistencia de preferencia en localStorage
- Cambio en tiempo real sin recargar página
- Sistema extensible para más idiomas

#### Diseño y UI/UX
- Colores institucionales FESC:
  - Rojo principal: #e30513
  - Rojo oscuro: #9c0f06
  - Rojo vino: #630b00
  - Gris corporativo: #3c3c3b
- Tipografía: Roboto + Calibri
- 3 layouts completamente estandarizados:
  - AdminLayout
  - AutorLayout
  - RevisorLayout
- Diseño responsive (mobile-first)
- Sidebar con navegación contextual
- Topbar con notificaciones y perfil
- Componentes UI reutilizables
- Iconos con Lucide React
- Estados hover y transiciones suaves

#### Gestión de Perfiles
- Edición de información personal:
  - Nombre y apellidos
  - Email (único)
  - Afiliación institucional
  - País
  - ORCID
  - Contraseña
  - Nombre de usuario
- Configuración de notificaciones
- Opción de registro como revisor
- Avatar con iniciales

#### Sistema de Almacenamiento
- LocalStorage para prototipo standalone
- Servicio centralizado (StorageService)
- Datos de ejemplo precargados:
  - 3 usuarios (admin, autor, revisor)
  - 2 envíos de ejemplo
  - 3 mensajes de ejemplo
  - Notificaciones de prueba
- Métodos para CRUD completo
- Generación automática de IDs
- Gestión de estadísticas

### 🎨 Componentes Creados

#### Layouts
- `admin-layout.tsx` - Layout para administradores
- `autor-layout.tsx` - Layout para autores
- `revisor-layout.tsx` - Layout para revisores

#### Páginas Principales
- `login.tsx` - Inicio de sesión
- `register.tsx` - Registro de usuarios
- `dashboard.tsx` - Dashboard de admin
- `dashboard-autor.tsx` - Dashboard de autores
- `dashboard-revisor.tsx` - Dashboard de revisores

#### Gestión de Envíos
- `submission-wizard-new.tsx` - Wizard de envío (4 pasos)
- `submission-detail-new.tsx` - Detalle de artículo
- `submissions-management.tsx` - Gestión de envíos (admin)
- `submission-success.tsx` - Confirmación de envío

#### Mensajería y Notificaciones
- `mensajeria.tsx` - Sistema completo de mensajería
- `notification-center-new.tsx` - Centro de notificaciones

#### Utilidades
- `profile.tsx` - Gestión de perfil
- `language-selector.tsx` - Selector de idioma
- `auth-context.tsx` - Contexto de autenticación
- `toast.tsx` - Sistema de notificaciones toast

#### Servicios
- `storage.ts` - Servicio de almacenamiento
- `i18n.ts` - Sistema de internacionalización

### 🔧 Configuración Técnica
- React 18 con TypeScript
- React Router v7 (Data Mode)
- Tailwind CSS v4
- Vite como bundler
- Lucide React para iconos
- Context API para estado global
- LocalStorage para persistencia

### 📝 Documentación
- `README.md` - Documentación principal completa
- `TECHNICAL_GUIDE.md` - Guía técnica detallada
- `QUICK_START.md` - Guía rápida de inicio
- `CHANGELOG.md` - Este archivo

### 🔐 Seguridad
- Sistema de roles y permisos
- Validación de formularios
- Protección de rutas por rol
- Sesión persistente segura
- ⚠️ Nota: Solo para desarrollo (localStorage, sin hash)

### 🌐 Rutas Implementadas

#### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro

#### Admin
- `/admin/dashboard` - Dashboard
- `/admin/submissions` - Gestión de envíos
- `/admin/submissions/:id` - Detalle de envío
- `/admin/mensajeria` - Mensajería
- `/admin/profile` - Perfil
- `/admin/new-submission` - Nuevo envío

#### Autor
- `/autor/dashboard` - Mis envíos
- `/autor/new-submission` - Nuevo artículo
- `/autor/submission-detail/:id` - Detalle de artículo
- `/autor/mensajeria` - Mensajes
- `/autor/profile` - Mi perfil

#### Revisor
- `/revisor/dashboard` - Artículos asignados
- `/revisor/asignados/:id` - Revisar artículo
- `/revisor/mensajeria` - Mensajes
- `/revisor/profile` - Mi perfil

### 🐛 Correcciones
- Sistema de permisos completamente funcional
- Filtrado correcto por rol en todos los componentes
- Estandarización visual de los 3 layouts
- Persistencia de idioma en localStorage
- Actualización automática al cambiar idioma

### 📊 Estadísticas del Proyecto
- **Componentes:** 20+
- **Rutas:** 18
- **Traducciones:** 50+
- **Líneas de código:** ~8,000
- **Archivos TypeScript:** 25+

---

## [Planeado] - v2.0.0

### 🔮 Características Futuras

#### Backend Integration
- [ ] Migración a Node.js + Express
- [ ] Base de datos PostgreSQL con Prisma
- [ ] API RESTful completa
- [ ] Autenticación JWT
- [ ] Encriptación bcrypt para passwords
- [ ] Upload real de archivos (AWS S3 / MinIO)
- [ ] WebSockets para notificaciones en tiempo real

#### Mejoras del Sistema
- [ ] Sistema de revisión doble ciego
- [ ] Editor de texto enriquecido (WYSIWYG)
- [ ] Exportación a PDF de artículos
- [ ] Sistema de DOI para publicados
- [ ] Métricas y analytics avanzados
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] Paginación server-side
- [ ] Rate limiting y seguridad

#### Nuevas Funcionalidades
- [ ] Gestión de volúmenes y números
- [ ] Sistema de suscriptores
- [ ] Indexación y metadatos (OAI-PMH)
- [ ] Integración con ORCID API
- [ ] Sistema de copias de seguridad
- [ ] Exportación de reportes (Excel, CSV)
- [ ] Templates de emails personalizados
- [ ] Panel de administración avanzado

#### Optimizaciones
- [ ] Code splitting
- [ ] Virtual scrolling para listas grandes
- [ ] Lazy loading de componentes
- [ ] Service Workers (PWA)
- [ ] Optimización de imágenes
- [ ] CDN para assets estáticos
- [ ] Compresión GZIP

#### Testing
- [ ] Tests unitarios con Vitest
- [ ] Tests de integración
- [ ] Tests E2E con Playwright
- [ ] Cobertura de código >80%
- [ ] CI/CD pipeline

#### Internacionalización
- [ ] Soporte para más idiomas:
  - Francés
  - Portugués
  - Alemán
  - Italiano
- [ ] Detección automática de idioma
- [ ] Traducciones profesionales

---

## Tipos de Cambios

- **✨ Agregado** - Para nuevas características
- **🔄 Cambiado** - Para cambios en funcionalidad existente
- **⚠️ Deprecado** - Para características que serán removidas
- **❌ Removido** - Para características removidas
- **🐛 Corregido** - Para corrección de bugs
- **🔐 Seguridad** - Para vulnerabilidades corregidas

---

## Versionado

Este proyecto usa [Versionado Semántico](https://semver.org/lang/es/):

- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nueva funcionalidad compatible
- **PATCH** (0.0.X): Correcciones de bugs

---

**© 2026 Fundación de Estudios Superiores Comfanorte (FESC)**
