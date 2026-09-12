# 📚 Sistema de Gestión Editorial - Revista Mundo FESC

Sistema web profesional para la gestión de envíos de artículos científicos de la **Revista Mundo FESC**, inspirado en Open Journal Systems (OJS) pero enfocado exclusivamente en el módulo de envíos con todas sus funcionalidades administrativas.

![FESC](https://via.placeholder.com/1200x300/e30513/ffffff?text=Revista+Mundo+FESC)

## 🎯 Descripción del Proyecto

Este sistema es un **prototipo standalone completamente funcional** diseñado para gestionar el ciclo completo de envío, revisión y publicación de artículos académicos. Incluye un sistema robusto de permisos por roles, workflow editorial completo, sistema de mensajería interna y notificaciones en tiempo real.

### ✨ Características Principales

- ✅ **Sistema de autenticación** con roles (Admin, Editor, Revisor, Autor)
- ✅ **Gestión completa de envíos** de artículos científicos
- ✅ **Workflow editorial** con estados: Nuevo → En revisión → Revisiones requeridas → Aceptado/Rechazado → Publicado
- ✅ **Sistema de permisos RBAC** (Role-Based Access Control) con protección de rutas
- ✅ **Carga de múltiples archivos** (manuscrito, figuras, tablas, datos suplementarios, etc.)
- ✅ **Mensajería interna** entre usuarios (con asociación a envíos)
- ✅ **Notificaciones en tiempo real** (polling cada 2 segundos)
- ✅ **Dashboard con estadísticas** y actividad reciente por rol
- ✅ **Multiidioma completo** (Español/Inglés) con i18n
- ✅ **Diseño responsive** y profesional (Mobile-first)
- ✅ **Gestión de perfiles** de usuario
- ✅ **Sistema de comentarios** en artículos (internos/revisión/autor)
- ✅ **Wizard de envío paso a paso** con guardado automático de borradores

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
```
- React 18.3+ con TypeScript 5.x
- React Router v7 (React Router DOM)
- Vite 6.x (Build tool)
```

#### Estilos y UI
```
- Tailwind CSS v4.0 (Framework de estilos)
- CSS Custom Properties (Variables de tema FESC)
- Lucide React (Librería de iconos)
- Diseño responsive con Mobile-First approach
```

#### Estado y Datos
```
- React Context API (Autenticación y estado global)
- LocalStorage (Persistencia de datos - Prototipo)
- Custom hooks para lógica reutilizable
```

#### Internacionalización
```
- Sistema i18n personalizado
- Soporte ES/EN con persistencia de preferencia
- Event-driven language switching
```

#### Arquitectura de Componentes
```
- Componentes funcionales con TypeScript
- Layout components por rol (Admin, Editor, Revisor, Autor)
- Protected Routes con RBAC
- Composition pattern para reutilización
```

#### Características del Código
```
- TypeScript strict mode
- ESLint + Prettier (Code quality)
- Modular architecture
- Separation of concerns (UI / Logic / Data)
```

### Estructura de Roles y Permisos

#### 👨‍💼 Administrador (Admin)
**Permisos completos - Acceso total al sistema**

- ✅ Ve **TODOS** los envíos del sistema
- ✅ Acceso completo a todas las secciones del menú:
  - Envíos (Nuevo envío, Todos los envíos, Números, DOI)
  - Ajustes (Revista, Sitio web, Flujo de trabajo, Distribución, Usuarios y roles)
  - Estadísticas (7 categorías completas)
  - Herramientas (Administración del sistema)
  - Comunicación (Mensajería)
  - Perfil
- ✅ Puede cambiar estados de artículos
- ✅ Asigna revisores y editores
- ✅ Ve todos los mensajes del sistema
- ✅ Dashboard con estadísticas globales
- ✅ Gestión completa de usuarios

**Credenciales de acceso:**
```
Email: admin@fesc.edu.co
Password: admin123
```

#### 📝 Editor
**Permisos editoriales - Gestión de contenido académico**

- ✅ Acceso a gestión editorial limitada:
  - Todos los envíos (vista y edición)
  - Estadísticas (Artículos y Revista únicamente)
  - Comunicación (Mensajería)
  - Perfil
- ✅ Puede revisar y editar envíos
- ✅ Asignación de revisores
- ✅ Gestión de comentarios editoriales
- ✅ Dashboard con métricas editoriales

**Credenciales de acceso:**
```
Email: editor@fesc.edu.co
Password: editor123
```

#### 🔍 Revisor
**Permisos de revisión - Solo artículos asignados**

- ✅ Ve solo artículos **ASIGNADOS A ÉL**
- ✅ Acceso limitado al menú:
  - Mis revisiones (Asignados a mí)
  - Comunicación (Mensajería)
  - Perfil
- ✅ Puede agregar revisiones y comentarios
- ✅ Ve mensajes relacionados con sus asignaciones
- ✅ Dashboard con artículos pendientes de revisión

**Credenciales de acceso:**
```
Email: revisor@fesc.edu.co
Password: revisor123
```

#### ✍️ Autor
**Permisos de autor - Solo envíos propios**

- ✅ Ve solo **SUS PROPIOS** envíos
- ✅ Acceso limitado al menú:
  - Mis artículos (Nuevo envío, Mis envíos)
  - Comunicación (Mensajería)
  - Perfil
- ✅ Wizard completo para enviar nuevos artículos
- ✅ Carga de múltiples archivos (manuscrito, figuras, tablas, etc.)
- ✅ Ve mensajes enviados/recibidos
- ✅ Puede comentar en sus artículos
- ✅ Dashboard personal con sus estadísticas

**Credenciales de acceso:**
```
Email: usuario@fesc.edu.co
Password: usuario123
```

> 💡 **Nota:** El sistema implementa protección de rutas (Protected Routes) que redirige automáticamente a los usuarios si intentan acceder a rutas no autorizadas para su rol.

---

## 📁 Estructura del Proyecto

```
revista-mundo-fesc/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── admin-layout.tsx          # Layout para administradores
│   │   │   ├── editor-layout.tsx         # Layout para editores
│   │   │   ├── revisor-layout.tsx        # Layout para revisores
│   │   │   ├── autor-layout.tsx          # Layout para autores
│   │   │   ├── protected-route.tsx       # HOC para protección de rutas
│   │   │   ├── auth-context.tsx          # Contexto de autenticación
│   │   │   ├── dashboard.tsx             # Dashboard de admin/editor
│   │   │   ├── dashboard-autor.tsx       # Dashboard de autores
│   │   │   ├── dashboard-revisor.tsx     # Dashboard de revisores
│   │   │   ├── login.tsx                 # Página de login
│   │   │   ├── register.tsx              # Página de registro
│   │   │   ├── profile.tsx               # Gestión de perfil
│   │   │   ├── mensajeria.tsx            # Sistema de mensajería
│   │   │   ├── submissions-management.tsx # Gestión de envíos
│   │   │   ├── submission-wizard-new.tsx # Wizard de nuevo envío (6 pasos)
│   │   │   ├── submission-detail-new.tsx # Detalle de artículo
│   │   │   ├── submission-success.tsx    # Página de éxito post-envío
│   │   │   ├── notification-center-new.tsx # Centro de notificaciones
│   │   │   ├── language-selector.tsx     # Selector de idioma ES/EN
│   │   │   └── ui/                       # Componentes UI reutilizables
│   │   ├── lib/
│   │   │   ├── storage.ts                # Servicio de almacenamiento
│   │   │   │                             # - Gestión de usuarios
│   │   │   │                             # - Gestión de envíos
│   │   │   │                             # - Gestión de mensajes
│   │   │   │                             # - Gestión de notificaciones
│   │   │   │                             # - Borradores de envíos
│   │   │   └── i18n.ts                   # Sistema de internacionalización
│   │   │                                 # - Traducciones ES/EN
│   │   │                                 # - Event-driven language switch
│   │   ├── routes.tsx                    # Configuración de rutas con RBAC
│   │   └── App.tsx                       # Componente raíz con AuthProvider
│   ├── styles/
│   │   ├── theme.css                     # Variables de tema (colores FESC)
│   │   └── fonts.css                     # Fuentes (Roboto + Calibri)
│   └── index.html
├── package.json
├── vite.config.ts                        # Configuración de Vite
├── tailwind.config.js                    # Configuración de Tailwind v4
├── tsconfig.json                         # Configuración de TypeScript
└── README.md
```

---

## 🎨 Diseño y Branding

### Paleta de Colores Institucionales FESC

```css
--fesc-red-primary: #e30513     /* Rojo principal */
--fesc-red-dark: #9c0f06        /* Rojo oscuro */
--fesc-red-wine: #630b00        /* Rojo vino */
--fesc-gray: #3c3c3b            /* Gris corporativo */
```

### Tipografía

- **Principal:** Roboto (títulos y UI)
- **Secundaria:** Calibri (texto de contenido)

### Principios de Diseño

✅ **Profesional y académico**
✅ **Limpio y minimalista**
✅ **Responsive (mobile-first)**
✅ **Accesible (WCAG 2.1)**
✅ **Colores institucionales en toda la interfaz**

---

## 🚀 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado:

```bash
Node.js >= 18.0.0 (recomendado 20.x)
npm >= 9.0.0 o pnpm >= 8.0.0 (recomendado pnpm)
Git >= 2.0
```

Verificar versiones:
```bash
node --version   # Debe mostrar v18.x.x o superior
npm --version    # Debe mostrar v9.x.x o superior
pnpm --version   # Debe mostrar v8.x.x o superior (si usas pnpm)
```

### Instalación Paso a Paso

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-org/revista-mundo-fesc.git
cd revista-mundo-fesc
```

#### 2. Instalar dependencias
```bash
# Con npm (puede tardar varios minutos)
npm install

# O con pnpm (más rápido, recomendado)
pnpm install
```

#### 3. Iniciar el servidor de desarrollo
```bash
# Con npm
npm run dev

# O con pnpm
pnpm dev
```

El sistema estará disponible en: **http://localhost:5173**

#### 4. Acceder al sistema
Abre tu navegador y ve a `http://localhost:5173`

Usa las credenciales de prueba:
- **Admin:** admin@fesc.edu.co / admin123
- **Editor:** editor@fesc.edu.co / editor123  
- **Revisor:** revisor@fesc.edu.co / revisor123
- **Autor:** usuario@fesc.edu.co / usuario123

### Build de Producción

```bash
# Generar build optimizado
npm run build
# o
pnpm build

# Los archivos optimizados se generarán en /dist

# Preview del build (opcional)
npm run preview
# o
pnpm preview
```

### Dependencias Principales

#### Core
- **React 18.3.1** - Biblioteca principal de UI
- **React Router 7.13.0** - Enrutamiento y navegación
- **TypeScript 5.x** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server

#### Estilos y UI
- **Tailwind CSS 4.1.12** - Framework de estilos utility-first
- **@tailwindcss/vite 4.1.12** - Plugin de Tailwind para Vite
- **Lucide React 0.487.0** - Iconos
- **class-variance-authority 0.7.1** - Gestión de variantes de clase
- **clsx 2.1.1** - Utilidad para clases condicionales
- **tailwind-merge 3.2.0** - Merge de clases Tailwind

#### Componentes UI (Radix UI)
- **@radix-ui/react-*** - Componentes accesibles headless:
  - dialog, dropdown-menu, popover, tooltip
  - accordion, tabs, select, checkbox, switch
  - avatar, progress, separator, slider
  - Y más...

#### Formularios y Validación
- **react-hook-form 7.55.0** - Gestión de formularios
- **date-fns 3.6.0** - Manipulación de fechas
- **react-day-picker 8.10.1** - Selector de fechas

#### Características Adicionales
- **motion 12.23.24** - Animaciones (Motion React)
- **recharts 2.15.2** - Gráficos y estadísticas
- **sonner 2.0.3** - Notificaciones toast
- **react-dnd 16.0.1** - Drag and drop
- **react-responsive-masonry 2.7.1** - Grids masonry
- **embla-carousel-react 8.6.0** - Carruseles

### Solución de Problemas

#### Error: "Cannot find module"
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
# o
pnpm install
```

#### Error: "Port 5173 is already in use"
```bash
# Cambiar el puerto en vite.config.ts o matar el proceso:
# En Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# En Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

#### Error de permisos en npm
```bash
# Usar pnpm en su lugar (recomendado)
# o ejecutar con permisos de administrador (no recomendado)
```

---

## 📚 Funcionalidades Detalladas

### 1. Sistema de Autenticación

- Login con email y contraseña
- Registro de nuevos usuarios (con validación de ORCID)
- Sesión persistente en localStorage
- Redirección automática según rol:
  - Admin → `/admin/dashboard`
  - Autor → `/autor/dashboard`
  - Revisor → `/revisor/dashboard`

### 2. Gestión de Envíos

#### Para Administradores
- Vista de **TODOS** los envíos del sistema
- Filtrado por estado (Nuevo, En revisión, Aceptado, etc.)
- Búsqueda por título, autor, ID
- Cambio de estados
- Asignación de revisores y editores
- Gestión de comentarios internos

#### Para Autores
- Vista de **solo sus envíos**
- **Wizard paso a paso** para crear nuevos artículos (6 pasos):
  1. **Inicio:** Idioma, título, sección, checklist de requisitos, consentimiento de privacidad
  2. **Detalles:** Título, palabras clave (hasta 10), resumen, referencias bibliográficas
  3. **Cargar archivos:** Sistema de carga múltiple con tipos:
     - Texto del artículo (manuscrito principal)
     - Figuras/Imágenes (JPG, PNG, TIFF)
     - Tablas suplementarias
     - Material suplementario (anexos, apéndices)
     - Conjunto de datos (Excel, CSV)
     - Declaraciones (conflictos de interés, permisos)
     - Cartas de presentación
     - Máx. 20 MB por archivo
  4. **Colaboradores:** Gestión de autores con autor corresponsal
  5. **Para editores:** Comentarios adicionales para el equipo editorial
  6. **Revisión:** Vista previa completa antes de enviar
- **Guardado automático de borradores** cada 2 segundos
- Seguimiento del estado de sus artículos
- Respuesta a comentarios de revisores

#### Para Revisores
- Vista de **solo artículos asignados**
- Interfaz de revisión con:
  - Descarga del manuscrito
  - Sistema de comentarios
  - Recomendación (Aceptar/Revisar/Rechazar)

### 3. Sistema de Mensajería

#### Funcionalidades
- ✅ Bandeja de entrada (recibidos)
- ✅ Bandeja de salida (enviados)
- ✅ Composer para nuevo mensaje
- ✅ Asociación de mensajes con envíos específicos
- ✅ Contador de mensajes no leídos
- ✅ Marcado automático como leído
- ✅ Búsqueda de mensajes
- ✅ Eliminación de mensajes

#### Permisos por Rol
- **Admin:** Ve TODOS los mensajes del sistema
- **Autor:** Ve solo mensajes enviados/recibidos por él
- **Revisor:** Ve solo mensajes relacionados con sus asignaciones

### 4. Sistema de Notificaciones

- Notificaciones en tiempo real (polling cada 2 segundos)
- Tipos de notificaciones:
  - ℹ️ Info (nuevos envíos)
  - ✅ Success (artículos aceptados)
  - ⚠️ Warning (revisiones requeridas)
  - 🚨 Danger (artículos rechazados)
- Centro de notificaciones con:
  - Contador de no leídas
  - Marcar como leídas
  - Eliminar notificaciones
  - Acceso directo al envío relacionado

### 5. Dashboard por Rol

#### Dashboard de Admin
- Estadísticas globales:
  - Total de envíos
  - Nuevos envíos
  - En revisión
  - Aceptados/Rechazados
  - Tasa de aceptación
- Gráficos de distribución por estado
- Actividad reciente del sistema
- Acceso rápido a acciones comunes

#### Dashboard de Autor
- Mis estadísticas personales
- Estado de mis artículos
- Notificaciones recientes
- Acceso rápido a "Nuevo Envío"

#### Dashboard de Revisor
- Artículos pendientes de revisión
- Mis revisiones completadas
- Próximos deadlines
- Notificaciones de nuevas asignaciones

### 6. Multiidioma

- Soporte para Español e Inglés
- Selector de idioma en el topbar
- Persistencia de preferencia en localStorage
- Traducciones para toda la interfaz
- Cambio en tiempo real sin recargar

### 7. Gestión de Perfil

- Edición de información personal:
  - Nombre y apellidos
  - Email
  - Afiliación institucional
  - País
  - ORCID
  - Contraseña
- Configuración de notificaciones
- Opción de registro como revisor

---

## 🔄 Workflow Editorial Completo

```
┌─────────────┐
│   NUEVO     │ ← Autor envía artículo
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ EN REVISIÓN │ ← Admin asigna revisor
└──────┬──────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌─────────────┐   ┌─────────────┐
│  ACEPTADO   │   │ REVISIONES  │
│             │   │ REQUERIDAS  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 ▼
       │          ┌─────────────┐
       │          │  RECHAZADO  │
       │          └─────────────┘
       │
       ▼
┌─────────────┐
│  PUBLICADO  │ ← Artículo final publicado
└─────────────┘
```

> 💡 **Nota:** Diagramas UML completos disponibles en `/diagrams/` (PlantUML y Mermaid)
> - Ver [Índice de Diagramas](/diagrams/INDEX.md) para todos los diagramas del proyecto
> - Ver [Guía de Generación](/diagrams/README.md) para crear imágenes

---

## 💾 Modelo de Datos

### User (Usuario)
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'reviewer' | 'author';  // 4 roles
  nombre: string;
  apellidos?: string;
  afiliacion?: string;
  pais?: string;
  orcid?: string;
  nombreUsuario: string;
  notificaciones?: boolean;
  revisor?: boolean;
}
```

### Submission (Envío)
```typescript
interface Submission {
  id: string;                    // SUB-YYYY-###
  titulo: string;
  resumen: string;
  palabrasClave: string[];
  seccion: string;
  idioma: string;
  autores: Author[];
  archivos: FileUpload[];        // Múltiples archivos
  estado: 'Nuevo' | 'En revisión' | 'Revisiones requeridas' | 
          'Aceptado' | 'Rechazado' | 'Publicado';
  fechaEnvio: string;
  autorId: string;
  autorNombre: string;
  editorAsignado?: string;
  comentarios: Comment[];
  borrador?: boolean;
  referencias?: string;
}

