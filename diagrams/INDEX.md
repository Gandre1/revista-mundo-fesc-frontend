# 📑 Índice de Diagramas UML - Sistema FESC

## 📊 Catálogo Completo de Diagramas

---

## 1. Workflow Editorial

**Archivos:**
- `/diagrams/01-workflow-editorial.puml`
- `/diagrams/mermaid/01-workflow-editorial.mmd`

**Tipo:** Diagrama de Estados (State Diagram)

**Descripción:**
Muestra el ciclo de vida completo de un artículo desde que es enviado hasta que se publica o rechaza. Incluye todos los estados posibles y las transiciones entre ellos.

**Estados incluidos:**
- Nuevo (inicial)
- En revisión
- Revisiones requeridas
- Aceptado
- Rechazado
- Publicado (final)

**Roles involucrados:**
- Autor (envía y corrige)
- Administrador (asigna y publica)
- Revisor (evalúa)

**Uso recomendado:**
- Presentaciones para explicar el proceso editorial
- Documentación para autores
- Manual de usuario

**Vista previa:**
```
[Nuevo] → [En Revisión] → [Aceptado] → [Publicado]
                    ↓
            [Revisiones Requeridas] → [En Revisión]
                    ↓
            [Rechazado]
```

---

## 2. Arquitectura del Sistema

**Archivos:**
- `/diagrams/02-arquitectura-sistema.puml`
- `/diagrams/mermaid/02-arquitectura-sistema.mmd`

**Tipo:** Diagrama de Componentes (Component Diagram)

**Descripción:**
Arquitectura completa del sistema frontend mostrando todos los componentes React, servicios, contextos y capas de datos.

**Componentes principales:**
- App Layer (RouterProvider, routes)
- Layouts (AdminLayout, AutorLayout, RevisorLayout)
- Pages (Dashboards, Gestión, Mensajería)
- Shared Components (Wizard, Notifications, Language)
- Context & State (AuthContext, SubmissionContext)
- Services (StorageService, i18nService)
- Data Layer (localStorage)

**Uso recomendado:**
- Documentación técnica
- Onboarding de desarrolladores
- Presentaciones arquitectónicas

---

## 3. Casos de Uso

**Archivos:**
- `/diagrams/03-casos-de-uso.puml`
- `/diagrams/mermaid/03-casos-de-uso.mmd`

**Tipo:** Diagrama de Casos de Uso (Use Case Diagram)

**Descripción:**
Todos los casos de uso del sistema organizados por módulos y con relación a cada rol de usuario.

**Módulos incluidos:**
- Autenticación (Login, Register, Logout, Perfil)
- Gestión de Envíos (Enviar, Ver, Editar, Asignar, Revisar)
- Comunicación (Mensajes, Comentarios)
- Notificaciones (Recibir, Leer, Marcar)
- Estadísticas (Dashboards, Reportes)
- Configuración (Idioma, Preferencias)

**Actores:**
- Autor (17 casos de uso)
- Administrador (18 casos de uso)
- Revisor (14 casos de uso)

**Uso recomendado:**
- Análisis de requisitos
- Documentación funcional
- Testing (base para casos de prueba)

---

## 4. Secuencia - Envío de Artículo

**Archivos:**
- `/diagrams/04-secuencia-envio-articulo.puml`
- `/diagrams/mermaid/04-secuencia-envio-articulo.mmd`

**Tipo:** Diagrama de Secuencia (Sequence Diagram)

**Descripción:**
Flujo detallado paso a paso del proceso de envío de un artículo por parte de un autor, desde la autenticación hasta la notificación al administrador.

**Pasos del flujo:**
1. Autenticación del usuario
2. Paso 1: Información básica (título, resumen, palabras clave)
3. Paso 2: Autores (corresponsal, coautores, ORCID)
4. Paso 3: Archivos (upload de manuscrito)
5. Paso 4: Revisión y confirmación
6. Envío final (generación de ID, guardado)
7. Notificación al administrador

