import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Inbox, LogOut, BookOpen, Menu, X, ChevronRight, User, PlusCircle, Mail } from 'lucide-react';
import { NotificationCenterNew } from './notification-center-new';
import { LanguageSelector } from './language-selector';
import { useAuth } from './auth-context';
import { i18n } from '../lib/i18n';

interface AutorLayoutProps {
  children: ReactNode;
}

const FESC_RED = '#e30513';

export function AutorLayout({ children }: AutorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, forceUpdate] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const navigation = [
    { name: 'Mis envíos', href: '/autor/dashboard', icon: Inbox },
    { name: 'Mensajería', href: '/autor/mensajeria', icon: Mail },
    { name: 'Mi Perfil', href: '/autor/profile', icon: User },
  ];

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: FESC_RED }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 text-sm font-medium">Revista Mundo FESC</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-gray-50 border-r border-gray-200 z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: FESC_RED }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-base leading-tight font-semibold">Mundo FESC</h2>
              <p className="text-xs text-gray-500">{i18n.t('layout.authorPanel')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto h-[calc(100vh-240px)]">
          {/* Sección: Mis artículos */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.myArticles')}
            </h3>
            <Link
              to="/autor/new-submission"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/autor/new-submission')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/autor/new-submission') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.newSubmission')}
            </Link>
            <Link
              to="/autor/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/autor/dashboard') || isActive('/autor/envios')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/autor/dashboard') || isActive('/autor/envios') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.mySubmissions')}
            </Link>
          </div>

          {/* Sección: Comunicación */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.communication')}
            </h3>
            <Link
              to="/autor/mensajeria"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/autor/mensajeria')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/autor/mensajeria') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.messaging')}
            </Link>
          </div>

          {/* Sección: Perfil */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.profile')}
            </h3>
            <Link
              to="/autor/profile"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/autor/profile')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/autor/profile') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.myProfile')}
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="rounded p-3 mb-3 bg-red-50">
            <p className="text-xs mb-1 font-medium" style={{ color: FESC_RED }}>{i18n.t('layout.activeSession')}</p>
            <p className="text-gray-900 text-sm font-medium">{user?.nombre || 'Usuario'} {user?.apellidos || ''}</p>
            <p className="text-gray-500 text-xs">{user?.email || ''}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>{i18n.t('layout.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72">
        {/* Top bar con notificaciones */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {location.pathname.startsWith('/autor/new-submission') && i18n.t('menu.newSubmission')}
                {(location.pathname === '/autor/dashboard' || location.pathname.startsWith('/autor/envios')) && i18n.t('page.mySubmissions')}
                {location.pathname.startsWith('/autor/mensajeria') && i18n.t('page.messaging')}
                {location.pathname.startsWith('/autor/profile') && i18n.t('page.myProfile')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenterNew />
              <LanguageSelector />
              <button
                onClick={() => navigate('/autor/profile')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre || 'Usuario'} {user?.apellidos || ''}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role ? i18n.t(`role.${user.role}`) : i18n.t('role.author')}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer" style={{ backgroundColor: FESC_RED }}>
                  {user?.nombre?.charAt(0) || 'U'}
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}