interface FileUpload {
  nombre: string;
  tamano: number;
  tipo: string;                  // Tipo de archivo (manuscrito, figura, tabla, etc.)
  fecha: string;
}

interface Author {
  nombre: string;
  apellidos: string;
  email: string;
  afiliacion: string;
  pais: string;
  esCorresponsal: boolean;
}
```

### Message (Mensaje)
```typescript
interface Message {
  id: string;
  asunto: string;
  contenido: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioNombre: string;
  fecha: string;
  leido: boolean;
  submissionId?: string;        // Asociación opcional con envío
}
```

### Notification (Notificación)
```typescript
interface Notification {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'danger';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  submissionId?: string;
}
```

---

## 🔐 Seguridad y Consideraciones

### Almacenamiento Actual
- ⚠️ **LocalStorage** (solo para prototipo)
- ⚠️ Contraseñas sin hash (NO usar en producción)
- ⚠️ Sin JWT ni tokens de sesión

### Recomendaciones para Producción

```typescript
// Backend recomendado
- Node.js + Express
- Base de datos: PostgreSQL / MySQL
- ORM: Prisma / TypeORM
- Auth: JWT + bcrypt para passwords
- Validación: Zod / Yup
- File storage: AWS S3 / MinIO
```

### Migración a Backend

El proyecto está diseñado para facilitar la migración:
1. Toda la lógica de negocio está en `/src/app/lib/storage.ts`
2. Simplemente reemplazar las llamadas de `storage.*` por llamadas a API
3. Implementar endpoints REST en backend:
   ```
   POST   /api/auth/login
   POST   /api/auth/register
   GET    /api/submissions
   POST   /api/submissions
   GET    /api/submissions/:id
   PUT    /api/submissions/:id
   DELETE /api/submissions/:id
   GET    /api/messages
   POST   /api/messages
   GET    /api/notifications
   ...
   ```

---

## 🌐 Rutas del Sistema

### Rutas Públicas
```
/login                  - Inicio de sesión
/register              - Registro de usuarios
```

### Rutas de Admin
```
/admin                              - Redirige a /admin/dashboard
/admin/dashboard                    - Dashboard principal con estadísticas
/admin/submissions                  - Gestión de todos los envíos
/admin/submissions/:id              - Detalle de envío específico
/admin/new-submission               - Crear nuevo envío
/admin/mensajeria                   - Sistema de mensajería
/admin/profile                      - Perfil de administrador

