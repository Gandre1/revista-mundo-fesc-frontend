import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { storage, User } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return storage.getCurrentUser();
  });

  useEffect(() => {
    // Sincronizar con storage
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = storage.getUserByCredentials(username, password);
    
    if (foundUser) {
      setUser(foundUser);
      storage.setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>): boolean => {
    try {
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        role: 'author' // Por defecto los registros son autores
      };
      
      // Verificar si el email ya existe
      const users = storage.getUsers();
      const emailExists = users.some(u => u.email === newUser.email);
      
      if (emailExists) {
        return false;
      }
      
      storage.addUser(newUser);
      return true;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, isAdmin }}>
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