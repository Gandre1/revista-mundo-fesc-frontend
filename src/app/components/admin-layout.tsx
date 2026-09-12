import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Inbox, LogOut, BookOpen, Menu, X, ChevronRight, BarChart3, User, PlusCircle, Mail, HelpCircle, ListTodo, Settings, FileText, Users, TrendingUp } from 'lucide-react';
import { NotificationCenterNew } from './notification-center-new';
import { LanguageSelector } from './language-selector';
import { useAuth } from './auth-context';
import { i18n } from '../lib/i18n';

interface AdminLayoutProps {
  children: ReactNode;
}

const FESC_RED = '#e30513';

export function AdminLayout({ children }: AdminLayoutProps) {
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
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Envíos', href: '/admin/submissions', icon: Inbox },
    { name: 'Revisiones', href: '/admin/reviews', icon: FileText },
    { name: 'Tareas', href: '/admin/tasks', icon: ListTodo },
    { name: 'Mensajería', href: '/admin/mensajeria', icon: Mail },
    { name: 'Estadísticas', href: '/admin/statistics', icon: TrendingUp },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Ayuda', href: '/admin/help', icon: HelpCircle },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
    { name: 'Mi Perfil', href: '/admin/profile', icon: User },
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
              <p className="text-xs text-gray-500">{i18n.t('layout.adminPanel')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto h-[calc(100vh-240px)]">
          {/* Sección: Envíos */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.submissions')}
            </h3>
            <Link
              to="/admin/new-submission"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/new-submission')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/new-submission') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.newSubmission')}
            </Link>
            <Link
              to="/admin/submissions"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/submissions')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/submissions') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.allSubmissions')}
            </Link>
            <Link
              to="/admin/numeros"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/numeros')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/numeros') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.issues')}
            </Link>
            <Link
              to="/admin/doi"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/doi')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/doi') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.doi')}
            </Link>
          </div>

          {/* Sección: Ajustes */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.settings')}
            </h3>
            <Link
              to="/admin/settings/revista"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/settings/revista')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/settings/revista') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.journal')}
            </Link>
            <Link
              to="/admin/settings/sitio-web"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/settings/sitio-web')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/settings/sitio-web') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.website')}
            </Link>
            <Link
              to="/admin/settings/flujo-trabajo"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/settings/flujo-trabajo')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/settings/flujo-trabajo') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.workflow')}
            </Link>
            <Link
              to="/admin/settings/distribucion"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/settings/distribucion')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/settings/distribucion') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.distribution')}
            </Link>
            <Link
              to="/admin/users"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/users')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/users') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.usersRoles')}
            </Link>
          </div>

          {/* Sección: Estadísticas */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.statistics')}
            </h3>
            <Link
              to="/admin/statistics/articulos"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/articulos')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/articulos') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.articles')}
            </Link>
            <Link
              to="/admin/statistics/numeros"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/numeros')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/numeros') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.issues')}
            </Link>
            <Link
              to="/admin/statistics/revista"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/revista')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/revista') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.magazine')}
            </Link>
            <Link
              to="/admin/statistics/actividad-editorial"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/actividad-editorial')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/actividad-editorial') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.editorialActivity')}
            </Link>
            <Link
              to="/admin/statistics/usuarios"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/usuarios')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/usuarios') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.users')}
            </Link>
            <Link
              to="/admin/statistics/contador-iis"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/contador-iis')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/contador-iis') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.reviewReport')}
            </Link>
            <Link
              to="/admin/statistics/informes"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/statistics/informes')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/statistics/informes') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.views')}
            </Link>
          </div>

          {/* Sección: Herramientas */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.tools')}
            </h3>
            <Link
              to="/admin/tools/administracion"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/tools/administracion')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/tools/administracion') ? FESC_RED : undefined,
              }}
            >
              {i18n.t('menu.administration')}
            </Link>
          </div>

          {/* Sección: Comunicación */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              {i18n.t('menu.communication')}
            </h3>
            <Link
              to="/admin/mensajeria"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/mensajeria')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/mensajeria') ? FESC_RED : undefined,
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
              to="/admin/profile"
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                isActive('/admin/profile')
                  ? 'font-semibold'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={{
                color: isActive('/admin/profile') ? FESC_RED : undefined,
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
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenterNew />
              <button
                onClick={() => navigate('/admin/profile')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre || 'Usuario'} {user?.apellidos || ''}</p>
                  <p className="text-xs text-gray-500">{i18n.t('role.administrator')}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer" style={{ backgroundColor: FESC_RED }}>
                  {user?.nombre?.charAt(0) || 'U'}
                </div>
              </button>
              <LanguageSelector />
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