import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from './auth-context';
import { LanguageSelector } from './language-selector';
import { i18n } from '../lib/i18n';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [, forceUpdate] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(username, password);
    if (success) {
      // Redirigir según el rol del usuario
      const loggedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'editor') {
        navigate('/editor/dashboard');
      } else if (loggedUser.role === 'reviewer') {
        navigate('/revisor/dashboard');
      } else {
        navigate('/autor/dashboard');
      }
    } else {
      setError(i18n.t('login.incorrectCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar con ISSN e idiomas */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-700">
            <span>{i18n.t('login.issn')}</span>
            <span>{i18n.t('login.eissn')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Header principal con logo */}
      <div className="bg-white border-b-4" style={{ borderBottomColor: FESC_RED }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
                {i18n.t('login.subtitle')}
              </h1>
              <p className="text-sm" style={{ color: FESC_GRAY }}>
                {i18n.t('login.systemTitle')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">ISSN: 2248-4000</div>
              <div className="text-xs text-gray-500">{i18n.t('login.institution')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Breadcrumb */}
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="text-sm">
              <span className="text-gray-600">{i18n.t('login.pageTitle')}</span>
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <h2 className="text-2xl mb-2" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              {i18n.t('login.pageTitle')}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {i18n.t('login.requiredFields')} <span style={{ color: FESC_RED }}>*</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mensaje de error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {/* Credenciales de prueba */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                  {i18n.t('login.testCredentials')}
                </p>
                <div className="text-xs space-y-1" style={{ color: FESC_GRAY }}>
                  <p><strong>{i18n.t('login.admin')}:</strong> admin@fesc.edu.co / admin123</p>
                  <p><strong>Editor:</strong> editor@fesc.edu.co / editor123</p>
                  <p><strong>{i18n.t('login.reviewer')}:</strong> revisor@fesc.edu.co / revisor123</p>
                  <p><strong>{i18n.t('login.author')}:</strong> usuario@fesc.edu.co / usuario123</p>
                </div>
              </div>

              {/* Nombre de usuario o correo */}
              <div>
                <label htmlFor="username" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                  {i18n.t('login.usernameOrEmail')} <span style={{ color: FESC_RED }}>*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                  style={{ 
                    fontFamily: "'Roboto', Calibri, sans-serif",
                    focusRingColor: FESC_RED
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = FESC_RED;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm mb-2" style={{ color: FESC_GRAY }}>
                  {i18n.t('login.password')} <span style={{ color: FESC_RED }}>*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 transition-all"
                  style={{ 
                    fontFamily: "'Roboto', Calibri, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = FESC_RED;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div className="mt-2">
                  <a href="#" className="text-sm hover:underline" style={{ color: FESC_RED }}>
                    {i18n.t('login.forgotPassword')}
                  </a>
                </div>
              </div>

              {/* Checkbox mantenerme conectado */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  style={{ accentColor: FESC_RED }}
                />
                <label htmlFor="remember" className="text-sm" style={{ color: FESC_GRAY }}>
                  {i18n.t('login.keepConnected')}
                </label>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: FESC_RED,
                    fontFamily: "'Roboto', Calibri, sans-serif"
                  }}
                >
                  {i18n.t('login.enterButton')}
                </button>
                <Link
                  to="/register"
                  className="text-sm hover:underline"
                  style={{ color: FESC_RED }}
                >
                  {i18n.t('login.registerLink')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}