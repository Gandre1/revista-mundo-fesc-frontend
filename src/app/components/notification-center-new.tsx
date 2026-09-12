import { Bell, X, CheckCircle, AlertTriangle, Info, FileText, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Link } from 'react-router';

const FESC_RED = '#e30513';
const FESC_GRAY = '#3c3c3b';

const TYPE_ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  danger: AlertTriangle,
};

const TYPE_COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  danger: '#ef4444',
};

export function NotificationCenterNew() {
  const [notifications, setNotifications] = useState(storage.getNotifications());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(storage.getNotifications());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = storage.getUnreadCount();

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    setNotifications(storage.getNotifications());
  };

  const handleMarkAllAsRead = () => {
    storage.markAllNotificationsAsRead();
    setNotifications(storage.getNotifications());
  };

  const handleDelete = (id: string) => {
    storage.deleteNotification(id);
    setNotifications(storage.getNotifications());
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" style={{ color: FESC_GRAY }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-5 h-5 text-white text-xs font-semibold rounded-full flex items-center justify-center"
            style={{ backgroundColor: FESC_RED }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: FESC_GRAY }}>
                Notificaciones ({unreadCount})
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs hover:underline"
                    style={{ color: FESC_RED }}
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = TYPE_ICONS[notification.tipo] || Info;
                    const iconColor = TYPE_COLORS[notification.tipo] || '#3b82f6';

                    return (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.leida ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${iconColor}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold" style={{ color: FESC_GRAY }}>
                                {notification.titulo}
                              </p>
                              {!notification.leida && (
                                <span
                                  className="flex-shrink-0 w-2 h-2 rounded-full"
                                  style={{ backgroundColor: FESC_RED }}
                                />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {notification.mensaje}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(notification.fecha)}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.submissionId && (
                                  <Link
                                    to={`/admin/submissions/${notification.submissionId}`}
                                    className="text-xs hover:underline"
                                    style={{ color: FESC_RED }}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    Ver envío
                                  </Link>
                                )}
                                {!notification.leida && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs hover:underline"
                                    style={{ color: FESC_RED }}
                                  >
                                    Marcar leída
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
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
        </>
      )}
    </div>
  );
}
