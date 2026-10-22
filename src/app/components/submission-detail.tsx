import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  ClipboardCheck,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Languages,
  Loader2,
  Maximize,
  Minimize,
  Paperclip,
  Scale,
  Send,
  CheckCircle,
  MessageSquareText,
  ThumbsDown,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ReviewerSummary,
  submissionService,
  SubmissionDetail as Submission,
} from '../../services/submissionService';
import {
  getSubmissionStatusLabel,
  normalizeSubmissionStatus,
} from '../lib/submission-status';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Textarea } from './ui/textarea';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';

const EDITORIAL_DECISIONS = [
  { status: 'en_revision', label: 'Aprobar para evaluación', Icon: ClipboardCheck, color: '#1d4ed8' },
  { status: 'revisiones_requeridas', label: 'Solicitar correcciones', Icon: MessageSquareText, color: '#c2410c' },
  { status: 'aceptado', label: 'Aceptar artículo', Icon: CheckCircle, color: '#15803d' },
  { status: 'rechazado', label: 'Rechazar artículo', Icon: ThumbsDown, color: '#b91c1c' },
] as const;

const EDITORIAL_STAGES = [
  { label: 'Enviado', description: 'El artículo fue recibido por la revista.', Icon: Send },
  { label: 'En revisión', description: 'El equipo editorial coordina la evaluación del artículo.', Icon: ClipboardCheck },
  { label: 'Decisión editorial', description: 'La decisión editorial se comunica al autor.', Icon: Scale },
  { label: 'Aceptado / En edición', description: 'El artículo aceptado avanza hacia su preparación editorial.', Icon: BookOpen },
  { label: 'Publicado', description: 'El artículo está disponible en la revista.', Icon: Check },
];

interface SubmissionDetailProps {
  submissionId?: string;
  onBack?: () => void;
}

