import { Bell, X, CheckCircle, AlertTriangle, Info, FileText } from 'lucide-react';
import { useState } from 'react';

const FESC_RED = '#e30513';
const FESC_GRAY = '#3c3c3b';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'submission';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'submission',
    title: 'Nuevo envío recibido',
    message: 'María González ha enviado un nuevo artículo: "Análisis de tendencias..."',
    time: 'Hace 5 minutos',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Revisión pendiente',
    message: 'El artículo #2024-015 está esperando revisión desde hace 7 días',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Artículo aceptado',
    message: 'El artículo #2024-012 ha sido aceptado para publicación',
    time: 'Hace 1 día',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Recordatorio',
    message: 'La fecha límite para la próxima edición es en 15 días',
    time: 'Hace 2 días',
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
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
            className="absolute top-0 right-0 w-5 h-5 text-xs text-white rounded-full flex items-center justify-center"
            style={{ backgroundColor: FESC_RED }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: FESC_GRAY }}>
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs hover:underline"
                  style={{ color: FESC_RED }}
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                className="text-sm hover:underline"
                style={{ color: FESC_RED }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'submission':
        return <FileText className="w-5 h-5" style={{ color: FESC_RED }} />;
    }
  };

  return (
    <div
      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm mb-1 ${!notification.read ? 'font-semibold' : ''}`}
              style={{ color: FESC_GRAY }}
            >
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
          <p className="text-xs text-gray-400">{notification.time}</p>
        </div>
      </div>
    </div>
  );
}
