import { createBrowserRouter } from 'react-router';
import { Login } from './components/login';
import { Register } from './components/register';
import { SubmissionWizardNew } from './components/submission-wizard-new';
import { SubmissionSuccess } from './components/submission-success';
import { SubmissionsManagement } from './components/submissions-management';
import { SubmissionDetailNew } from './components/submission-detail-new';
import { AdminLayout } from './components/admin-layout';
import { AutorLayout } from './components/autor-layout';
import { EditorLayout } from './components/editor-layout';
import { RevisorLayout } from './components/revisor-layout';
import { Dashboard } from './components/dashboard';
import { DashboardAutor } from './components/dashboard-autor';
import { DashboardRevisor } from './components/dashboard-revisor';
import { Profile } from './components/profile';
import { Mensajeria } from './components/mensajeria';
import { Navigate } from 'react-router';
import { ProtectedRoute } from './components/protected-route';

// Admin
function AdminRoot() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <Navigate to="/admin/dashboard" replace />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminSubmissionsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <SubmissionsManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminSubmissionDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <SubmissionDetailNew />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <Profile />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminNewSubmissionPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <SubmissionWizardNew />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AdminMensajeriaPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <Mensajeria />
      </AdminLayout>
    </ProtectedRoute>
  );
}

// Autor
function AutorRoot() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <Navigate to="/autor/dashboard" replace />
      </AutorLayout>
    </ProtectedRoute>
  );
}

function AutorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <DashboardAutor />
      </AutorLayout>
    </ProtectedRoute>
  );
}

function AutorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <Profile />
      </AutorLayout>
    </ProtectedRoute>
  );
}

function AutorNewSubmissionPage() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <SubmissionWizardNew />
      </AutorLayout>
    </ProtectedRoute>
  );
}

function AutorSubmissionDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <SubmissionDetailNew />
      </AutorLayout>
    </ProtectedRoute>
  );
}

function AutorMensajeriaPage() {
  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AutorLayout>
        <Mensajeria />
      </AutorLayout>
    </ProtectedRoute>
  );
}

// Editor
function EditorRoot() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <Navigate to="/editor/dashboard" replace />
      </EditorLayout>
    </ProtectedRoute>
  );
}

function EditorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <Dashboard />
      </EditorLayout>
    </ProtectedRoute>
  );
}

function EditorSubmissionsPage() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <SubmissionsManagement />
      </EditorLayout>
    </ProtectedRoute>
  );
}

function EditorSubmissionDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <SubmissionDetailNew />
      </EditorLayout>
    </ProtectedRoute>
  );
}

function EditorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <Profile />
      </EditorLayout>
    </ProtectedRoute>
  );
}

function EditorMensajeriaPage() {
  return (
    <ProtectedRoute allowedRoles={['editor']}>
      <EditorLayout>
        <Mensajeria />
      </EditorLayout>
    </ProtectedRoute>
  );
}

// Revisor
function RevisorRoot() {
  return (
    <ProtectedRoute allowedRoles={['reviewer']}>
      <RevisorLayout>
        <Navigate to="/revisor/dashboard" replace />
      </RevisorLayout>
    </ProtectedRoute>
  );
}

function RevisorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['reviewer']}>
      <RevisorLayout>
        <DashboardRevisor />
      </RevisorLayout>
    </ProtectedRoute>
  );
}

function RevisorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['reviewer']}>
      <RevisorLayout>
        <Profile />
      </RevisorLayout>
    </ProtectedRoute>
  );
}

function RevisorMensajeriaPage() {
  return (
    <ProtectedRoute allowedRoles={['reviewer']}>
      <RevisorLayout>
        <Mensajeria />
      </RevisorLayout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/submission/new',
    element: <SubmissionWizardNew />,
  },
  {
    path: '/submission/success',
    element: <SubmissionSuccess />,
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminRoot />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/submissions',
    element: <AdminSubmissionsPage />,
  },
  {
    path: '/admin/submissions/:id',
    element: <AdminSubmissionDetailPage />,
  },
  {
    path: '/admin/profile',
    element: <AdminProfilePage />,
  },
  {
    path: '/admin/new-submission',
    element: <AdminNewSubmissionPage />,
  },
  {
    path: '/admin/mensajeria',
    element: <AdminMensajeriaPage />,
  },
  // Autor routes
  {
    path: '/autor',
    element: <AutorRoot />,
  },
  {
    path: '/autor/dashboard',
    element: <AutorDashboardPage />,
  },
  {
    path: '/autor/envios',
    element: <AutorDashboardPage />,
  },
  {
    path: '/autor/envios/:id',
    element: <AutorSubmissionDetailPage />,
  },
  {
    path: '/autor/profile',
    element: <AutorProfilePage />,
  },
  {
    path: '/autor/new-submission',
    element: <AutorNewSubmissionPage />,
  },
  {
    path: '/autor/submission-detail/:id',
    element: <AutorSubmissionDetailPage />,
  },
  {
    path: '/autor/mensajeria',
    element: <AutorMensajeriaPage />,
  },
  // Editor routes
  {
    path: '/editor',
    element: <EditorRoot />,
  },
  {
    path: '/editor/dashboard',
    element: <EditorDashboardPage />,
  },
  {
    path: '/editor/submissions',
    element: <EditorSubmissionsPage />,
  },
  {
    path: '/editor/submissions/:id',
    element: <EditorSubmissionDetailPage />,
  },
  {
    path: '/editor/profile',
    element: <EditorProfilePage />,
  },
  {
    path: '/editor/mensajeria',
    element: <EditorMensajeriaPage />,
  },
  // Revisor routes
  {
    path: '/revisor',
    element: <RevisorRoot />,
  },
  {
    path: '/revisor/dashboard',
    element: <RevisorDashboardPage />,
  },
  {
    path: '/revisor/asignados',
    element: <RevisorDashboardPage />,
  },
  {
    path: '/revisor/asignados/:id',
    element: <AdminSubmissionDetailPage />,
  },
  {
    path: '/revisor/profile',
    element: <RevisorProfilePage />,
  },
  {
    path: '/revisor/mensajeria',
    element: <RevisorMensajeriaPage />,
  },
  // Fallback
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);