export function SubmissionDetail({ submissionId, onBack }: SubmissionDetailProps) {
  const { id: routeId } = useParams();
  const id = submissionId || routeId;
  const location = useLocation();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileActionId, setFileActionId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<Submission['archivos'][number] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLElement>(null);
  const [selectedTimelineStage, setSelectedTimelineStage] = useState<number | null>(null);
  const [reviewers, setReviewers] = useState<ReviewerSummary[]>([]);
  const [reviewersLoading, setReviewersLoading] = useState(false);
  const [reviewersError, setReviewersError] = useState<string | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [savingReviewAssignment, setSavingReviewAssignment] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<(typeof EDITORIAL_DECISIONS)[number] | null>(null);
  const [editorialComment, setEditorialComment] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);
  const isEditorRoute = location.pathname.startsWith('/editor');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsPreviewFullscreen(document.fullscreenElement === previewContainerRef.current);
    };

    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  useEffect(() => {
    let active = true;

    if (!id) {
      setSubmission(null);
      setError('No se recibió el identificador del artículo.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);

    submissionService.getSubmissionById(id)
      .then(({ submission: result }) => {
        if (active) setSubmission(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          console.error(`Error al cargar el envío ${id}:`, cause);
          setSubmission(null);
          setError(cause instanceof Error ? cause.message : 'No fue posible consultar el artículo.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isEditorRoute) return;

    let active = true;
    setReviewersLoading(true);
    setReviewersError(null);

    submissionService.getReviewers()
      .then(({ reviewers: result }) => {
        if (active) setReviewers(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          console.error('Error al cargar la lista de revisores:', cause);
          setReviewersError(cause instanceof Error ? cause.message : 'No fue posible cargar los revisores.');
        }
      })
      .finally(() => {
        if (active) setReviewersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isEditorRoute]);

  const returnToList = () => {
    if (onBack) {
      onBack();
      return;
    }

    const basePath = location.pathname.startsWith('/autor')
      ? '/autor/envios'
      : location.pathname.startsWith('/revisor')
        ? '/revisor/asignados'
        : location.pathname.startsWith('/editor')
          ? '/editor/submissions'
          : '/admin/submissions';
    navigate(basePath);
  };

  const handleFileDownload = async (file: Submission['archivos'][number]) => {
    const actionId = String(file.id);
    setFileActionId(actionId);
    setFileError(null);

    try {
      const blob = await submissionService.getFileContent(file.id, true);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = file.nombre_original;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (cause) {
      console.error(`Error al obtener el archivo ${file.id}:`, cause);
      setFileError(cause instanceof Error ? cause.message : 'No fue posible descargar el archivo.');
    } finally {
      setFileActionId(null);
    }
  };

  const handlePreviewFile = async (file: Submission['archivos'][number]) => {
    setPreviewFile(file);
    setPreviewUrl(null);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewZoom(100);
    setFileError(null);
    setFileActionId(String(file.id));

    try {
      const blob = await submissionService.getFileContent(file.id);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (cause) {
      console.error(`Error al cargar el visor del archivo ${file.id}:`, cause);
      setPreviewLoading(false);
      setPreviewError(cause instanceof Error ? cause.message : 'No fue posible cargar el archivo PDF.');
    } finally {
      setFileActionId(null);
    }
  };

  const togglePreviewFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await previewContainerRef.current?.requestFullscreen();
      }
    } catch (cause) {
      console.error('No fue posible cambiar el visor a pantalla completa:', cause);
      setPreviewError('No fue posible activar la pantalla completa en este navegador.');
    }
  };

  const assignReviewer = async () => {
    if (!id || !selectedReviewerId || !reviewDeadline) return;

    setSavingReviewAssignment(true);
    setReviewersError(null);
    try {
      await submissionService.assignReviewer(id, selectedReviewerId, reviewDeadline);
      const { submission: updatedSubmission } = await submissionService.getSubmissionById(id);
      setSubmission(updatedSubmission);
      setSelectedReviewerId('');
      setReviewDeadline('');
      toast.success('Revisor asignado y fecha límite registrada.');
    } catch (cause) {
      console.error(`Error al asignar un revisor al envío ${id}:`, cause);
      const message = cause instanceof Error ? cause.message : 'No fue posible asignar el revisor.';
      setReviewersError(message);
      toast.error(message);
    } finally {
      setSavingReviewAssignment(false);
    }
  };

  const confirmEditorialDecision = async () => {
    if (!id || !submission || !selectedDecision || savingDecision) return;

    const previousStatus = submission.estado;
    const previousComment = submission.comentarios_editor;
    const comment = editorialComment.trim();
    setSavingDecision(true);
    setSubmission({
      ...submission,
      estado: selectedDecision.status,
      ...(comment ? { comentarios_editor: comment } : {}),
    });

    try {
      await submissionService.updateSubmissionStatus(id, selectedDecision.status, comment || undefined);
      toast.success(`Estado actualizado: ${selectedDecision.label}.`);
      setSelectedDecision(null);
      setEditorialComment('');
    } catch (cause) {
      console.error(`Error al registrar la decisión editorial para el envío ${id}:`, cause);
      setSubmission({
        ...submission,
        estado: previousStatus,
        comentarios_editor: previousComment,
      });
      toast.error(cause instanceof Error ? cause.message : 'No fue posible registrar la decisión editorial.');
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Cargando información del artículo...</div>;
  }

  if (error || !submission) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-gray-200 mt-6 max-w-xl mx-auto shadow-sm">
        <h2 className="text-xl font-bold text-gray-700">
          {error?.includes('404') || error?.toLocaleLowerCase().includes('no encontrado')
            ? 'Envío no encontrado'
            : 'No se pudo cargar el artículo'}
        </h2>
        <p role="alert" className="text-sm text-gray-500 mt-1">
          {error || 'La respuesta del servidor no contiene información para este artículo.'}
        </p>
        <button
          type="button"
          onClick={returnToList}
          className="mt-4 px-4 py-2 text-white text-sm rounded font-medium"
          style={{ backgroundColor: FESC_RED }}
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const files = submission.archivos || [];
  const authors = submission.autores || [];
  const isDraft = submission.borrador === true || submission.borrador === 1;
  const currentTimelineStage = isDraft
    ? -1
    : getEditorialStageIndex(submission.estado || submission.status, submission.paso_envio);
  const visibleTimelineStage = selectedTimelineStage ?? Math.max(currentTimelineStage, 0);
  const selectedStage = EDITORIAL_STAGES[visibleTimelineStage];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <button
        type="button"
        onClick={returnToList}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a la lista
      </button>

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
              ID: {submission.id}
            </span>
            <h1 className="text-2xl font-bold mt-3" style={{ color: FESC_DARK_RED }}>
              {submission.titulo || 'Sin título'}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Autor principal: <strong>{submission.autor_nombre}</strong>
              {submission.autor_email && ` · ${submission.autor_email}`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Editor asignado: <strong>{submission.editor_nombre || 'Sin asignar'}</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {isDraft ? 'Borrador sin enviar' : `Enviado: ${formatDate(submission.fecha_envio)}`}
              {submission.created_at && ` · Creado: ${formatDate(submission.created_at)}`}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
            {isDraft ? 'Borrador' : getSubmissionStatusLabel(submission.estado)}
          </span>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b pb-3 mb-5">
          <div>
            <h2 className="font-semibold text-lg" style={{ color: FESC_DARK_RED }}>Proceso editorial</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona una etapa para consultar en qué consiste.</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start"
            style={{ backgroundColor: isDraft ? '#f3f4f6' : '#fee2e2', color: isDraft ? '#4b5563' : FESC_DARK_RED }}
          >
            {isDraft ? 'Borrador sin enviar' : getSubmissionStatusLabel(submission.estado || submission.status)}
          </span>
        </div>

        <ol aria-label="Etapas del proceso editorial" className="flex overflow-x-auto pb-2">
          {EDITORIAL_STAGES.map(({ label, Icon }, index) => {
            const isCurrent = index === currentTimelineStage;
            const isComplete = currentTimelineStage >= 0 && index < currentTimelineStage;
            const isSelected = index === visibleTimelineStage;

            return (
              <li key={label} className="flex min-w-[148px] flex-1 items-start">
                <button
                  type="button"
                  onClick={() => setSelectedTimelineStage(index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-pressed={isSelected}
                  aria-label={`${index + 1}. ${label}${isCurrent ? ', etapa actual' : isComplete ? ', completada' : ''}`}
                  className="group flex w-full flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
                  style={{ '--tw-ring-color': FESC_RED } as React.CSSProperties}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors"
                    style={{
                      borderColor: isCurrent || isComplete ? FESC_RED : '#d1d5db',
                      backgroundColor: isCurrent ? FESC_RED : isComplete ? '#fee2e2' : '#fff',
                      color: isCurrent ? '#fff' : isComplete ? FESC_DARK_RED : '#6b7280',
                    }}
                  >
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span
                    className="mt-2 px-1 text-xs font-semibold leading-snug"
                    style={{ color: isCurrent || isSelected ? FESC_DARK_RED : isComplete ? '#4b5563' : '#6b7280' }}
                  >
                    {index + 1}. {label}
                  </span>
                  <span className="mt-1 text-[11px] text-gray-500">
                    {isCurrent ? 'Etapa actual' : isComplete ? 'Completada' : 'Pendiente'}
                  </span>
                </button>
                {index < EDITORIAL_STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mt-5 h-0.5 min-w-4 flex-1"
                    style={{ backgroundColor: isComplete ? FESC_RED : '#e5e7eb' }}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-md border-l-4 bg-gray-50 p-3" style={{ borderLeftColor: FESC_RED }}>
          <p className="text-sm font-semibold text-gray-800">
            {visibleTimelineStage + 1}. {selectedStage.label}
            {visibleTimelineStage === currentTimelineStage && !isDraft && ' · Etapa actual'}
          </p>
          <p className="mt-1 text-sm text-gray-600">{selectedStage.description}</p>
          {isDraft && (
            <p className="mt-1 text-xs text-gray-500">
              El proceso editorial comienza cuando el artículo se envía a la revista.
            </p>
          )}
          {isRejectedStatus(submission.estado || submission.status) && visibleTimelineStage === currentTimelineStage && (
            <p className="mt-1 text-xs font-medium text-gray-600">
              La decisión registrada para este artículo es: {getSubmissionStatusLabel(submission.estado || submission.status)}.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          {isDraft ? 'Fecha de envío: pendiente' : `Fecha de envío: ${formatDate(submission.fecha_envio)}`}
        </p>
      </section>

      {isEditorRoute && (
        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-3 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5" style={{ color: FESC_RED }} />
            Decisión editorial
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Registra una decisión para este artículo. Puedes añadir observaciones para el autor.
          </p>
          <div className="flex flex-wrap gap-3">
            {EDITORIAL_DECISIONS.map(({ status, label, Icon, color }) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setEditorialComment('');
                  setSelectedDecision(EDITORIAL_DECISIONS.find((decision) => decision.status === status) ?? null);
                }}
                disabled={
                  isDraft ||
                  savingDecision ||
                  normalizeSubmissionStatus(submission.estado || submission.status) === status
                }
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          {isDraft && (
            <p className="mt-3 text-sm text-gray-500">
              Las decisiones editoriales estarán disponibles cuando el artículo haya sido enviado.
            </p>
          )}
        </section>
      )}

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: FESC_RED }} /> Información del artículo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <DetailField label="Sección" value={submission.seccion} />
          <DetailField label="Idioma" value={submission.idioma} />
          <DetailField label="Palabras clave" value={submission.palabras_clave} />
          <DetailField label="Paso del envío" value={String(submission.paso_wizard)} />
        </div>
        <div className="mt-5">
          <h3 className="text-xs font-bold text-gray-600 uppercase mb-2">Resumen</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {submission.resumen || 'No se registró un resumen.'}
          </p>
        </div>
        <div className="mt-5">
          <h3 className="text-xs font-bold text-gray-600 uppercase mb-2">Referencias</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {submission.referencias || 'No se registraron referencias.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: FESC_RED }} /> Autores y colaboradores
          </h2>
          {authors.length === 0 ? (
            <p className="text-sm text-gray-500">No hay autores adicionales registrados.</p>
          ) : (
            <div className="space-y-4">
              {authors.map((author) => (
                <article key={author.id} className="text-sm border-b last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-gray-800">
                    {author.nombre} {author.apellidos}
                    {(author.es_corresponsal === true || author.es_corresponsal === 1) && (
                      <span className="ml-2 text-xs text-gray-500">(corresponsal)</span>
                    )}
                  </p>
                  <p className="text-gray-600">{author.email}</p>
                  <p className="text-gray-500">
                    {[author.afiliacion, author.pais].filter(Boolean).join(' · ') || 'Sin afiliación registrada'}
                  </p>
                  {author.orcid && <p className="text-xs text-gray-500">ORCID: {author.orcid}</p>}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
            <Paperclip className="w-5 h-5" style={{ color: FESC_RED }} /> Archivos adjuntos
          </h2>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">No hay archivos adjuntos registrados.</p>
          ) : (
            <>
              <div className="space-y-3">
                {files.map((file) => {
                  const isPdf = file.nombre_original.toLocaleLowerCase().endsWith('.pdf');

                  return (
                    <div key={file.id} className="flex items-start justify-between gap-3 text-sm">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 break-all">{file.nombre_original}</p>
                          <p className="text-xs text-gray-500">
                            {file.tipo} · {formatFileSize(file.tamano)} · {formatDate(file.fecha_subida)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isPdf && (
                          <button
                            type="button"
                            onClick={() => void handlePreviewFile(file)}
                            disabled={fileActionId !== null}
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                            title="Ver PDF en la página"
                            aria-label={`Ver ${file.nombre_original} en la página`}
                          >
                            {fileActionId === String(file.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleFileDownload(file)}
                          disabled={fileActionId !== null}
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          title="Descargar archivo"
                          aria-label={`Descargar ${file.nombre_original}`}
                        >
                          {fileActionId === String(file.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                          ) : (
                            <Download className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {fileError && (
                <p role="alert" className="mt-3 text-sm text-red-600">{fileError}</p>
              )}
            </>
          )}
        </section>
      </div>

      {previewFile && (
        <section
          ref={previewContainerRef}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
            isPreviewFullscreen
              ? 'flex h-screen max-h-screen w-screen flex-col overflow-hidden rounded-none border-0 p-3 sm:p-4'
              : 'p-4 sm:p-6'
          }`}
          aria-label={`Visor de ${previewFile.nombre_original}`}
        >
          <div className={`flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${
            isPreviewFullscreen ? 'mb-3 shrink-0' : 'mb-4'
          }`}>
            <div className="min-w-0">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 shrink-0" style={{ color: FESC_RED }} />
                Visor de manuscrito
              </h2>
              <p className="mt-1 text-sm text-gray-600 break-all">{previewFile.nombre_original}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewLoading(true);
                  setPreviewZoom((zoom) => Math.max(50, zoom - 10));
                }}
                disabled={!previewUrl || previewZoom <= 50}
                className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Reducir zoom"
                title="Reducir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-sm text-gray-600" aria-live="polite">
                {previewZoom}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewLoading(true);
                  setPreviewZoom((zoom) => Math.min(200, zoom + 10));
                }}
                disabled={!previewUrl || previewZoom >= 200}
                className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Aumentar zoom"
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer');
                }}
                disabled={!previewUrl}
                className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Abrir en pestaña nueva</span>
              </button>
              <button
                type="button"
                onClick={() => void handleFileDownload(previewFile)}
                disabled={fileActionId !== null}
                className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {fileActionId === String(previewFile.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Descargar PDF</span>
              </button>
              <button
                type="button"
                onClick={() => void togglePreviewFullscreen()}
                disabled={!previewUrl}
                className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                aria-label={isPreviewFullscreen ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
              >
                {isPreviewFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isPreviewFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                </span>
              </button>
            </div>
          </div>
          {previewError ? (
            <p
              role="alert"
              className={`rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${
                isPreviewFullscreen ? 'flex-1' : ''
              }`}
            >
              No se pudo cargar el PDF: {previewError}
            </p>
          ) : (
            <div className={`relative overflow-auto rounded-md bg-gray-100 ${
              isPreviewFullscreen ? 'min-h-0 flex-1' : 'min-h-[60vh]'
            }`}>
              {previewLoading && (
                <div className={`absolute inset-0 z-10 flex items-center justify-center bg-white/90 ${
                  isPreviewFullscreen ? '' : 'min-h-[60vh]'
                }`}>
                  <div className="flex items-center gap-2 text-sm text-gray-600" role="status">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando documento PDF...
                  </div>
                </div>
              )}
              {previewUrl && (
                <iframe
                  key={`${previewFile.id}-${previewZoom}`}
                  src={`${previewUrl}#toolbar=1&navpanes=0&zoom=${previewZoom}`}
                  title={`Documento PDF: ${previewFile.nombre_original}`}
                  className={`w-full border-0 ${
                    isPreviewFullscreen ? 'h-full min-h-0' : 'h-[70vh] min-h-[60vh]'
                  }`}
                  onLoad={() => setPreviewLoading(false)}
                  onError={() => {
                    setPreviewLoading(false);
                    setPreviewError('El navegador no pudo mostrar el contenido del PDF.');
                  }}
                />
              )}
            </div>
          )}
        </section>
      )}

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5" style={{ color: FESC_RED }} /> Comentarios editoriales
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {submission.comentarios_editor || 'No hay comentarios editoriales registrados.'}
        </p>
      </section>

      {isEditorRoute && (
        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-3 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" style={{ color: FESC_RED }} />
            Revisores y fechas límite
          </h2>

          {reviewersError && (
            <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {reviewersError}
            </p>
          )}

          {(submission.revisores?.length ?? 0) > 0 ? (
            <div className="mb-5 space-y-2">
              {submission.revisores?.map((review) => (
                <div key={review.id} className="flex flex-col gap-1 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{review.reviewer_nombre}</p>
                    <p className="text-xs text-gray-500">{review.estado || 'Revisión asignada'}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Fecha límite: <strong>{formatDate(review.fecha_limite)}</strong>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-5 text-sm text-gray-500">Todavía no hay revisores asignados a este envío.</p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <label className="block text-sm font-medium text-gray-700">
              Revisor / evaluador
              <select
                value={selectedReviewerId}
                onChange={(event) => setSelectedReviewerId(event.target.value)}
                disabled={reviewersLoading || reviewers.length === 0 || savingReviewAssignment}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">
                  {reviewersLoading ? 'Cargando revisores...' : 'Seleccionar revisor'}
                </option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {[reviewer.nombre, reviewer.apellidos].filter(Boolean).join(' ')} · {reviewer.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Fecha límite de revisión
              <input
                type="date"
                value={reviewDeadline}
                onChange={(event) => setReviewDeadline(event.target.value)}
                disabled={savingReviewAssignment}
                min={new Date().toISOString().slice(0, 10)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
            <button
              type="button"
              onClick={() => void assignReviewer()}
              disabled={!selectedReviewerId || !reviewDeadline || savingReviewAssignment || reviewersLoading}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: FESC_DARK_RED }}
            >
              {savingReviewAssignment ? 'Asignando...' : 'Asignar revisor'}
            </button>
          </div>
        </section>
      )}

      <AlertDialog
        open={selectedDecision !== null}
        onOpenChange={(open) => {
          if (!open && !savingDecision) setSelectedDecision(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedDecision?.label}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción actualizará el estado editorial de “{submission.titulo || 'este artículo'}”.
              {selectedDecision?.status === 'rechazado' && ' La decisión de rechazo quedará registrada.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Observaciones para el autor (opcional)
            <Textarea
              value={editorialComment}
              onChange={(event) => setEditorialComment(event.target.value)}
              disabled={savingDecision}
              maxLength={5000}
              placeholder="Escribe las observaciones editoriales..."
              className="min-h-28"
            />
          </label>
          <AlertDialogFooter>
            <button
              type="button"
              onClick={() => setSelectedDecision(null)}
              disabled={savingDecision}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmEditorialDecision()}
              disabled={savingDecision}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: FESC_DARK_RED }}
            >
              {savingDecision ? 'Guardando...' : 'Confirmar decisión'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-600 uppercase mb-1">{label}</h3>
      <p className="text-gray-700 whitespace-pre-line">{value || 'No registrado'}</p>
    </div>
  );
}

function getEditorialStageIndex(status: string | null | undefined, pasoEnvio: number | string | null | undefined): number {
  const normalizedStatus = normalizeEditorialStatus(status || '');
  const statusStages: Record<string, number> = {
    nuevo: 0,
    enviado: 0,
    submitted: 0,
    recibido: 1,
    en_revision: 1,
    en_evaluacion: 1,
    evaluacion: 1,
    under_review: 1,
    revisiones_requeridas: 2,
    revisions_required: 2,
    decision: 2,
    decision_editorial: 2,
    rechazado: 2,
    rejected: 2,
    aceptado: 3,
    accepted: 3,
    aprobado: 3,
    approved: 3,
    en_edicion: 3,
    aceptado_en_edicion: 3,
    en_publicacion: 3,
    publicado: 4,
    published: 4,
  };

  if (normalizedStatus in statusStages) return statusStages[normalizedStatus];
  if (typeof pasoEnvio === 'number' && Number.isInteger(pasoEnvio) && pasoEnvio >= 1 && pasoEnvio <= EDITORIAL_STAGES.length) {
    return pasoEnvio - 1;
  }

  const normalizedStep = normalizeEditorialStatus(String(pasoEnvio || ''));
  return statusStages[normalizedStep] ?? -1;
}

function normalizeEditorialStatus(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');
}

function isRejectedStatus(status: string | null | undefined): boolean {
  const normalizedStatus = normalizeEditorialStatus(status || '');
  return normalizedStatus === 'rechazado' || normalizedStatus === 'rejected';
}

function formatDate(value: string | null): string {
  if (!value) return 'Pendiente';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-ES');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
