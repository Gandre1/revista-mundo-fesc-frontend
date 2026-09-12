import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, FileText, User, Calendar, MessageSquare, Send, Trash2 } from 'lucide-react';
import { storage, Comment } from '../lib/storage';
import { useAuth } from './auth-context';
import { Toast } from './toast';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Nuevo': { bg: '#dbeafe', text: '#1e40af' },
  'En revisión': { bg: '#fef3c7', text: '#92400e' },
  'Revisiones requeridas': { bg: '#fed7aa', text: '#9a3412' },
  'Aceptado': { bg: '#d1fae5', text: '#065f46' },
  'Rechazado': { bg: '#fee2e2', text: '#991b1b' },
  'Publicado': { bg: '#ede9fe', text: '#5b21b6' },
};

export function SubmissionDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(storage.getSubmissionById(id!));
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'detalles' | 'comentarios' | 'historial'>('detalles');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setSubmission(storage.getSubmissionById(id!));
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Envío no encontrado</p>
          <Link
            to="/admin/submissions"
            className="px-4 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: FESC_RED }}
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    if (confirm(`¿Cambiar estado a "${newStatus}"?`)) {
      storage.updateSubmission(id!, { estado: newStatus as any });
      setSubmission(storage.getSubmissionById(id!));
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        texto: newComment,
        autor: `${user.nombre} ${user.apellidos || ''}`.trim(),
        fecha: new Date().toISOString(),
        tipo: user.role === 'admin' ? 'interno' : 'autor'
      };
      
      // Agregar comentario
      storage.addComment(id!, comment);
      
      // Limpiar input
      setNewComment('');
      
      // Actualizar submission inmediatamente
      const updatedSubmission = storage.getSubmissionById(id!);
      setSubmission(updatedSubmission);
      
      // Mostrar toast
      setToastMessage('Comentario agregado exitosamente');
      setShowToast(true);
    }
  };

  const handleDelete = () => {
    if (confirm('¿Está seguro de eliminar este envío? Esta acción no se puede deshacer.')) {
      storage.deleteSubmission(id!);
      navigate('/admin/submissions');
    }
  };

  const statuses = ['Nuevo', 'En revisión', 'Revisiones requeridas', 'Aceptado', 'Rechazado', 'Publicado'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/submissions"
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: FESC_GRAY }} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-500">{submission.id}</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: STATUS_COLORS[submission.estado]?.bg || '#f3f4f6',
                  color: STATUS_COLORS[submission.estado]?.text || '#374151'
                }}
              >
                {submission.estado}
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              {submission.titulo}
            </h1>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['detalles', 'comentarios', 'historial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'border-b-2' : ''
                }`}
                style={{
                  color: activeTab === tab ? FESC_RED : FESC_GRAY,
                  borderColor: activeTab === tab ? FESC_RED : 'transparent'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Detalles */}
          {activeTab === 'detalles' && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                    Estado
                  </label>
                  <select
                    value={submission.estado}
                    onChange={(e) => handleStatusChange(e.target.value)}
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
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                    Fecha de envío
                  </label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    {new Date(submission.fechaEnvio).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                    Sección
                  </label>
                  <p className="text-gray-700">{submission.seccion}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                    Idioma
                  </label>
                  <p className="text-gray-700">{submission.idioma}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: FESC_GRAY }}>
                    Editor asignado
                  </label>
                  <select
                    value={submission.editorAsignado || ''}
                    onChange={(e) => {
                      storage.updateSubmission(id!, { editorAsignado: e.target.value });
                      setSubmission(storage.getSubmissionById(id!));
                    }}
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
                  >
                    <option value="">Sin asignar</option>
                    <option value="Dr. Pedro Sánchez">Dr. Pedro Sánchez</option>
                    <option value="Dra. Ana Martínez">Dra. Ana Martínez</option>
                    <option value="Dr. Luis Fernández">Dr. Luis Fernández</option>
                    <option value="Dra. Carmen Torres">Dra. Carmen Torres</option>
                  </select>
                </div>
              </div>

              {/* Resumen */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: FESC_GRAY }}>
                  Resumen
                </h3>
                <p className="text-gray-700 leading-relaxed">{submission.resumen}</p>
              </div>

              {/* Palabras clave */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: FESC_GRAY }}>
                  Palabras clave
                </h3>
                <div className="flex flex-wrap gap-2">
                  {submission.palabrasClave.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Autores */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: FESC_GRAY }}>
                  Autores
                </h3>
                <div className="space-y-3">
                  {submission.autores.map((autor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: FESC_GRAY }}>
                          {autor.nombre} {autor.apellidos}
                          {autor.esCorresponsal && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${FESC_RED}20`, color: FESC_RED }}>
                              Corresponsal
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">{autor.email}</p>
                        <p className="text-sm text-gray-500">{autor.afiliacion} - {autor.pais}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archivo */}
              {submission.archivo && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: FESC_GRAY }}>
                    Archivo del artículo
                  </h3>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded border border-gray-200">
                    <FileText className="w-8 h-8" style={{ color: FESC_RED }} />
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: FESC_GRAY }}>
                        {submission.archivo.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(submission.archivo.tamano / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Comentarios */}
          {activeTab === 'comentarios' && (
            <div className="space-y-6">
              {/* Lista de comentarios */}
              <div className="space-y-4">
                {submission.comentarios.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">No hay comentarios todavía</p>
                  </div>
                ) : (
                  submission.comentarios.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded border-l-4" style={{ borderLeftColor: FESC_RED }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: FESC_GRAY }}>
                          {comment.autor}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.texto}</p>
                      <span
                        className="inline-block mt-2 text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: comment.tipo === 'interno' ? '#dbeafe' : '#fef3c7',
                          color: comment.tipo === 'interno' ? '#1e40af' : '#92400e'
                        }}
                      >
                        {comment.tipo}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Nuevo comentario */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: FESC_GRAY }}>
                  Agregar comentario
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
                    placeholder="Escriba su comentario aquí..."
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
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: FESC_RED }}
                  >
                    <Send className="w-4 h-4" />
                    Enviar comentario
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Historial */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-6">
                  {/* Envío creado */}
                  <div className="relative flex gap-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: FESC_RED }}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold" style={{ color: FESC_GRAY }}>
                        Artículo enviado
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.autorNombre} envió el artículo para revisión
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(submission.fechaEnvio).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Comentarios en el historial */}
                  {submission.comentarios.map((comment, index) => (
                    <div key={comment.id} className="relative flex gap-4">
                      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold" style={{ color: FESC_GRAY }}>
                          Comentario agregado
                        </p>
                        <p className="text-sm text-gray-600">
                          {comment.autor}: {comment.texto.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}