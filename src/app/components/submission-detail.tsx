import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { 
  Search, Upload, HelpCircle, X, Bold, Italic, Underline, Link as LinkIcon, Code, 
  Maximize2, Image as ImageIcon, ChevronDown, FileText, Download, Clock, User,
  MessageSquare, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2
} from 'lucide-react';
import { useSubmissions, type Comment, type Review } from './submission-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';
const FESC_BLUE = '#0891b2';

type WorkflowStage = 'submission' | 'review' | 'copyediting' | 'production';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: '#6b7280', action: 'submitted', actionLabel: 'Enviar a revisión' },
  submitted: { label: 'Enviado', color: '#0891b2', action: 'in-review', actionLabel: 'Iniciar revisión' },
  'in-review': { label: 'En revisión', color: '#f59e0b', action: 'accepted', actionLabel: 'Aceptar' },
  'revisions-required': { label: 'Revisiones requeridas', color: '#f97316', action: 'in-review', actionLabel: 'Reenviar a revisión' },
  accepted: { label: 'Aceptado', color: '#10b981', action: 'published', actionLabel: 'Publicar' },
  rejected: { label: 'Rechazado', color: '#ef4444', action: null, actionLabel: null },
  published: { label: 'Publicado', color: '#8b5cf6', action: null, actionLabel: null },
};