Protegidas con allowedRoles: ['admin']
```

### Rutas de Editor
```
/editor                             - Redirige a /editor/dashboard
/editor/dashboard                   - Dashboard editorial
/editor/submissions                 - Gestión de envíos
/editor/submissions/:id             - Detalle de envío
/editor/statistics/articulos        - Estadísticas de artículos
/editor/statistics/revista          - Estadísticas de revista
/editor/mensajeria                  - Sistema de mensajería
/editor/profile                     - Perfil de editor

Protegidas con allowedRoles: ['editor']
```

### Rutas de Autor
```
/autor                              - Redirige a /autor/dashboard
/autor/dashboard                    - Mis envíos
/autor/envios                       - Alias de dashboard
/autor/envios/:id                   - Detalle de mi envío
/autor/new-submission               - Wizard de nuevo artículo (6 pasos)
/autor/submission-detail/:id        - Detalle completo de artículo
/autor/mensajeria                   - Mensajes
/autor/profile                      - Mi perfil

Protegidas con allowedRoles: ['author']
```

### Rutas de Revisor
```
/revisor                            - Redirige a /revisor/dashboard
/revisor/dashboard                  - Artículos asignados
/revisor/asignados                  - Alias de dashboard
/revisor/asignados/:id              - Revisar artículo específico
/revisor/mensajeria                 - Mensajes
/revisor/profile                    - Mi perfil