**Componentes interactuando:**
- Autor (usuario)
- SubmissionWizard (UI)
- AuthContext (autenticación)
- StorageService (lógica de negocio)
- localStorage (persistencia)
- NotificationCenter (notificaciones)
- Administrador (receptor notificación)

**Uso recomendado:**
- Documentación de procesos
- Desarrollo de features
- Debugging de flujos

---

## 5. Modelo de Datos

**Archivos:**
- `/diagrams/05-modelo-datos.puml`
- `/diagrams/mermaid/05-modelo-datos.mmd`

**Tipo:** Diagrama de Clases (Class Diagram)

**Descripción:**
Estructura completa de datos del sistema mostrando todas las entidades, sus atributos y relaciones.

**Entidades principales:**

1. **User** (Usuario)
   - Atributos: id, email, password, role, nombre, apellidos, afiliacion, pais, orcid, etc.
   - Relaciones: 1 → N Submission, 1 → N Message

2. **Submission** (Envío)
   - Atributos: id, titulo, resumen, palabrasClave, seccion, idioma, estado, etc.
   - Relaciones: N → N Author, 1 → N Comment

3. **Message** (Mensaje)
   - Atributos: id, asunto, contenido, remitenteId, destinatarioId, leido, etc.
   - Relación opcional con Submission

4. **Notification** (Notificación)
   - Atributos: id, tipo, titulo, mensaje, fecha, leida
   - Relación opcional con Submission

**Enumeraciones:**
- Role: admin | author | reviewer
- Status: Nuevo | En revisión | Aceptado | Rechazado | Publicado
- CommentType: interno | revision | autor
- NotificationType: info | success | warning | danger

**Uso recomendado:**
- Diseño de base de datos
- Desarrollo backend
- Documentación técnica

---

## 6. Roles y Permisos

**Archivos:**
- `/diagrams/06-roles-permisos.puml`

**Tipo:** Diagrama de Componentes con Matriz de Permisos

**Descripción:**
Matriz completa de permisos mostrando qué acciones puede realizar cada rol sobre cada recurso del sistema.

**Roles analizados:**
- **Administrador:** Acceso completo a todos los recursos
- **Autor:** Acceso limitado a sus propios recursos
- **Revisor:** Acceso solo a artículos asignados

**Recursos controlados:**
- Envíos (Submissions)
- Mensajes (Messages)
- Notificaciones
- Usuarios
- Estadísticas

**Tipos de acceso:**
- **TODOS:** Sin restricción (admin)
- **MIS/SOLO:** Filtrado por userId (autor)
- **ASIGNADOS:** Filtrado por asignación (revisor)

**Uso recomendado:**
- Análisis de seguridad
- Documentación de permisos
- Testing de autorización

---

## 7. Componentes React

**Archivos:**
- `/diagrams/07-componentes-react.puml`

**Tipo:** Diagrama de Componentes (Component Diagram)

**Descripción:**
Arquitectura detallada de componentes React mostrando todos los componentes del sistema, su jerarquía y dependencias.

**Capas:**

1. **App Layer:** App.tsx, RouterProvider
2. **Routing:** routes.tsx (18 rutas)
3. **Layouts:** AdminLayout, AutorLayout, RevisorLayout
4. **Public Pages:** Login, Register
5. **Admin Pages:** Dashboard, SubmissionsManagement, Mensajeria, etc.
6. **Autor Pages:** DashboardAutor, SubmissionWizard, etc.
7. **Revisor Pages:** DashboardRevisor, etc.
8. **Shared Components:** NotificationCenter, LanguageSelector, etc.
9. **UI Components:** Button, Input, Select, Modal, etc.
10. **Context:** AuthContext, SubmissionContext
11. **Services:** StorageService, i18nService

**Dependencias mostradas:**
- Componentes → Layouts
- Layouts → Shared Components
- Pages → UI Components
- Todos → Context
- Context → Services
- Services → localStorage

**Uso recomendado:**
- Onboarding de desarrolladores frontend
- Refactoring de componentes
- Análisis de dependencias

---

