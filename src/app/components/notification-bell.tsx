import { Bell, CheckCircle2, ExternalLink, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './auth-context';
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_GRAY = '#3c3c3b';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications(await getNotifications());
    } catch {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      getNotifications()
        .then(setNotifications)
        .catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = notifications.filter((notification) =>
    notification.is_read === false || notification.is_read === 0
  ).length;

  const handleMarkAsRead = async (notification: Notification) => {
    const id = String(notification.id);
    if (notification.is_read === true || notification.is_read === 1 || markingId === id) return;

    setMarkingId(id);
    try {
      await markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((item) =>
          String(item.id) === id ? { ...item, is_read: true } : item
        )
      );
    } catch {
      setError('No se pudo marcar la notificación como leída');
    } finally {
      setMarkingId(null);
    }
  };

  const getNotificationRoute = (submissionId: string) => {
    const roleRoutes: Record<string, string> = {
      admin: '/admin/submissions',
      editor: '/editor/submissions',
      reviewer: '/revisor/asignados',
      author: '/autor/envios',
    };
    const baseRoute = roleRoutes[user?.role || ''];
    return baseRoute ? `${baseRoute}/${encodeURIComponent(submissionId)}` : null;
  };

  const handleOpenNotification = async (notification: Notification) => {
    if (!notification.submission_id) return;

    if (notification.is_read === false || notification.is_read === 0) {
      await handleMarkAsRead(notification);
    }

    const route = getNotificationRoute(String(notification.submission_id));
    if (route) {
      setIsOpen(false);
      navigate(route);
    }
  };

  const handleDelete = async (notification: Notification) => {
    const id = String(notification.id);
    setDeletingId(id);
    try {
      await deleteNotification(id);
      setNotifications((current) => current.filter((item) => String(item.id) !== id));
    } catch {
      setError('No se pudo eliminar la notificación');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearNotifications();
      setNotifications([]);
      setError(null);
    } catch {
      setError('No se pudieron limpiar las notificaciones');
    } finally {
      setIsClearing(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffInSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) void loadNotifications();
        }}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Bell className="w-5 h-5" style={{ color: FESC_GRAY }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-white text-xs font-semibold rounded-full flex items-center justify-center"
            style={{ backgroundColor: FESC_RED }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[min(384px,calc(100vw-2rem))] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: FESC_GRAY }}>
              Notificaciones {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={() => void handleClearAll()}
                  className="text-xs font-medium hover:underline disabled:opacity-50"
                  style={{ color: FESC_RED }}
                >
                  {isClearing ? 'Limpiando...' : 'Limpiar todas'}
                </button>
              )}
              <button
                type="button"
                aria-label="Cerrar notificaciones"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                <div className="w-5 h-5 mx-auto mb-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                Cargando notificaciones...
              </div>
            ) : error ? (
              <div className="py-10 px-4 text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadNotifications()}
                  className="text-xs font-medium hover:underline"
                  style={{ color: FESC_RED }}
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const isRead = notification.is_read === true || notification.is_read === 1;
                  const id = String(notification.id);
                  return (
                    <div
                      key={id}
                      role="menuitem"
                      tabIndex={notification.submission_id ? 0 : undefined}
                      onClick={() => notification.submission_id && void handleOpenNotification(notification)}
                      onKeyDown={(event) => {
                        if (notification.submission_id && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          void handleOpenNotification(notification);
                        }
                      }}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notification.submission_id ? 'cursor-pointer' : ''} ${!isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" style={{ color: FESC_RED }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold" style={{ color: FESC_GRAY }}>
                              {notification.title}
                            </p>
                            {!isRead && <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full" style={{ backgroundColor: FESC_RED }} />}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-400">{getTimeAgo(notification.created_at)}</span>
                            <div className="flex items-center gap-2">
                              {notification.submission_id && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleOpenNotification(notification);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                                  style={{ color: FESC_RED }}
                                >
                                  Ver envío
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                              {!isRead && (
                                <button
                                  type="button"
                                  disabled={markingId === id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleMarkAsRead(notification);
                                  }}
                                  className="text-xs font-medium hover:underline disabled:opacity-50"
                                  style={{ color: FESC_RED }}
                                >
                                  {markingId === id ? 'Marcando...' : 'Marcar leída'}
                                </button>
                              )}
                              <button
                                type="button"
                                aria-label="Eliminar notificación"
                                disabled={deletingId === id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleDelete(notification);
                                }}
                                className="p-1 hover:bg-red-50 rounded disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
