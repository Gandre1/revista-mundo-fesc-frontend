import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Mail, Send, Inbox, Trash2, Search, Filter, FileText, User, Calendar, Paperclip, Eye, MailOpen } from 'lucide-react';
import { storage, Message } from '../lib/storage';
import { useAuth } from './auth-context';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function Mensajeria() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'recibidos' | 'enviados' | 'nuevo'>('recibidos');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  // Nuevo mensaje
  const [newMessage, setNewMessage] = useState({
    destinatarioId: '',
    asunto: '',
    contenido: '',
    submissionId: ''
  });

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMessages = () => {
    if (!user) return;
    
    const allMessages = storage.getMessages();
    let filtered: Message[] = [];

    if (user.role === 'admin') {
      // Admin ve TODOS los mensajes
      filtered = allMessages;
    } else if (user.role === 'author') {
      // Autor ve solo sus mensajes (enviados y recibidos)
      filtered = allMessages.filter(
        m => m.remitenteId === user.id || m.destinatarioId === user.id
      );
    } else if (user.role === 'reviewer') {
      // Revisor ve solo mensajes relacionados con sus asignaciones
      filtered = allMessages.filter(
        m => m.remitenteId === user.id || m.destinatarioId === user.id
      );
    }

    setMessages(filtered);
  };

  const getReceivedMessages = () => {
    return messages.filter(m => 
      user?.role === 'admin' ? true : m.destinatarioId === user?.id
    );
  };

  const getSentMessages = () => {
    return messages.filter(m => 
      user?.role === 'admin' ? true : m.remitenteId === user?.id
    );
  };

  const getFilteredMessages = () => {
    const messagesForView = view === 'recibidos' ? getReceivedMessages() : getSentMessages();
    
    if (!searchQuery) return messagesForView;
    
    return messagesForView.filter(m =>
      m.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contenido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.remitenteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.destinatarioNombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const users = storage.getUsers();
    const destinatario = users.find(u => u.id === newMessage.destinatarioId);
    
    if (!destinatario) {
      alert('Seleccione un destinatario válido');
      return;
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      asunto: newMessage.asunto,
      contenido: newMessage.contenido,
      remitenteId: user.id,
      remitenteNombre: `${user.nombre} ${user.apellidos || ''}`.trim(),
      destinatarioId: destinatario.id,
      destinatarioNombre: `${destinatario.nombre} ${destinatario.apellidos || ''}`.trim(),
      fecha: new Date().toISOString(),
      leido: false,
      submissionId: newMessage.submissionId || undefined
    };

    storage.addMessage(message);
    
    setNewMessage({
      destinatarioId: '',
      asunto: '',
      contenido: '',
      submissionId: ''
    });
    
    setShowCompose(false);
    setView('enviados');
    loadMessages();
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    
    // Marcar como leído si es el destinatario
    if (message.destinatarioId === user?.id && !message.leido) {
      storage.markMessageAsRead(message.id);
      loadMessages();
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('¿Está seguro de eliminar este mensaje?')) {
      storage.deleteMessage(id);
      setSelectedMessage(null);
      loadMessages();
    }
  };

  const getUsers = () => {
    const users = storage.getUsers();
    return users.filter(u => u.id !== user?.id);
  };

  const unreadCount = getReceivedMessages().filter(m => !m.leido && m.destinatarioId === user?.id).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: FESC_GRAY }}>
          Mensajería
        </h1>
        <p className="text-gray-600">
          {user?.role === 'admin' && 'Vista completa de todos los mensajes del sistema'}
          {user?.role === 'author' && 'Gestiona tu comunicación con editores y revisores'}
          {user?.role === 'reviewer' && 'Comunicación relacionada con tus revisiones'}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <button
              onClick={() => setShowCompose(!showCompose)}
              className="w-full px-4 py-2.5 rounded text-white font-medium mb-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: FESC_RED }}
            >
              <Send className="w-4 h-4" />
              Nuevo mensaje
            </button>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setView('recibidos');
                  setSelectedMessage(null);
                  setShowCompose(false);
                }}
                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                  view === 'recibidos' ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
                style={view === 'recibidos' ? { color: FESC_RED } : { color: FESC_GRAY }}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  <span>Recibidos</span>
                </div>
                {unreadCount > 0 && (
                  <span 
                    className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                    style={{ backgroundColor: FESC_RED }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setView('enviados');
                  setSelectedMessage(null);
                  setShowCompose(false);
                }}
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                  view === 'enviados' ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
                style={view === 'enviados' ? { color: FESC_RED } : { color: FESC_GRAY }}
              >
                <Mail className="w-4 h-4" />
                <span>Enviados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
          {/* Compose Form */}
          {showCompose && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: FESC_GRAY }}>
                Nuevo mensaje
              </h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: FESC_GRAY }}>
                    Destinatario <span style={{ color: FESC_RED }}>*</span>
                  </label>
                  <select
                    value={newMessage.destinatarioId}
                    onChange={(e) => setNewMessage({ ...newMessage, destinatarioId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: FESC_RED }}
                    required
                  >
                    <option value="">Seleccionar destinatario...</option>
                    {getUsers().map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellidos} ({u.role === 'admin' ? 'Administrador' : u.role === 'author' ? 'Autor' : 'Revisor'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: FESC_GRAY }}>
                    Asunto <span style={{ color: FESC_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newMessage.asunto}
                    onChange={(e) => setNewMessage({ ...newMessage, asunto: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    placeholder="Ingrese el asunto del mensaje"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: FESC_GRAY }}>
                    Mensaje <span style={{ color: FESC_RED }}>*</span>
                  </label>
                  <textarea
                    value={newMessage.contenido}
                    onChange={(e) => setNewMessage({ ...newMessage, contenido: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    rows={6}
                    placeholder="Escriba su mensaje aquí..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: FESC_GRAY }}>
                    ID de Envío (opcional)
                  </label>
                  <input
                    type="text"
                    value={newMessage.submissionId}
                    onChange={(e) => setNewMessage({ ...newMessage, submissionId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    placeholder="Ej: SUB-2024-001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Asocia este mensaje con un artículo específico
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    style={{ backgroundColor: FESC_RED }}
                  >
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-6 py-2.5 bg-gray-200 rounded text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages List or Detail */}
          {!showCompose && !selectedMessage && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar mensajes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {getFilteredMessages().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">
                      {view === 'recibidos' ? 'No hay mensajes recibidos' : 'No hay mensajes enviados'}
                    </p>
                  </div>
                ) : (
                  getFilteredMessages().map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !message.leido && message.destinatarioId === user?.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.leido && message.destinatarioId === user?.id && (
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: FESC_RED }}
                              />
                            )}
                            <span className="font-semibold text-gray-900">
                              {view === 'recibidos' ? message.remitenteNombre : message.destinatarioNombre}
                            </span>
                            {user?.role === 'admin' && (
                              <span className="text-xs text-gray-500">
                                ({view === 'recibidos' ? 'De' : 'Para'}: {view === 'recibidos' ? message.remitenteNombre : message.destinatarioNombre})
                              </span>
                            )}
                          </div>
                          
                          <h3 className={`mb-1 ${!message.leido && message.destinatarioId === user?.id ? 'font-semibold' : 'font-normal'}`} style={{ color: FESC_GRAY }}>
                            {message.asunto}
                          </h3>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {message.contenido}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(message.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                            {message.submissionId && (
                              <Link
                                to={`/admin/submissions/${message.submissionId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 hover:underline"
                                style={{ color: FESC_RED }}
                              >
                                <FileText className="w-3 h-3" />
                                {message.submissionId}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Message Detail */}
          {!showCompose && selectedMessage && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-sm hover:underline flex items-center gap-1"
                    style={{ color: FESC_RED }}
                  >
                    ← Volver
                  </button>
                  
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Eliminar mensaje"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold mb-4" style={{ color: FESC_GRAY }}>
                  {selectedMessage.asunto}
                </h2>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      <strong>De:</strong> {selectedMessage.remitenteNombre}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      <strong>Para:</strong> {selectedMessage.destinatarioNombre}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedMessage.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {selectedMessage.submissionId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" style={{ color: FESC_RED }} />
                      <span className="text-gray-700">
                        Relacionado con el envío: <strong>{selectedMessage.submissionId}</strong>
                      </span>
                    </div>
                    <Link
                      to={`/admin/submissions/${selectedMessage.submissionId}`}
                      className="text-sm hover:underline"
                      style={{ color: FESC_RED }}
                    >
                      Ver envío →
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.contenido}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