Protegidas con allowedRoles: ['reviewer']
```

> 🔒 **Protección de Rutas:** Todas las rutas están protegidas con el componente `ProtectedRoute` que verifica el rol del usuario. Si un usuario intenta acceder a una ruta no autorizada, es redirigido automáticamente a su dashboard correspondiente.

---

## 📊 Datos de Prueba Precargados

El sistema incluye datos de ejemplo para facilitar las pruebas:

### Usuarios (4 roles)
```typescript
1. Administrador:
   - Email: admin@fesc.edu.co
   - Password: admin123
   - Nombre: Administrador FESC

2. Editor:
   - Email: editor@fesc.edu.co
   - Password: editor123
   - Nombre: Laura Jiménez Pérez

3. Revisor:
   - Email: revisor@fesc.edu.co
   - Password: revisor123
   - Nombre: Carlos Rodríguez Martínez

4. Autor:
   - Email: usuario@fesc.edu.co
   - Password: usuario123
   - Nombre: Juan Pérez García
```

### Envíos
- 2 artículos de ejemplo con diferentes estados
- Incluyen autores, archivos, comentarios y referencias

### Mensajes
- 3 conversaciones de ejemplo entre roles
- Mensajes asociados a envíos específicos
- Estado de lectura configurado

### Notificaciones
- Notificaciones de prueba para cada rol
- Diferentes tipos (info, success, warning, danger)
- Algunas leídas y otras sin leer

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build
npm run lint             # Linter (si está configurado)

# Utilidades
npm run clean            # Limpiar build y dependencias
```

