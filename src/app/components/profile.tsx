import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';
import { useAuth } from './auth-context';
import { storage } from '../lib/storage';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    email: user?.email || '',
    afiliacion: user?.afiliacion || '',
    pais: user?.pais || '',
    orcid: user?.orcid || '',
  });

  // Actualizar cuando cambie el usuario
  useEffect(() => {
    setCurrentUser(user);
    setFormData({
      nombre: user?.nombre || '',
      apellidos: user?.apellidos || '',
      email: user?.email || '',
      afiliacion: user?.afiliacion || '',
      pais: user?.pais || '',
      orcid: user?.orcid || '',
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Debes iniciar sesión para ver tu perfil</p>
      </div>
    );
  }

  const handleSave = () => {
    // Actualizar usuario en storage
    const users = storage.getUsers();
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, ...formData }
        : u
    );
    storage.saveUsers(updatedUsers);
    
    // Actualizar usuario actual
    const updatedUser = { ...user, ...formData };
    storage.setCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    
    setEditing(false);
    alert('Perfil actualizado exitosamente');
    
    // Recargar página para refrescar el usuario en todos los componentes
    window.location.reload();
  };

  const roleLabels = {
    admin: 'Administrador',
    editor: 'Editor',
    revisor: 'Revisor',
    autor: 'Autor'
  };

  return (
    <div className="space-y-6">
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
                {roleLabels[user.role as keyof typeof roleLabels] || user.role}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
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
              <User className="w-4 h-4 inline mr-2" />
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
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-white rounded hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: FESC_RED }}
            >
              <Save className="w-4 h-4" />
              Guardar cambios
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  nombre: user.nombre || '',
                  apellidos: user.apellidos || '',
                  email: user.email || '',
                  afiliacion: user.afiliacion || '',
                  pais: user.pais || '',
                  orcid: user.orcid || '',
                });
              }}
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
                <p className="text-xs text-gray-500">{roleLabels[user.role as keyof typeof roleLabels] || user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}