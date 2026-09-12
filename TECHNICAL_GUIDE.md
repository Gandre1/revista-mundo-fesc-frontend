# 🔧 Guía Técnica - Sistema de Gestión Editorial FESC

## Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Sistema de Permisos](#sistema-de-permisos)
3. [Gestión de Estado](#gestión-de-estado)
4. [Sistema de Routing](#sistema-de-routing)
5. [Internacionalización](#internacionalización)
6. [API de Storage](#api-de-storage)
7. [Migración a Backend](#migración-a-backend)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## 1. Arquitectura del Sistema

### Componentes Principales

```
┌──────────────────────────────────────────────────┐
│                   App.tsx                        │
│              (RouterProvider)                    │
└────────────────┬─────────────────────────────────┘
                 │
         ┌───────┴──────┐
         │              │
         ▼              ▼
    Public Routes   Protected Routes
    ─────────────   ────────────────
    /login          /admin/*
    /register       /autor/*
                    /revisor/*
```

### Layouts por Rol

Cada rol tiene su propio layout que controla:
- Sidebar con navegación específica
- Topbar con notificaciones y perfil
- Permisos de acceso a rutas
- Estilo visual consistente

```typescript
AdminLayout    → /admin/*
AutorLayout    → /autor/*
RevisorLayout  → /revisor/*
```

---

## 2. Sistema de Permisos

### Implementación de Control de Acceso

```typescript
// En auth-context.tsx
export function useAuth() {
  const user = getCurrentUser();
  
  // Verificar rol
  const isAdmin = user?.role === 'admin';
  const isAuthor = user?.role === 'author';
  const isReviewer = user?.role === 'reviewer';
  
  return { user, isAdmin, isAuthor, isReviewer, logout };
}
```

### Filtrado de Datos por Rol

```typescript
// Admin: ve TODO
const submissions = storage.getSubmissions();

// Autor: solo sus envíos
const submissions = storage.getSubmissions()
  .filter(s => s.autorId === user.id);

// Revisor: solo asignados a él
const submissions = storage.getSubmissions()
  .filter(s => s.editorAsignado === user.nombre);
```

### Protección de Rutas

```typescript
// En cada componente protegido
const { user } = useAuth();

useEffect(() => {
  if (!user) {
    navigate('/login');
  }
}, [user]);
```

---

## 3. Gestión de Estado

### Context API para Autenticación

```typescript
// auth-context.tsx
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}
```

### LocalStorage como Persistencia

```typescript
// storage.ts - Servicio centralizado
class StorageService {
  private USERS_KEY = 'fesc_users';
  private SUBMISSIONS_KEY = 'fesc_submissions';
  private MESSAGES_KEY = 'fesc_messages';
  
  getSubmissions(): Submission[] {
    const data = localStorage.getItem(this.SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  saveSubmissions(submissions: Submission[]) {
    localStorage.setItem(
      this.SUBMISSIONS_KEY, 
      JSON.stringify(submissions)
    );
  }
}

export const storage = new StorageService();
```

### Actualización en Tiempo Real

```typescript
// Polling para notificaciones
useEffect(() => {
  loadNotifications();
  const interval = setInterval(loadNotifications, 2000);
  return () => clearInterval(interval);
}, [user]);
```

---

## 4. Sistema de Routing

### React Router v7 Data Mode

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/admin/dashboard',
    element: <AdminLayout><Dashboard /></AdminLayout>
  },
  {
    path: '/admin/submissions/:id',
    element: <AdminLayout><SubmissionDetail /></AdminLayout>
  }
]);
```

### Navegación Programática

```typescript
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    // Hacer algo...
    navigate('/admin/submissions');
  };
}
```

### Redirección según Rol

```typescript
// En login.tsx
const handleLogin = async () => {
  const user = await storage.getUserByCredentials(email, password);
  
  if (user.role === 'admin') {
    navigate('/admin/dashboard');
  } else if (user.role === 'author') {
    navigate('/autor/dashboard');
  } else if (user.role === 'reviewer') {
    navigate('/revisor/dashboard');
  }
};
```

---

## 5. Internacionalización

### Estructura del Sistema i18n

```typescript
// lib/i18n.ts
export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  'nav.dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'nav.submissions': { es: 'Gestión de Envíos', en: 'Submissions Management' },
  // ...
};

class I18nService {
  private currentLanguage: Language = 'es';
  
  t(key: string): string {
    return translations[key][this.currentLanguage];
  }
  
  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem('fesc_language', lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }
}

export const i18n = new I18nService();
```

### Uso en Componentes

```typescript
import { i18n } from '../lib/i18n';
import { useState, useEffect } from 'react';

function MyComponent() {
  const [lang, setLang] = useState(i18n.getCurrentLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setLang(e.detail);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);
  
  return <h1>{i18n.t('nav.dashboard')}</h1>;
}
```

### Selector de Idioma

```typescript
// language-selector.tsx
<button onClick={() => i18n.setLanguage('es')}>
  Español
