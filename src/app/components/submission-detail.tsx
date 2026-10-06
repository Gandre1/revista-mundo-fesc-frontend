import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen, Download, Eye, FileText, Languages, Paperclip, Users } from 'lucide-react';
import { submissionService, SubmissionDetail as Submission } from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';

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
    aceptado: 'Aceptado',
    rechazado: 'Rechazado',
    publicado: 'Publicado',
  };
  return labels[status.toLocaleLowerCase()] || status || 'Sin estado';
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