---

## 🎯 Roadmap y Mejoras Futuras

### v2.0 - Backend Integration
- [ ] Migrar a backend Node.js + Express
- [ ] Base de datos PostgreSQL con Prisma
- [ ] Autenticación con JWT
- [ ] Encriptación de contraseñas con bcrypt
- [ ] Upload real de archivos (AWS S3)

### v2.1 - Características Avanzadas
- [ ] Sistema de revisión por pares doble ciego
- [ ] Editor de texto enriquecido para artículos
- [ ] Exportación a PDF de artículos
- [ ] Sistema de DOI para artículos publicados
- [ ] Métricas y analytics avanzados

### v2.2 - Optimizaciones
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Paginación y lazy loading
- [ ] Búsqueda avanzada con filtros
- [ ] Exportación de reportes (Excel, CSV)
- [ ] Internacionalización completa (más idiomas)

### v3.0 - Módulos Adicionales
- [ ] Gestión de volúmenes y números
- [ ] Sistema de suscriptores
- [ ] Indexación y metadatos (OAI-PMH)
- [ ] Integración con ORCID API
- [ ] Sistema de copias de seguridad automatizado

---

## 🎓 Tecnologías y Decisiones Técnicas

### ¿Por qué React + TypeScript?
- **React:** Biblioteca líder de la industria para construir interfaces de usuario
- **TypeScript:** Seguridad de tipos en tiempo de desarrollo, reduce bugs en producción
- **Combinación:** Código más mantenible, autocompletado inteligente, refactoring seguro