</button>
<button onClick={() => i18n.setLanguage('en')}>
  English
</button>
```

---

## 6. API de Storage

### Métodos Principales

#### Usuarios
```typescript
storage.getUsers(): User[]
storage.addUser(user: User): void
storage.getUserByCredentials(email: string, password: string): User | null
storage.getCurrentUser(): User | null
storage.setCurrentUser(user: User | null): void
```

#### Envíos
```typescript
storage.getSubmissions(): Submission[]
storage.getSubmissionById(id: string): Submission | null
storage.addSubmission(submission: Submission): void
storage.updateSubmission(id: string, updates: Partial<Submission>): void
storage.deleteSubmission(id: string): void
storage.generateSubmissionId(): string  // SUB-YYYY-###
```

#### Comentarios
```typescript
storage.addComment(submissionId: string, comment: Comment): void
```

#### Mensajes
```typescript
storage.getMessages(): Message[]
storage.addMessage(message: Message): void
storage.markMessageAsRead(id: string): void
storage.deleteMessage(id: string): void
storage.getUnreadMessagesCount(): number
```

#### Notificaciones
```typescript
storage.getNotifications(): Notification[]
storage.addNotification(notification: Notification): void
storage.markNotificationAsRead(id: string): void
storage.markAllNotificationsAsRead(): void
storage.deleteNotification(id: string): void
storage.getUnreadCount(): number
```

#### Estadísticas
```typescript
storage.getStatistics(): {
  totalSubmissions: number;
  newSubmissions: number;
  inReview: number;
  accepted: number;
  rejected: number;
  published: number;
  avgReviewTime: number;
  acceptanceRate: string;
}
```

---

## 7. Migración a Backend

### Paso 1: Crear Backend con Express

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Paso 2: Definir Schema de Prisma

```prisma
// prisma/schema.prisma
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  password      String
  role          Role
  nombre        String
  apellidos     String?
  afiliacion    String?
  pais          String?
  orcid         String?
  nombreUsuario String        @unique
  submissions   Submission[]
  messages      Message[]     @relation("sender")
  receivedMsgs  Message[]     @relation("recipient")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Submission {
  id              String    @id @default(uuid())
  titulo          String
  resumen         String
  palabrasClave   String[]
  seccion         String
  idioma          String
  estado          Status
  fechaEnvio      DateTime  @default(now())
  autorId         String
  autor           User      @relation(fields: [autorId], references: [id])
  editorAsignado  String?
  comentarios     Comment[]
  messages        Message[]
  notifications   Notification[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Role {
  ADMIN
  AUTHOR
  REVIEWER
}

enum Status {
  NUEVO
  EN_REVISION
  REVISIONES_REQUERIDAS
  ACEPTADO
  RECHAZADO
  PUBLICADO
}
```

### Paso 3: Crear Servicio API en Frontend

```typescript
// lib/api.ts
const API_URL = 'http://localhost:3000/api';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  
  // Submissions
  getSubmissions: async () => {
    const res = await fetch(`${API_URL}/submissions`, {
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return res.json();
  },
  
  createSubmission: async (data: Partial<Submission>) => {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  // Mensajes
  getMessages: async () => {
    const res = await fetch(`${API_URL}/messages`, {
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return res.json();
  }
};
```

### Paso 4: Reemplazar Storage con API

```typescript
// Antes (con storage)
const submissions = storage.getSubmissions();

// Después (con API)
const [submissions, setSubmissions] = useState<Submission[]>([]);

useEffect(() => {
  api.getSubmissions().then(data => setSubmissions(data));
}, []);
```

---

## 8. Testing

### Configurar Jest + React Testing Library

```bash
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### Ejemplo de Test

```typescript
// __tests__/login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../components/login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });
  
  it('should handle form submission', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Iniciar sesión');
    
    fireEvent.change(emailInput, { target: { value: 'admin@fesc.edu.co' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);
    
    // Verificar navegación o estado
  });
});
```

---

## 9. Deployment

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Opción 2: Netlify

```bash
# Build
npm run build

# Configurar en netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Opción 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build y run
docker build -t revista-fesc .
docker run -p 80:80 revista-fesc
```

### Variables de Entorno

```env
# .env.production
VITE_API_URL=https://api.revistafesc.edu.co
VITE_UPLOAD_URL=https://uploads.revistafesc.edu.co
```

---

## 10. Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/dashboard'));
const SubmissionsManagement = lazy(() => import('./components/submissions-management'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### Memoización

```typescript
import { useMemo } from 'react';

function SubmissionsList({ submissions }) {
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => s.estado === 'Nuevo');
  }, [submissions]);
  
  return <div>{/* render */}</div>;
}
```

### Virtual Scrolling para Listas Grandes

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.index}>
            {items[virtualRow.index].title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev)
- [React Router v7](https://reactrouter.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**© 2026 FESC - Guía Técnica del Sistema de Gestión Editorial**
