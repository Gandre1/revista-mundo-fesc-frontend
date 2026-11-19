import { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Mail, Shield, Calendar, Save, Bell, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import { User } from '../lib/storage';
import {
  getProfile,
  updateProfile as saveProfile,
  changePassword,
  UpdateProfilePayload,
} from '../../services/authService';
import { getPasswordValidationError } from '../lib/password-validation';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

type ProfileFormData = UpdateProfilePayload & { email: string };

function getProfileFormData(user: User): ProfileFormData {
  return {
    nombre: user.nombre || '',
    apellidos: user.apellidos || '',
    email: user.email || '',
    afiliacion: user.afiliacion || '',
    pais: user.pais || '',
    orcid: user.orcid || '',
    notificaciones: user.notificaciones ?? true,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState<ProfileFormData>(() => (
    user ? getProfileFormData(user) : {
      nombre: '',
      apellidos: '',
      email: '',
      afiliacion: '',
      pais: '',
      orcid: '',
      notificaciones: true,
    }
  ));

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    getProfile()
      .then(({ user: profile }) => {
        if (!active) return;

        const updates: Partial<User> = {
          nombre: profile.nombre,
          apellidos: profile.apellidos || '',
          email: profile.email,
          afiliacion: profile.afiliacion || '',
          pais: profile.pais || '',
          orcid: profile.orcid || '',
          notificaciones: profile.notificaciones == null
            ? user.notificaciones ?? true
            : Boolean(profile.notificaciones),
        };
        updateUser(updates);
        setFormData({
          nombre: updates.nombre || '',
          apellidos: updates.apellidos || '',
          email: updates.email || '',
          afiliacion: updates.afiliacion || '',
          pais: updates.pais || '',
          orcid: updates.orcid || '',
          notificaciones: updates.notificaciones ?? true,
        });
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(getErrorMessage(error, 'No fue posible cargar el perfil.'));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Debes iniciar sesión para ver tu perfil</p>
      </div>
    );
  }

  const handleSave = async () => {
    const payload: UpdateProfilePayload = {
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos.trim(),
      afiliacion: formData.afiliacion.trim(),
      pais: formData.pais.trim(),
      orcid: formData.orcid.trim(),
      notificaciones: formData.notificaciones,
    };

    if (!payload.nombre || !payload.apellidos) {
      toast.error('El nombre y los apellidos son obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveProfile(payload);
      const updatedProfile: Partial<User> = {
        nombre: response.user.nombre || payload.nombre,
        apellidos: response.user.apellidos || payload.apellidos,
        afiliacion: response.user.afiliacion || '',
        pais: response.user.pais || '',
        orcid: response.user.orcid || '',
        notificaciones: response.user.notificaciones == null
          ? payload.notificaciones
          : Boolean(response.user.notificaciones),
      };

      updateUser(updatedProfile);
      setFormData({
        nombre: updatedProfile.nombre || payload.nombre,
        apellidos: updatedProfile.apellidos || payload.apellidos,
        email: user.email,
        afiliacion: updatedProfile.afiliacion || '',
        pais: updatedProfile.pais || '',
        orcid: updatedProfile.orcid || '',
        notificaciones: updatedProfile.notificaciones ?? payload.notificaciones,
      });
      setEditing(false);
      toast.success(response.message || 'Perfil actualizado correctamente.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'No fue posible actualizar el perfil.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    const passwordError = getPasswordValidationError(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(response.message || 'Contraseña cambiada correctamente.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'No fue posible cambiar la contraseña.'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleLabels: Record<User['role'], string> = {
    admin: 'Administrador',
    editor: 'Editor',
    reviewer: 'Revisor',
    author: 'Autor',
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <p className="text-sm text-gray-500" role="status">
          Cargando perfil...
        </p>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: FESC_RED }}>
            {user.nombre?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              {user.nombre} {user.apellidos}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4" style={{ color: FESC_RED }} />
              <span className="text-sm font-medium" style={{ color: FESC_GRAY }}>
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              disabled={isLoading}
              className="px-4 py-2 text-white rounded hover:opacity-90"
              style={{ backgroundColor: FESC_RED }}
            >
              Editar perfil
            </button>
          )}
        </div>
      </div>

      {/* Información del perfil */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: FESC_GRAY }}>
          Información Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              <UserIcon className="w-4 h-4 inline mr-2" />
              Nombre
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p className="text-gray-700 py-2">{user.nombre}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              Apellidos
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p className="text-gray-700 py-2">{user.apellidos}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              <Mail className="w-4 h-4 inline mr-2" />
              Correo electrónico
            </label>
            <p className="text-gray-700 py-2">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
          </div>

          {/* Afiliación */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              Afiliación
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.afiliacion}
                onChange={(e) => setFormData({ ...formData, afiliacion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Ej: Fundación de Estudios Superiores Comfanorte"
                style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p className="text-gray-700 py-2">{user.afiliacion || 'No especificado'}</p>
            )}
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              País
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="Ej: Colombia"
                style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p className="text-gray-700 py-2">{user.pais || 'No especificado'}</p>
            )}
          </div>

          {/* ORCID */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              ORCID iD
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.orcid}
                onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                placeholder="0000-0000-0000-0000"
                style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p className="text-gray-700 py-2">{user.orcid || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
              <Bell className="w-4 h-4 inline mr-2" />
              Notificaciones por correo
            </label>
            {editing ? (
              <label className="flex items-center gap-2 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.notificaciones}
                  onChange={(e) => setFormData({ ...formData, notificaciones: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: FESC_RED }}
                />
                Recibir notificaciones de la revista
              </label>
            ) : (
              <p className="text-gray-700 py-2">
                {formData.notificaciones ? 'Activadas' : 'Desactivadas'}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-white rounded hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: FESC_RED }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(getProfileFormData(user));
              }}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Información de cuenta */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: FESC_GRAY }}>
          Información de Cuenta
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium" style={{ color: FESC_GRAY }}>ID de Usuario</p>
                <p className="text-xs text-gray-500">{user.id}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium" style={{ color: FESC_GRAY }}>Rol</p>
                <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: FESC_GRAY }}>
          Cambiar contraseña
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
        </p>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="current-password" className="mb-2 block text-sm font-semibold" style={{ color: FESC_GRAY }}>
              <KeyRound className="mr-2 inline h-4 w-4" />
              Contraseña actual
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              required
              className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="profile-new-password" className="mb-2 block text-sm font-semibold" style={{ color: FESC_GRAY }}>
              Nueva contraseña
            </label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              required
              className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="profile-confirm-password" className="mb-2 block text-sm font-semibold" style={{ color: FESC_GRAY }}>
              Confirmar nueva contraseña
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              required
              className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded px-6 py-2 text-white hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: FESC_RED }}
            >
              {isChangingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}