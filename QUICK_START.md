# 🚀 Guía Rápida de Inicio - Revista Mundo FESC

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/revista-mundo-fesc.git

# Entrar al directorio
cd revista-mundo-fesc

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en: **http://localhost:5173**

---

## 🔑 Credenciales de Acceso

### 👨‍💼 Administrador
```
Email: admin@fesc.edu.co
Password: admin123
```
**Acceso a:**
- Dashboard con estadísticas globales
- TODOS los envíos del sistema
- Gestión completa de artículos
- Todos los mensajes
- Asignación de revisores

### ✍️ Autor
```
Email: usuario@fesc.edu.co
Password: usuario123
```
**Acceso a:**
- Dashboard personal
- Solo SUS envíos
- Crear nuevos artículos
- Mensajes enviados/recibidos
- Ver estado de sus artículos

### 🔍 Revisor
```
Email: revisor@fesc.edu.co
Password: revisor123
```
**Acceso a:**
- Dashboard de revisor
- Solo artículos ASIGNADOS
- Sistema de revisión
- Mensajes relacionados con asignaciones
- Agregar comentarios de revisión

---

## 📖 Casos de Uso Comunes

### Caso 1: Enviar un Nuevo Artículo (Como Autor)

1. **Login** con credenciales de autor
2. Click en **"Nuevo Envío"** (botón rojo destacado)
3. **Paso 1 - Información Básica:**
   - Título del artículo
   - Resumen
   - Palabras clave (Enter para agregar)
   - Seleccionar sección e idioma
4. **Paso 2 - Autores:**
   - Agregar autor principal (marcado como corresponsal)
   - Opcionalmente agregar coautores
   - Incluir ORCID si está disponible
5. **Paso 3 - Archivos:**
   - Cargar archivo del manuscrito (simular con botón)
   - Opcionalmente: archivos complementarios
6. **Paso 4 - Revisión:**
   - Revisar todos los datos
   - Marcar checkbox de aceptación de términos
   - Click en **"Enviar artículo"**
7. ✅ Artículo enviado con éxito

### Caso 2: Gestionar Envíos (Como Admin)

1. **Login** con credenciales de admin
2. Ir a **"Gestión de Envíos"**
3. Ver lista de TODOS los artículos:
   - Filtrar por estado
   - Buscar por título/autor
   - Ver detalles de cada envío
4. Click en un artículo para ver detalles:
   - Cambiar estado del artículo
   - Asignar editor/revisor
   - Agregar comentarios internos
   - Descargar archivos

### Caso 3: Revisar un Artículo (Como Revisor)

1. **Login** con credenciales de revisor
2. Dashboard muestra artículos asignados
3. Click en un artículo para revisarlo:
   - Leer título, resumen, autores
   - Descargar manuscrito completo
   - Agregar comentarios de revisión
   - Marcar tipo de comentario (revisión)
4. El admin puede ver estos comentarios

### Caso 4: Enviar un Mensaje

1. Ir a **"Mensajería"** (cualquier rol)
2. Click en **"Nuevo mensaje"**
3. Seleccionar destinatario de la lista
4. Escribir asunto y contenido
5. Opcionalmente: asociar con un envío (ID)
6. Click en **"Enviar mensaje"**
7. El destinatario verá el mensaje en su bandeja

### Caso 5: Cambiar Idioma

1. En el topbar, buscar el ícono del **globo** 🌐
2. Click para abrir selector
3. Seleccionar **Español** o **English**
4. La interfaz cambia automáticamente
5. La preferencia se guarda en localStorage

---

## 🎯 Flujo Completo de un Artículo

### Día 1: Envío del Autor
```
Autor → Login → Nuevo Envío → Completar wizard → Enviar
Estado: "Nuevo"
```

### Día 2: Asignación por Admin
```
Admin → Login → Gestión de Envíos → Ver artículo → 
  Cambiar estado a "En revisión" → 
  Asignar revisor
Estado: "En revisión"
```

### Días 3-14: Revisión
```
Revisor → Login → Ver artículo asignado → 
  Descargar manuscrito → 
  Agregar comentarios de revisión → 
  Guardar
```

