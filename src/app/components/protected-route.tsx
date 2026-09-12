import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'editor' | 'reviewer' | 'author')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Si está autenticado pero no tiene el rol permitido, redirigir a su dashboard apropiado
    if (user && !allowedRoles.includes(user.role)) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'editor':
          navigate('/editor/dashboard', { replace: true });
          break;
        case 'reviewer':
          navigate('/revisor/dashboard', { replace: true });
          break;
        case 'author':
          navigate('/autor/dashboard', { replace: true });
          break;
      }
    }
  }, [user, isAuthenticated, allowedRoles, navigate]);

  // Si no está autenticado o no tiene el rol correcto, no renderizar nada
  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
