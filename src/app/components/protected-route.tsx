import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { getDashboardPath, useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'editor' | 'reviewer' | 'author')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return null;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
