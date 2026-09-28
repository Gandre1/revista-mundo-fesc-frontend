const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  // Tipamos explícitamente headers como un objeto Record<string, string>
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Si no es subida de archivos (FormData), enviamos JSON por defecto
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Adjuntar Token JWT si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición al servidor');
  }

  return data as T;
}