export function SubmissionDetail() {
  const { id } = useParams();
  const { getSubmission, addComment, addReview, updateReview, changeStatus, addActivityLog } = useSubmissions();
  const submission = getSubmission(id!);

  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'workflow' | 'publication'>('workflow');
  const [activeStage, setActiveStage] = useState<WorkflowStage>('review');
  const [showDiscussionDialog, setShowDiscussionDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const [discussionForm, setDiscussionForm] = useState({
    participants: ['admin'],
    subject: '',
    message: '',
    isPrivate: true,
  });

  const [reviewForm, setReviewForm] = useState({
    reviewerId: '',
    reviewerName: '',
  });

  const [statusChangeForm, setStatusChangeForm] = useState({
    newStatus: '',
    comments: '',
  });

  const workflowStages = [
    { key: 'submission', label: 'Envío' },
    { key: 'review', label: 'Revisión' },
    { key: 'copyediting', label: 'Edición' },
    { key: 'production', label: 'Producción' },
  ];

  const mockReviewers = [
    { id: 'rev1', name: 'Dra. Ana Martínez', specialty: 'Metodología' },
    { id: 'rev2', name: 'Dr. Luis Fernández', specialty: 'Estadística' },
    { id: 'rev3', name: 'Dra. Carmen Torres', specialty: 'Investigación' },
    { id: 'rev4', name: 'Dr. Roberto Sánchez', specialty: 'Análisis' },
  ];

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Envío no encontrado</p>
          <Link
            to="/admin/submissions"
            className="mt-4 inline-block px-4 py-2 text-white rounded"
            style={{ backgroundColor: FESC_BLUE }}
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const handleAddDiscussion = () => {
    if (discussionForm.subject && discussionForm.message) {
      const newComment: Omit<Comment, 'id' | 'timestamp'> = {
        userId: 'admin',
        userName: 'Administrador',
        userRole: 'Editor',
        text: `**${discussionForm.subject}**\n\n${discussionForm.message}`,
        isPrivate: discussionForm.isPrivate,
      };
      addComment(id!, newComment);
      addActivityLog(id!, 'Discusión añadida', 'admin', 'Administrador', discussionForm.subject);
      setDiscussionForm({ participants: ['admin'], subject: '', message: '', isPrivate: true });
      setShowDiscussionDialog(false);
    }
  };

  const handleAddReviewer = () => {
    if (reviewForm.reviewerId && reviewForm.reviewerName) {
      const newReview: Omit<Review, 'id' | 'dateAssigned'> = {
        reviewerId: reviewForm.reviewerId,
        reviewerName: reviewForm.reviewerName,
        status: 'pending',
      };
      addReview(id!, newReview);
      addActivityLog(id!, 'Revisor asignado', 'admin', 'Administrador', reviewForm.reviewerName);
      setReviewForm({ reviewerId: '', reviewerName: '' });
      setShowReviewDialog(false);
    }
  };

  const handleStatusChange = () => {
    if (statusChangeForm.newStatus) {
      changeStatus(id!, statusChangeForm.newStatus as any);
      if (statusChangeForm.comments) {
        addComment(id!, {
          userId: 'admin',
          userName: 'Administrador',
          userRole: 'Editor',
          text: statusChangeForm.comments,
          isPrivate: true,
        });
      }
      setShowStatusDialog(false);
      setStatusChangeForm({ newStatus: '', comments: '' });
    }
  };

  const getAuthorName = () => {
    const principal = submission.colaboradores.find((c) => c.isPrincipal);
    if (principal) return `${principal.nombre} ${principal.apellidos}`;
    if (submission.colaboradores.length > 0) {
      const first = submission.colaboradores[0];
      return `${first.nombre} ${first.apellidos}`;
    }
    return 'Sin autor';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              <Link to="/admin/submissions" className="hover:underline" style={{ color: FESC_BLUE }}>
                ← Volver a la lista
              </Link>
              <span className="mx-2">/</span>
              <span className="mr-2">#{submission.number}</span>
              <span className="mx-2">/</span>
              <span className="mr-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                {getAuthorName()}
              </span>
              <span className="mx-2">/</span>
              <span>{submission.titulo || 'Sin título'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  color: STATUS_CONFIG[submission.status].color,
                  backgroundColor: `${STATUS_CONFIG[submission.status].color}20`,
                }}
              >
                {STATUS_CONFIG[submission.status].label}
              </span>
              <Link to="#" className="text-sm hover:underline" style={{ color: FESC_BLUE }}>
                <Eye size={14} className="inline mr-1" />
                Previsualizar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveWorkflowTab('workflow')}
              className={`px-4 py-4 text-sm relative ${
                activeWorkflowTab === 'workflow' ? '' : 'text-gray-600'
              }`}
              style={{
                color: activeWorkflowTab === 'workflow' ? FESC_GRAY : undefined,
                borderBottom: activeWorkflowTab === 'workflow' ? `3px solid ${FESC_BLUE}` : '3px solid transparent',
                fontFamily: "'Roboto', Calibri, sans-serif",
                fontWeight: activeWorkflowTab === 'workflow' ? 600 : 400,
              }}
            >
              Flujo de trabajo
            </button>
            <button
              onClick={() => setActiveWorkflowTab('publication')}
              className={`px-4 py-4 text-sm relative ${
                activeWorkflowTab === 'publication' ? '' : 'text-gray-600'
              }`}
              style={{
                color: activeWorkflowTab === 'publication' ? FESC_GRAY : undefined,
                borderBottom: activeWorkflowTab === 'publication' ? `3px solid ${FESC_BLUE}` : '3px solid transparent',
                fontFamily: "'Roboto', Calibri, sans-serif",
                fontWeight: activeWorkflowTab === 'publication' ? 600 : 400,
              }}
            >
              Publicación
            </button>
          </div>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="bg-gray-200 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {workflowStages.map((stage) => (
                <button
                  key={stage.key}
                  onClick={() => setActiveStage(stage.key as WorkflowStage)}
                  className={`px-6 py-3 text-sm relative ${
                    activeStage === stage.key ? 'bg-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{
                    color: activeStage === stage.key ? FESC_BLUE : undefined,
                    fontFamily: "'Roboto', Calibri, sans-serif",
                    fontWeight: activeStage === stage.key ? 600 : 400,
                    borderBottom: activeStage === stage.key ? `3px solid ${FESC_BLUE}` : 'none',
                  }}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 py-3">
              <HelpCircle size={18} style={{ color: FESC_BLUE }} />
              <span className="text-sm" style={{ color: FESC_BLUE }}>
                Ayuda
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions */}
            <div className="bg-white rounded border border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Acciones
                </h3>
                <div className="flex items-center gap-2">
                  {STATUS_CONFIG[submission.status].actionLabel && (
                    <button
                      onClick={() => setShowStatusDialog(true)}
                      className="px-4 py-2 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: FESC_BLUE }}
                    >
                      {STATUS_CONFIG[submission.status].actionLabel}
                    </button>
                  )}
                  <button
                    onClick={() => setShowStatusDialog(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cambiar estado
                  </button>
                </div>
              </div>
            </div>

            {/* Archivos de envío */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Archivos de envío
                </h3>
                <button
                  onClick={() => setShowFileDialog(true)}
                  className="px-3 py-1.5 text-sm rounded hover:opacity-90"
                  style={{ backgroundColor: FESC_BLUE, color: 'white' }}
                >
                  Cargar archivo
                </button>
              </div>
              <div className="p-4">
                {submission.files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No hay archivos cargados
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submission.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText size={20} style={{ color: FESC_BLUE }} />
                          <div>
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • v{file.version} • {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded" title="Descargar">
                            <Download size={16} className="text-gray-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded" title="Ver">
                            <Eye size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revisores */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Revisores
                </h3>
                <button
                  onClick={() => setShowReviewDialog(true)}
                  className="px-3 py-1.5 text-sm rounded hover:opacity-90"
                  style={{ backgroundColor: FESC_BLUE, color: 'white' }}
                >
                  Añadir revisor
                </button>
              </div>
              <div className="p-4">
                {submission.reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No hay revisores asignados
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submission.reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium">{review.reviewerName}</div>
                            <div className="text-xs text-gray-500">
                              Asignado: {new Date(review.dateAssigned).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: review.status === 'completed' ? '#d1fae5' : review.status === 'in-progress' ? '#fef3c7' : '#f3f4f6',
                              color: review.status === 'completed' ? '#065f46' : review.status === 'in-progress' ? '#92400e' : '#6b7280',
                            }}
                          >
                            {review.status === 'completed' ? 'Completado' : review.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                          </span>
                        </div>
                        {review.recommendation && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Recomendación: </span>
                            <span
                              style={{
                                color: review.recommendation === 'accept' ? '#10b981' : review.recommendation === 'decline' ? '#ef4444' : '#f59e0b',
                              }}
                            >
                              {review.recommendation === 'accept' ? 'Aceptar' : review.recommendation === 'decline' ? 'Rechazar' : 'Revisiones requeridas'}
                            </span>
                          </div>
                        )}
                        {review.comments && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {review.comments}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Discusiones */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Discusiones y Comentarios
                </h3>
                <button
                  onClick={() => setShowDiscussionDialog(true)}
                  className="px-3 py-1.5 text-sm rounded hover:opacity-90"
                  style={{ backgroundColor: FESC_BLUE, color: 'white' }}
                >
                  Añadir comentario
                </button>
              </div>
              <div className="p-4">
                {submission.comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No hay comentarios
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submission.comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 pl-4 py-2" style={{ borderColor: comment.isPrivate ? FESC_RED : FESC_BLUE }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.userName}</span>
                            <span className="text-xs text-gray-500">({comment.userRole})</span>
                            {comment.isPrivate && (
                              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#fee2e2', color: FESC_RED }}>
                                Privado
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del envío */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Información
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Sección</div>
                  <div className="font-medium">{submission.seccion}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Idioma</div>
                  <div className="font-medium">{submission.idioma === 'es' ? 'Español' : 'Inglés'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Fecha de envío</div>
                  <div className="font-medium">
                    {submission.dateSubmitted ? new Date(submission.dateSubmitted).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'No enviado'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Última modificación</div>
                  <div className="font-medium">
                    {new Date(submission.lastModified).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Participantes */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Participantes
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {submission.assignedEditor && (
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Editor asignado</div>
                    <div className="font-medium flex items-center gap-2">
                      <User size={16} />
                      {submission.assignedEditorName}
                    </div>
                  </div>
                )}
                <div className="text-sm">
                  <div className="text-gray-500 mb-2">Autores ({submission.colaboradores.length})</div>
                  <div className="space-y-2">
                    {submission.colaboradores.map((collab) => (
                      <div key={collab.id} className="flex items-start gap-2">
                        <User size={14} className="mt-0.5 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {collab.nombre} {collab.apellidos}
                            {collab.isPrincipal && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#cffafe', color: '#0891b2' }}>
                                Principal
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{collab.email}</div>
                          {collab.afiliacion && (
                            <div className="text-xs text-gray-500">{collab.afiliacion}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Registro de actividad */}
            <div className="bg-white rounded border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-300">
                <h3 className="text-base" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif", fontWeight: 600 }}>
                  Registro de actividad
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {submission.activityLog.slice().reverse().map((log) => (
                    <div key={log.id} className="text-sm border-l-2 border-gray-300 pl-3">
                      <div className="font-medium text-gray-700">{log.action}</div>
                      <div className="text-xs text-gray-500">
                        {log.userName} • {new Date(log.timestamp).toLocaleString('es-ES')}
                      </div>
                      {log.details && <div className="text-xs text-gray-600 mt-1">{log.details}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Discussion Dialog */}
      <Dialog open={showDiscussionDialog} onOpenChange={setShowDiscussionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Añadir comentario
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="subject" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Asunto <span style={{ color: FESC_RED }}>*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={discussionForm.subject}
                onChange={(e) => setDiscussionForm({ ...discussionForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Mensaje <span style={{ color: FESC_RED }}>*</span>
              </label>
              <textarea
                id="message"
                value={discussionForm.message}
                onChange={(e) => setDiscussionForm({ ...discussionForm, message: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={discussionForm.isPrivate}
                onChange={(e) => setDiscussionForm({ ...discussionForm, isPrivate: e.target.checked })}
                className="w-4 h-4 rounded"
                style={{ accentColor: FESC_BLUE }}
              />
              <label htmlFor="isPrivate" className="text-sm">
                Comentario privado (solo visible para editores)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDiscussionDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDiscussion}
                disabled={!discussionForm.subject || !discussionForm.message}
                className="px-4 py-2 text-sm text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: FESC_BLUE }}
              >
                Añadir comentario
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Reviewer Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Asignar revisor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Seleccione un revisor para evaluar este envío. El revisor recibirá una notificación por correo electrónico.
            </p>

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Revisor <span style={{ color: FESC_RED }}>*</span>
              </label>
              <select
                value={reviewForm.reviewerId}
                onChange={(e) => {
                  const reviewer = mockReviewers.find((r) => r.id === e.target.value);
                  setReviewForm({
                    reviewerId: e.target.value,
                    reviewerName: reviewer?.name || '',
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccione un revisor</option>
                {mockReviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name} - {reviewer.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowReviewDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddReviewer}
                disabled={!reviewForm.reviewerId}
                className="px-4 py-2 text-sm text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: FESC_BLUE }}
              >
                Asignar revisor
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
              Cambiar estado del envío
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Estado actual
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    color: STATUS_CONFIG[submission.status].color,
                    backgroundColor: `${STATUS_CONFIG[submission.status].color}20`,
                  }}
                >
                  {STATUS_CONFIG[submission.status].label}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Nuevo estado <span style={{ color: FESC_RED }}>*</span>
              </label>
              <select
                value={statusChangeForm.newStatus}
                onChange={(e) => setStatusChangeForm({ ...statusChangeForm, newStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccione un estado</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} disabled={key === submission.status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusComments" className="block text-sm mb-2" style={{ color: FESC_GRAY, fontWeight: 600 }}>
                Comentarios (opcional)
              </label>
              <textarea
                id="statusComments"
                value={statusChangeForm.comments}
                onChange={(e) => setStatusChangeForm({ ...statusChangeForm, comments: e.target.value })}
                rows={4}
                placeholder="Agregue comentarios sobre este cambio de estado..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowStatusDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!statusChangeForm.newStatus}
                className="px-4 py-2 text-sm text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: FESC_BLUE }}
              >
                Cambiar estado
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
