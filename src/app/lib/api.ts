export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export function getApiAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (token) return { Authorization: `Bearer ${token}` };

  try {
    const mockUser = JSON.parse(localStorage.getItem('fesc_current_user') || 'null') as
      | { role?: string }
      | null;
    if (mockUser?.role && ['admin', 'editor', 'reviewer', 'author'].includes(mockUser.role)) {
      return { 'X-Dev-Role': mockUser.role };
    }
  } catch (error) {
    console.error('No fue posible leer el rol de la sesión mock:', error);
  }

  return {};
}

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

  Object.assign(headers, getApiAuthHeaders());

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let data: unknown;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error('El servidor devolvió una respuesta no válida.');
      }
    }
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data
      ? String(data.message)
      : `Error HTTP ${response.status}: ${response.statusText || 'Error en la petición al servidor'}`;
    throw new Error(message);
  }

  return data as T;
}