### ¿Por qué Vite en lugar de Create React App?
- **Velocidad:** Dev server hasta 10-20x más rápido
- **Build moderno:** ESBuild en lugar de Webpack
- **HMR instantáneo:** Hot Module Replacement sin recargar la página
- **Tamaño:** Bundles más pequeños y optimizados

### ¿Por qué Tailwind CSS?
- **Utility-first:** Escribir estilos sin salir del JSX
- **Consistencia:** Sistema de diseño incorporado (spacing, colors, typography)
- **Performance:** CSS optimizado automáticamente (purge de clases no usadas)
- **Developer Experience:** Autocompletado con IntelliSense

### ¿Por qué React Router v7?
- **Estándar de la industria:** Routing más usado en React
- **Type-safe:** Rutas tipadas con TypeScript
- **Nested routing:** Layouts anidados perfectos para nuestra arquitectura
- **Data loading:** Preparado para futura migración a Remix/React Router Data

### ¿Por qué LocalStorage en lugar de Backend?
**Prototipo Standalone:**
- ✅ Sin dependencias de servidor
- ✅ Fácil de demostrar y testear
- ✅ Datos persisten entre sesiones
- ✅ No requiere configuración
- ⚠️ **NO usar en producción** (solo para prototipo/demo)

**Migración a Backend:**
El código está diseñado para migración fácil:
1. Todo el acceso a datos está centralizado en `storage.ts`
2. Reemplazar llamadas de `storage.*` por llamadas a API REST
3. Implementar backend (Node.js + Express + PostgreSQL)
4. Agregar JWT para autenticación
5. Implementar subida real de archivos a S3/MinIO

