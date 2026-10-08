import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Languages,
  Paperclip,
  Scale,
  Send,
  Users,
} from 'lucide-react';
import { submissionService, SubmissionDetail as Submission } from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';

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
  const [selectedTimelineStage, setSelectedTimelineStage] = useState<number | null>(null);

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

  const handleFileAction = async (file: Submission['archivos'][number], download: boolean) => {
    const previewWindow = download ? null : window.open('about:blank', '_blank');
    if (!download && !previewWindow) {
      setFileError('El navegador bloqueó la nueva pestaña. Permite las ventanas emergentes e inténtalo de nuevo.');
      return;
    }

    const actionId = String(file.id);
    setFileActionId(actionId);
    setFileError(null);

    try {
      const blob = await submissionService.getFileContent(file.id, download);
      const objectUrl = URL.createObjectURL(blob);

      if (download) {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = file.nombre_original;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else if (previewWindow) {
        previewWindow.location.href = objectUrl;
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (cause) {
      previewWindow?.close();
      console.error(`Error al obtener el archivo ${file.id}:`, cause);
      setFileError(cause instanceof Error ? cause.message : 'No fue posible abrir el archivo.');
    } finally {
      setFileActionId(null);
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
            {isDraft ? 'Borrador' : formatStatus(submission.estado)}
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
            {isDraft ? 'Borrador sin enviar' : formatStatus(submission.estado || submission.status || '')}
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
              La decisión registrada para este artículo es: {formatStatus(submission.estado || submission.status || '')}.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          {isDraft ? 'Fecha de envío: pendiente' : `Fecha de envío: ${formatDate(submission.fecha_envio)}`}
        </p>
      </section>

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
                            onClick={() => void handleFileAction(file, false)}
                            disabled={fileActionId !== null}
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                            title="Ver PDF"
                            aria-label={`Ver ${file.nombre_original}`}
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleFileAction(file, true)}
                          disabled={fileActionId !== null}
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          title="Descargar archivo"
                          aria-label={`Descargar ${file.nombre_original}`}
                        >
                          <Download className="w-4 h-4 text-gray-600" />
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

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5" style={{ color: FESC_RED }} /> Comentarios editoriales
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {submission.comentarios_editor || 'No hay comentarios editoriales registrados.'}
        </p>
      </section>
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

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    enviado: 'Enviado',
    en_revision: 'En revisión',
    revisiones_requeridas: 'Revisiones requeridas',
    revisions_required: 'Revisiones requeridas',
    aceptado: 'Aceptado',
    accepted: 'Aceptado',
    rechazado: 'Rechazado',
    rejected: 'Rechazado',
    publicado: 'Publicado',
    published: 'Publicado',
    submitted: 'Enviado',
    under_review: 'En revisión',
  };
  return labels[status.toLocaleLowerCase()] || status || 'Sin estado';
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