### Día 15: Decisión Editorial
```
Admin → Revisar comentarios del revisor →
  Opción A: Cambiar a "Aceptado" → Publicación
  Opción B: Cambiar a "Revisiones requeridas" → 
    Notificar al autor
  Opción C: Cambiar a "Rechazado"
```

### Si hay revisiones requeridas:
```
Autor → Recibe notificación → 
  Sube nueva versión → 
  Vuelve al ciclo de revisión
```

### Publicación Final:
```
Admin → Cambiar estado a "Publicado" → 
  Artículo disponible públicamente
```

---

## 🛠️ Tareas Administrativas Comunes

### Crear un Nuevo Usuario (Manual)

El sistema permite registro abierto, pero si necesitas crear usuarios manualmente:

```typescript
// En la consola del navegador
const newUser = {
  id: '4',
  email: 'nuevo@fesc.edu.co',
  password: 'password123',
  role: 'author', // o 'admin', 'reviewer'
  nombre: 'Nuevo',
  apellidos: 'Usuario',
  nombreUsuario: 'nuevousuario',
  afiliacion: 'FESC',
  pais: 'CO'
};

const users = JSON.parse(localStorage.getItem('fesc_users') || '[]');
users.push(newUser);
localStorage.setItem('fesc_users', JSON.stringify(users));
```

### Ver Todos los Datos en localStorage

```javascript
// En consola del navegador
console.log('Usuarios:', JSON.parse(localStorage.getItem('fesc_users')));
console.log('Envíos:', JSON.parse(localStorage.getItem('fesc_submissions')));
console.log('Mensajes:', JSON.parse(localStorage.getItem('fesc_messages')));
console.log('Notificaciones:', JSON.parse(localStorage.getItem('fesc_notifications')));
```

### Limpiar Todos los Datos (Reset)

```javascript
// En consola del navegador - ¡CUIDADO! Elimina todos los datos
localStorage.clear();
// Recargar la página para que se carguen datos por defecto
location.reload();
```

### Cambiar Rol de un Usuario Existente

```javascript
// En consola del navegador
const users = JSON.parse(localStorage.getItem('fesc_users') || '[]');
const user = users.find(u => u.email === 'usuario@fesc.edu.co');
if (user) {
  user.role = 'reviewer'; // Cambiar a revisor
  localStorage.setItem('fesc_users', JSON.stringify(users));
  console.log('Rol actualizado. Vuelve a hacer login.');
}
```

---

## 🎨 Personalización

### Cambiar Colores Institucionales

Editar: `/src/styles/theme.css`

```css
:root {
  --fesc-red-primary: #e30513;    /* Cambiar aquí */
  --fesc-red-dark: #9c0f06;       /* Cambiar aquí */
  --fesc-red-wine: #630b00;       /* Cambiar aquí */
  --fesc-gray: #3c3c3b;           /* Cambiar aquí */
}
```

### Cambiar Logo o Nombre

Editar los 3 layouts:
- `/src/app/components/admin-layout.tsx`
- `/src/app/components/autor-layout.tsx`
- `/src/app/components/revisor-layout.tsx`

Buscar:
```typescript
<h2>Mundo FESC</h2>
```

### Agregar Nuevas Secciones de Artículos

Editar: `/src/app/components/submission-wizard-new.tsx`

Buscar el array de secciones:
```typescript
const secciones = [
  'Artículos de Investigación',
  'Artículos de Revisión',
  'Estudios de Caso',
  'Notas Técnicas',
  'NUEVA SECCION AQUI' // Agregar nueva
];
```

---

## 🔍 Debugging y Troubleshooting

### Problema: No puedo hacer login

**Solución:**
1. Verificar que las credenciales sean exactas (case-sensitive)
2. Abrir consola del navegador (F12)
3. Verificar que existen usuarios:
   ```javascript
   console.log(localStorage.getItem('fesc_users'));
   ```
4. Si está vacío, hacer reset (ver arriba)

### Problema: Los envíos no se muestran