### Arquitectura de Componentes

**Patrón de Layout Components:**
```
AdminLayout
├── EditorLayout
├── RevisorLayout  
└── AutorLayout
```

Cada layout incluye:
- Sidebar con navegación filtrada por permisos
- Topbar con notificaciones, selector de idioma, perfil
- Área de contenido (children)
- Footer con información de sesión

**Protected Routes Pattern:**
```typescript
<ProtectedRoute allowedRoles={['admin', 'editor']}>
  <AdminLayout>
    <Dashboard />
  </AdminLayout>
</ProtectedRoute>
```

### Sistema de Permisos (RBAC)

**Niveles de Control:**
1. **Route Level:** `ProtectedRoute` verifica rol antes de renderizar
2. **UI Level:** Componentes muestran/ocultan según permisos
3. **Data Level:** `storage.ts` filtra datos según usuario autenticado

**Jerarquía de Permisos:**
```
Admin > Editor > Revisor > Autor
```

### Internacionalización (i18n)

**Implementación:**
- Sistema custom liviano (<10KB)
- Event-driven: Cambios de idioma actualizan toda la UI automáticamente
- Persistencia en localStorage
- 100+ keys traducidas

**Agregar nuevos idiomas:**
1. Agregar type a Language: `'es' | 'en' | 'pt'`
2. Agregar traducciones en `translations` object
3. Actualizar LanguageSelector para mostrar nuevo idioma

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo
- Usar TypeScript estricto
- Seguir convenciones de React Hooks
- Componentes funcionales únicamente
- Nombres de archivos en kebab-case
- Componentes en PascalCase
- Variables y funciones en camelCase

---

## 📄 Licencia

Este proyecto es propiedad de **Fundación de Estudios Superiores Comfanorte (FESC)** y está destinado para uso interno y académico.

---

## 👥 Equipo de Desarrollo

**Desarrollado para Revista Mundo FESC**

- Sistema diseñado y desarrollado por el equipo de desarrollo de FESC
- Diseño basado en los lineamientos institucionales de FESC
- Inspirado en Open Journal Systems (OJS)

---

## 📞 Soporte y Contacto

Para soporte técnico o consultas:

- **Email:** soporte@fesc.edu.co
- **Website:** https://www.fesc.edu.co
- **Revista:** https://revistamundofesc.fesc.edu.co (ejemplo)

---

## 🙏 Agradecimientos

- Open Journal Systems (OJS) por la inspiración del workflow editorial
- Lucide React por los iconos
- Tailwind CSS por el framework de estilos
- React Router por el sistema de navegación

---

## 📝 Changelog

### v1.1.0 (Mayo 2026)
- ✅ **Nuevo rol de Editor** con permisos editoriales específicos
- ✅ **Sistema de carga múltiple de archivos** (manuscrito, figuras, tablas, datos, etc.)
- ✅ **Protected Routes con RBAC** - Protección automática de rutas por rol
- ✅ **Sistema i18n completo** - Todos los layouts traducidos ES/EN
- ✅ **Editor Layout** con menú limitado a funciones editoriales
- ✅ **Wizard de envío mejorado** - 6 pasos con tipos de archivo detallados
- ✅ Correcciones en navegación y redirecciones automáticas
- ✅ 4 layouts completamente estandarizados y traducidos

### v1.0.0 (Abril 2026)
- ✅ Sistema completo de autenticación y autorización
- ✅ Gestión de envíos con workflow editorial
- ✅ Sistema de mensajería interna
- ✅ Notificaciones en tiempo real
- ✅ Dashboard diferenciado por roles
- ✅ Multiidioma (ES/EN)
- ✅ Diseño responsive con colores institucionales
- ✅ 3 layouts iniciales (Admin, Autor, Revisor)

---

## 📊 Métricas del Proyecto

### Líneas de Código
```
Total aproximado: ~15,000 líneas
- TypeScript/TSX: ~12,000 líneas
- CSS: ~500 líneas
- Configuración: ~200 líneas
```