## 8. Navegación por Roles (Bonus - Solo Mermaid)

**Archivos:**
- `/diagrams/mermaid/06-navegacion-roles.mmd`

**Tipo:** Diagrama de Flujo (Flowchart)

**Descripción:**
Flujo de navegación completo mostrando las rutas disponibles para cada rol y cómo se conectan entre sí.

**Flujos incluidos:**

**Administrador:**
- Login → Dashboard Admin
- Dashboard → Gestión de Envíos
- Dashboard → Mensajería (todos)
- Dashboard → Nuevo Envío
- Gestión → Detalle de Envío
- Cualquier página → Perfil

**Autor:**
- Login → Dashboard Autor
- Dashboard → Nuevo Artículo (Wizard)
- Dashboard → Detalle Mi Artículo
- Dashboard → Mensajería (mis mensajes)
- Cualquier página → Perfil

**Revisor:**
- Login → Dashboard Revisor
- Dashboard → Revisar Artículo
- Dashboard → Mensajería (asignaciones)
- Cualquier página → Perfil

**Todos los roles:**
- Cualquier página → Cerrar Sesión → Login

**Uso recomendado:**
- Manual de usuario
- Testing de navegación
- Documentación de rutas

---

## 🎯 Matriz de Uso

| Diagrama | Para quién | Cuándo usarlo |
|----------|------------|---------------|
| 01 - Workflow Editorial | Todos | Explicar proceso de revisión |
| 02 - Arquitectura | Desarrolladores | Setup inicial, refactoring |
| 03 - Casos de Uso | Product Managers | Definir features, testing |
| 04 - Secuencia Envío | Desarrolladores | Implementar funcionalidad |
| 05 - Modelo de Datos | Backend Devs | Diseñar base de datos |
| 06 - Roles y Permisos | Security Team | Auditoría de permisos |
| 07 - Componentes React | Frontend Devs | Desarrollo frontend |
| 08 - Navegación | UX Designers | Diseño de flujos |

---

## 📦 Conjunto Completo para Documentación

Para una documentación completa del proyecto, genera estos diagramas:

### Esenciales (Mínimo):
1. ✅ 01 - Workflow Editorial
2. ✅ 02 - Arquitectura del Sistema
3. ✅ 05 - Modelo de Datos

### Recomendados (Documentación Completa):
1. ✅ 01 - Workflow Editorial
2. ✅ 02 - Arquitectura del Sistema
3. ✅ 03 - Casos de Uso
4. ✅ 05 - Modelo de Datos
5. ✅ 06 - Roles y Permisos
6. ✅ 08 - Navegación por Roles

### Avanzados (Documentación Técnica Completa):
1. ✅ Todos los anteriores
2. ✅ 04 - Secuencia Envío de Artículo
3. ✅ 07 - Componentes React

---

## 🚀 Generación Rápida

### Para presentaciones (PowerPoint/PDF):

```bash
# Generar todos los PlantUML en PNG (alta resolución)
plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 diagrams/*.puml
```

### Para documentación web (GitHub/GitLab):

Los archivos Mermaid se pueden usar directamente en Markdown:

```markdown
## Arquitectura

```mermaid
[copiar contenido de mermaid/02-arquitectura-sistema.mmd]
```
```

### Para reportes (Word/LaTeX):

```bash
# Generar en SVG (mejor calidad para documentos)
plantuml -tsvg diagrams/*.puml
```

---

## 📝 Checklist de Entrega

Antes de entregar documentación con diagramas:

- [ ] Generar todos los diagramas en PNG (300 DPI mínimo)
- [ ] Verificar que reflejan el código actual
- [ ] Incluir leyendas y notas explicativas
- [ ] Usar colores institucionales (#E30513)
- [ ] Nombrar archivos descriptivamente
- [ ] Crear carpeta `/images/` con todas las imágenes
- [ ] Referenciar diagramas en documentación
- [ ] Incluir fuentes (.puml/.mmd) para futuras ediciones

---

**© 2026 FESC - Índice de Diagramas del Sistema de Gestión Editorial**
