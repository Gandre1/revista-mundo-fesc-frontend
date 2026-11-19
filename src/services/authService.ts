import axios from 'axios';
import { API_URL, notifySessionExpired } from '../app/lib/api';

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';

export interface AuthUserResponse {
  id: string;
  nombre: string;
  apellidos?: string | null;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUserResponse;
}

export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  afiliacion: string;
  pais: string;
  orcid?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface UserProfile extends Omit<AuthUserResponse, 'role'> {
  role?: string;
  afiliacion?: string | null;
  pais?: string | null;
  orcid?: string | null;
  notificaciones?: boolean | number | null;
  created_at?: string;
}

export interface ProfileResponse {
  user: UserProfile;
}

export interface UpdateProfilePayload {
  nombre: string;
  apellidos: string;
  afiliacion: string;
  pais: string;
  orcid: string;
  notificaciones: boolean;
}

export interface UpdateProfileResponse {
  message: string;
  user: Partial<UserProfile>;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordActionResponse {
  message: string;
}

const apiBaseUrl = typeof API_URL === 'string' ? API_URL.trim().replace(/\/+$/, '') : '';
const apiRoot = /\/api$/i.test(apiBaseUrl) ? apiBaseUrl : `${apiBaseUrl}/api`;

const apiClient = axios.create({
  baseURL: apiRoot,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleUnauthorizedResponse = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    notifySessionExpired();
  }
  return Promise.reject(error);
};

axios.interceptors.response.use(
  (response) => response,
  handleUnauthorizedResponse
);

apiClient.interceptors.response.use(
  (response) => response,
  handleUnauthorizedResponse
);

export function setAuthToken(token: string | null) {
  if (token) {
    const authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = authorization;
    apiClient.defaults.headers.common.Authorization = authorization;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
  delete apiClient.defaults.headers.common.Authorization;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
  return data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>('/users/profile');
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const { data } = await apiClient.put<UpdateProfileResponse>('/users/profile', payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<PasswordActionResponse> {
  const { data } = await apiClient.post<PasswordActionResponse>('/auth/forgot-password', payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<PasswordActionResponse> {
  const { data } = await apiClient.post<PasswordActionResponse>('/auth/reset-password', payload);
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<PasswordActionResponse> {
  const { data } = await apiClient.put<PasswordActionResponse>('/users/change-password', payload);
  return data;
}