### Componentes
```
- 20+ componentes principales
- 4 layouts diferenciados por rol
- 10+ componentes reutilizables
- Sistema de rutas con 30+ rutas
```

### Características Técnicas
```
- 100% TypeScript (type-safe)
- 100% componentes funcionales (React Hooks)
- 4 roles con permisos granulares
- Sistema i18n con 100+ keys
- Responsive design (mobile-first)
- Guardado automático de borradores
- Sistema de notificaciones en tiempo real
```

### Datos de Prueba
```
- 4 usuarios predefinidos (1 por rol)
- 2 artículos de ejemplo
- 3 conversaciones de mensajes
- 6+ notificaciones de prueba
```

---

## 📖 Para Documentación Técnica

### Resumen Ejecutivo

**Nombre del Proyecto:** Sistema de Gestión Editorial - Revista Mundo FESC

**Tipo:** Aplicación Web SPA (Single Page Application)

**Propósito:** Gestionar el ciclo completo de envío, revisión y publicación de artículos científicos académicos para la Revista Mundo FESC de la Fundación de Estudios Superiores Comfanorte.

**Inspiración:** Open Journal Systems (OJS) - enfocado exclusivamente en el módulo de envíos con todas sus funcionalidades administrativas.

**Estado:** Prototipo funcional standalone (v1.1.0)

### Stack Tecnológico Completo

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Frontend Framework** | React | 18.3.1 | Biblioteca de UI |
| **Lenguaje** | TypeScript | 5.x | Tipado estático |
| **Build Tool** | Vite | 6.3.5 | Dev server y bundling |
| **Routing** | React Router | 7.13.0 | Navegación SPA |
| **Styling** | Tailwind CSS | 4.1.12 | Framework de estilos |
| **Icons** | Lucide React | 0.487.0 | Iconografía |
| **State Management** | React Context API | - | Estado global |
| **Forms** | react-hook-form | 7.55.0 | Gestión de formularios |
| **Charts** | Recharts | 2.15.2 | Visualización de datos |
| **Animations** | Motion React | 12.23.24 | Animaciones |
| **Date Handling** | date-fns | 3.6.0 | Manipulación de fechas |
| **Notifications** | Sonner | 2.0.3 | Toasts/Notificaciones |
| **UI Components** | Radix UI | Multiple | Componentes accesibles |
| **Storage** | LocalStorage | Browser API | Persistencia (prototipo) |

### Características Implementadas

✅ **Autenticación y Autorización**
- Login/Logout con persistencia de sesión
- 4 roles: Admin, Editor, Revisor, Autor
- Sistema RBAC (Role-Based Access Control)
- Protected Routes automáticas

✅ **Gestión de Envíos**
- Wizard de 6 pasos para nuevos artículos
- Carga múltiple de archivos (hasta 20 MB c/u)
- Estados: Nuevo, En revisión, Revisiones req., Aceptado, Rechazado, Publicado
- Sistema de comentarios tripartito (internos, revisión, autor)
- Guardado automático de borradores

✅ **Sistema de Mensajería**
- Bandeja de entrada/salida
- Asociación de mensajes con envíos
- Notificaciones de mensajes no leídos
- Filtrado por rol

✅ **Notificaciones en Tiempo Real**
- Polling cada 2 segundos
- 4 tipos (info, success, warning, danger)
- Centro de notificaciones
- Contador de no leídas

✅ **Dashboard por Rol**
- Estadísticas personalizadas por rol
- Gráficos de distribución
- Actividad reciente
- Accesos rápidos

✅ **Multiidioma**
- Español e Inglés
- Sistema i18n custom
- Cambio en tiempo real
- Persistencia de preferencia

✅ **Diseño Responsive**
- Mobile-first approach
- Sidebar colapsable en móvil
- Optimizado para tablets
- Desktop layout completo

### Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Admin UI │  │Editor UI │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │Revisor UI│  │Autor UI  │            │
│  └──────────┘  └──────────┘            │
├─────────────────────────────────────────┤
│       React Router (Routing)            │
├─────────────────────────────────────────┤
│      Context API (Auth State)           │
├─────────────────────────────────────────┤
│      LocalStorage (Data Layer)          │
│      [Future: REST API Backend]         │
└─────────────────────────────────────────┘
```

---

**© 2026 Fundación de Estudios Superiores Comfanorte (FESC)**

**Revista Mundo FESC** - Sistema de Gestión Editorial

*Desarrollado con ❤️ para la comunidad académica de FESC*# prueba1
