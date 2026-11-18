import { createContext, useContext, useState, ReactNode } from 'react';
import { storage, User } from '../lib/storage';
import {
  login as requestLogin,
  register as requestRegister,
  RegisterPayload,
  RegisterResponse,
  setAuthToken,
  UserRole,
} from '../../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: RegisterPayload) => Promise<RegisterResponse>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userRoles: readonly string[] = ['admin', 'editor', 'reviewer', 'author'];
const dashboardPaths: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  editor: '/editor/dashboard',
  reviewer: '/revisor/dashboard',
  author: '/autor/dashboard',
};

export function getDashboardPath(role: UserRole): string {
  return dashboardPaths[role];
}

function isUserRole(role: string): role is UserRole {
  return userRoles.includes(role);
}

function getStoredUser(): User | null {
  const token = localStorage.getItem('token');
  const storedUser = storage.getCurrentUser();

  if (!token || !storedUser) {
    localStorage.removeItem('token');
    storage.setCurrentUser(null);
    setAuthToken(null);
    return null;
  }

  setAuthToken(token);
  return storedUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await requestLogin(email, password);
    if (!response.token || !response.user || !isUserRole(response.user.role)) {
      throw new Error('El servidor devolvió una respuesta de inicio de sesión no válida.');
    }

    const loggedInUser: User = {
      id: String(response.user.id),
      email: response.user.email,
      role: response.user.role,
      nombre: response.user.nombre,
      apellidos: response.user.apellidos || '',
      nombreUsuario: response.user.email.split('@')[0],
    };

    localStorage.setItem('token', response.token);
    setAuthToken(response.token);
    storage.setCurrentUser(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = (userData: RegisterPayload): Promise<RegisterResponse> => {
    return requestRegister(userData);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) {
      throw new Error('No hay una sesión activa para actualizar el perfil.');
    }

    const updatedUser = { ...user, ...userData };
    storage.setCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setAuthToken(null);
    storage.setCurrentUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-exportar User para compatibilidad
export type { User };