**Solución:**
1. Verificar que el usuario tiene el rol correcto
2. Admin debe ver todos, autor solo los suyos
3. Verificar en consola:
   ```javascript
   console.log(localStorage.getItem('fesc_submissions'));
   ```

### Problema: El idioma no cambia

**Solución:**
1. Verificar que el selector de idioma está visible
2. Abrir consola y ejecutar:
   ```javascript
   localStorage.setItem('fesc_language', 'en'); // o 'es'
   location.reload();
   ```

### Problema: Las notificaciones no se actualizan

**Solución:**
1. Las notificaciones usan polling (2 segundos)
2. Esperar un momento o recargar la página
3. Verificar que el usuario está autenticado

---

## 📊 Estadísticas y Reportes

### Ver Estadísticas Globales (Admin)

1. Login como admin
2. Ir al Dashboard
3. Ver tarjetas con:
   - Total de envíos
   - Nuevos
   - En revisión
   - Aceptados
   - Tasa de aceptación

### Exportar Datos (Manual)

```javascript
// En consola del navegador
const submissions = JSON.parse(localStorage.getItem('fesc_submissions'));

// Convertir a CSV simple
const csv = submissions.map(s => 
  `${s.id},${s.titulo},${s.autorNombre},${s.estado},${s.fechaEnvio}`
).join('\n');

console.log('ID,Título,Autor,Estado,Fecha\n' + csv);
```

---

## 🔐 Seguridad (IMPORTANTE)

### ⚠️ Para Desarrollo SOLAMENTE

Este sistema usa localStorage sin encriptación. **NO** usar en producción con datos reales:

- ❌ Contraseñas en texto plano
- ❌ Sin tokens JWT
- ❌ Sin HTTPS
- ❌ Sin validación server-side

### ✅ Para Producción

Migrar a:
- Backend con Node.js + Express
- Base de datos PostgreSQL
- Bcrypt para passwords
- JWT para autenticación
- HTTPS obligatorio
- Validación en servidor

Ver: `TECHNICAL_GUIDE.md` sección "Migración a Backend"

---

## 🎓 Tips y Mejores Prácticas

### Para Desarrolladores

1. **Usar TypeScript estricto** - Evita errores en runtime
2. **Componentes pequeños** - Máximo 200 líneas
3. **Nombres descriptivos** - `handleSubmitArticle` mejor que `handle`
4. **Comentarios en lógica compleja** - Facilita mantenimiento
5. **Probar con los 3 roles** - Verificar permisos

### Para Testers

1. **Probar todos los flujos** - Envío completo de artículo
2. **Verificar permisos** - Cada rol ve lo que debe
3. **Probar edge cases** - Formularios vacíos, etc.
4. **Responsive** - Probar en móvil y desktop
5. **Multiidioma** - Cambiar entre ES/EN

### Para Administradores del Sistema

1. **Backup regular** - Exportar datos de localStorage
2. **Monitoreo de uso** - Ver cantidad de envíos
3. **Gestión de usuarios** - Revisar roles
4. **Comunicación** - Usar mensajería para notificar
5. **Workflow claro** - Definir tiempos de revisión

---

## 📞 Contacto y Soporte

**¿Necesitas ayuda?**

- 📧 Email: soporte@fesc.edu.co
- 🌐 Web: https://www.fesc.edu.co
- 📚 Documentación: Ver README.md y TECHNICAL_GUIDE.md

---

## ✅ Checklist de Verificación

Antes de desplegar, verificar:

- [ ] Todos los 3 roles funcionan correctamente
- [ ] Login/Logout funciona
- [ ] Envío de artículos completo (wizard de 4 pasos)
- [ ] Sistema de mensajería operativo
- [ ] Notificaciones funcionando
- [ ] Cambio de idioma operativo
- [ ] Permisos correctos por rol
- [ ] Dashboard con estadísticas correctas
- [ ] Responsive en mobile y desktop
- [ ] Colores institucionales aplicados
- [ ] Sin errores en consola del navegador

---

**© 2026 FESC - Guía Rápida de Inicio**

¡Listo para empezar! 🚀
