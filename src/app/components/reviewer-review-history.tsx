import { useEffect, useState } from 'react';
import { Download, Eye, FileText, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  openReviewerReviewAttachment,
  ReviewerRecommendation,
  ReviewerReviewHistoryEntry,
  StructuredReviewerComments,
  submissionService,
} from '../../services/submissionService';
import { useAuth } from './auth-context';

const RECOMMENDATION_LABELS: Record<ReviewerRecommendation, string> = {
  aceptar: 'Aceptar',
  revisiones_menores: 'Aceptar con revisiones menores',
  revisiones_mayores: 'Solicitar revisiones mayores',
  rechazar: 'Rechazar',
};

function getEditorComments(value: StructuredReviewerComments | string | null): StructuredReviewerComments {
  const empty = {
    fortalezas: '',
    debilidades: '',
    metodologia: '',
    comentario_confidencial: '',
  };
  if (!value) return empty;
  if (typeof value !== 'string') return { ...empty, ...value };

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return empty;
    const comments = parsed as Record<string, unknown>;
    return {
      fortalezas: typeof comments.fortalezas === 'string' ? comments.fortalezas : '',
      debilidades: typeof comments.debilidades === 'string' ? comments.debilidades : '',
      metodologia: typeof comments.metodologia === 'string' ? comments.metodologia : '',
      comentario_confidencial: typeof comments.comentario_confidencial === 'string'
        ? comments.comentario_confidencial
        : '',
    };
  } catch {
    return { ...empty, comentario_confidencial: value };
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'Fecha no disponible';
  return new Date(value.replace(' ', 'T')).toLocaleString('es-ES');
}

export function ReviewerReviewHistory() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewerReviewHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAttachment, setActiveAttachment] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    submissionService.getReviewerReviewHistory()
      .then(({ reviews: result }) => {
        if (active) setReviews(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          console.error('Error al cargar el historial de dictámenes:', cause);
          setError(cause instanceof Error ? cause.message : 'No fue posible cargar el historial.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openAttachment = async (review: ReviewerReviewHistoryEntry, download: boolean) => {
    if (!user?.id || !review.archivo_nombre || activeAttachment) return;
    setActiveAttachment(String(review.id));
    try {
      await openReviewerReviewAttachment(
        review.submission_id,
        user.id,
        review.id,
        review.archivo_nombre,
        download
      );
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No fue posible abrir el archivo de anotaciones.');
    } finally {
      setActiveAttachment(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-gray-900">
          <History className="h-7 w-7 text-red-700" />
          Historial de dictámenes
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Consulta las evaluaciones que ya enviaste, sus comentarios y los archivos con anotaciones.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Cargando historial...
        </p>
      ) : !error && reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <History className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-600">Aún no has enviado dictámenes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const editorComments = getEditorComments(review.comentarios_editor);
            const commentSections: [string, string][] = [
              ['Fortalezas y aportes', editorComments.fortalezas],
              ['Debilidades y aspectos por mejorar', editorComments.debilidades],
              ['Observaciones sobre metodología', editorComments.metodologia],
              ['Recomendación confidencial al editor', editorComments.comentario_confidencial],
            ].filter(([, comment]) => Boolean(comment.trim()));

            return (
              <article key={review.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {review.titulo || 'Manuscrito sin título'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {review.seccion || 'Sin sección'} · Enviado: {formatDate(review.fecha_dictamen)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {(review.recomendacion && RECOMMENDATION_LABELS[review.recomendacion]) || 'Dictamen enviado'}
                  </span>
                </div>

                <section className="mt-4">
                  <h2 className="text-xs font-bold uppercase text-gray-700">Comentarios para el autor</h2>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-800">
                    {review.comentarios_autor || 'Sin comentarios registrados.'}
                  </p>
                </section>

                <section className="mt-4 rounded-md border border-amber-200 bg-amber-50/60 p-4">
                  <h2 className="text-xs font-bold uppercase text-amber-950">Comentarios confidenciales para el editor</h2>
                  {commentSections.length ? (
                    <div className="mt-3 space-y-3">
                      {commentSections.map(([label, comment]) => (
                        <div key={label}>
                          <h3 className="text-xs font-semibold text-gray-700">{label}</h3>
                          <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">Sin comentarios confidenciales.</p>
                  )}
                </section>

                {review.archivo_nombre && (
                  <div className="mt-4 flex flex-col gap-3 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-5 w-5 shrink-0 text-gray-500" />
                      <div className="min-w-0">
                        <p className="break-all text-sm font-medium text-gray-800">{review.archivo_nombre}</p>
                        {review.archivo_tamano !== null && (
                          <p className="text-xs text-gray-500">{(review.archivo_tamano / 1024 / 1024).toFixed(2)} MB</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {review.archivo_nombre.toLocaleLowerCase().endsWith('.pdf') && (
                        <button
                          type="button"
                          onClick={() => void openAttachment(review, false)}
                          disabled={activeAttachment !== null}
                          className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {activeAttachment === String(review.id)
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Eye className="h-4 w-4" />}
                          Ver PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void openAttachment(review, true)}
                        disabled={activeAttachment !== null}
                        className="inline-flex items-center gap-2 rounded bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
