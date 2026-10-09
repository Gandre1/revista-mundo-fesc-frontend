import { CheckCircle, Clock, Download, Eye, FileText, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { submissionService } from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

interface SubmissionItem {
  id: string;
  titulo?: string;
  seccion?: string;
  fecha_envio?: string | null;
  created_at?: string | null;
  createdAt?: string;
  fechaEnvio?: string;
  estado: string;
  borrador?: boolean | number | string;
  paso_wizard?: number;
  total_archivos?: number;
}

export function DashboardAutor() {
  const location = useLocation();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSubmissionId, setActionSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    void fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submissionService.getMySubmissions();
      // Si la API responde { submissions: [...] } o directamente el array
      const list = Array.isArray(data) ? data : data?.submissions || [];
      setSubmissions(list);
    } catch (cause) {
      console.error('Error cargando los envíos del autor:', cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar tus artículos.');
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de estadísticas dinámicas según la BD
  const stats = {
    total: submissions.length,
    borradores: submissions.filter(isDraft).length,
    enRevision: submissions.filter(s => s.estado === 'En revisión' || s.estado === 'en_revision' || s.estado === 'recibido').length,
    aceptados: submissions.filter(s => s.estado === 'Aceptado' || s.estado === 'aceptado' || s.estado === 'publicado').length,
    rechazados: submissions.filter(s => s.estado === 'Rechazado' || s.estado === 'rechazado').length,
  };

  // Obtener envíos recientes (últimos 5)
  const enviosOrdenados = [...submissions]
    .sort((a, b) => {
      const dateA = getSubmissionDate(a)?.getTime() || 0;
      const dateB = getSubmissionDate(b)?.getTime() || 0;
      return dateB - dateA;
    });
  const enviosRecientes = location.pathname === '/autor/envios'
    ? enviosOrdenados
    : enviosOrdenados.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Mis envíos
        </h1>
        <p className="text-sm text-gray-600">
          Gestiona tus artículos enviados a Revista Mundo FESC
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<FileText className="w-6 h-6" />}
          title="Total"
          value={stats.total}
          subtitle="Artículos"
          color={FESC_RED}
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="En revisión"
          value={stats.enRevision}
          subtitle="Pendientes"
          color="#f59e0b"
        />
        <MetricCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Aceptados"
          value={stats.aceptados}
          subtitle="Aprobados"
          color="#10b981"
        />
        <MetricCard
          icon={<XCircle className="w-6 h-6" />}
          title="Rechazados"
          value={stats.rechazados}
          subtitle="No aceptados"
          color="#ef4444"
        />
      </div>

      {/* Envíos recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            Actividad reciente
          </h2>
          <Link
            to="/autor/envios"
            className="text-sm hover:underline"
            style={{ color: FESC_RED }}
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Cargando tus artículos...
          </div>
        ) : enviosRecientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No has enviado ningún artículo aún</p>
            <Link
              to="/autor/new-submission"
              className="mt-4 inline-block px-4 py-2 text-white rounded text-sm hover:opacity-90"
              style={{ backgroundColor: FESC_RED }}
            >
              Enviar mi primer artículo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enviosRecientes.map((submission) => {
              const submissionDate = getSubmissionDate(submission);
              const dateLabel = submission.fecha_envio || submission.fechaEnvio ? 'Enviado' : 'Creado';
              const formattedDate = submissionDate
                ? `${dateLabel}: ${submissionDate.toLocaleDateString('es-ES')}`
                : 'Fecha no disponible';
              const draft = isDraft(submission);
              const isActionInProgress = actionSubmissionId === submission.id;

              return (
                <div
                  key={submission.id}
                  className="flex flex-col gap-4 p-4 border border-gray-200 rounded hover:border-gray-300 transition-all sm:flex-row sm:items-center"
                >
                  <Link
                    to={`/autor/envios/${submission.id}`}
                    className="flex flex-1 min-w-0 items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {submission.titulo || 'Sin título'}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {submission.seccion || 'Artículos de Investigación'} • {formattedDate}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: getStatusColor(submission.estado) + '20',
                        color: getStatusColor(submission.estado),
                      }}
                    >
                      {getStatusLabel(submission.estado)}
                    </span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {draft ? (
                      <>
                        <Link
                          to={`/autor/new-submission/${submission.id}`}
                          className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                          style={{ backgroundColor: FESC_RED }}
                        >
                          <FileText className="h-4 w-4" />
                          Continuar
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDeleteDraft(submission)}
                          disabled={isActionInProgress}
                          className="inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isActionInProgress ? 'Eliminando...' : 'Eliminar borrador'}
                        </button>
                      </>
                    ) : (
                      <Link
                        to={`/autor/envios/${submission.id}`}
                        className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDownloadFiles(submission)}
                      disabled={isActionInProgress}
                      className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                      style={{ borderColor: FESC_RED, color: FESC_DARK_RED }}
                    >
                      <Download className="h-4 w-4" />
                      Descargar archivos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {error && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void fetchMySubmissions()}
              disabled={loading}
              className="font-medium underline disabled:opacity-50"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  async function handleDeleteDraft(submission: SubmissionItem) {
    if (!window.confirm(`¿Eliminar el borrador "${submission.titulo || 'Sin título'}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActionSubmissionId(submission.id);
    setError(null);
    try {
      await submissionService.deleteSubmission(submission.id);
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      try {
        const savedDraft = localStorage.getItem('submission_draft');
        if (savedDraft && String(JSON.parse(savedDraft)?.submissionId || '') === String(submission.id)) {
          localStorage.removeItem('submission_draft');
        }
      } catch (cause) {
        console.error('No fue posible limpiar la copia local del borrador eliminado:', cause);
      }
    } catch (cause) {
      console.error(`Error al eliminar el borrador ${submission.id}:`, cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible eliminar el borrador.');
    } finally {
      setActionSubmissionId(null);
    }
  }

  async function handleDownloadFiles(submission: SubmissionItem) {
    setActionSubmissionId(submission.id);
    setError(null);
    try {
      const { submission: detail } = await submissionService.getSubmissionById(submission.id);
      if (!detail.archivos?.length) {
        setError('Este artículo no tiene archivos adjuntos para descargar.');
        return;
      }

      for (const file of detail.archivos) {
        const blob = await submissionService.getFileContent(file.id, true);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = file.nombre_original;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }
    } catch (cause) {
      console.error(`Error al descargar los archivos del envío ${submission.id}:`, cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible descargar los archivos.');
    } finally {
      setActionSubmissionId(null);
    }
  }
}

function isDraft(submission: SubmissionItem): boolean {
  const draftFlag = submission.borrador;
  return draftFlag === true
    || draftFlag === 1
    || draftFlag === '1'
    || ['borrador', 'draft'].includes((submission.estado || '').toLocaleLowerCase());
}

function getSubmissionDate(submission: SubmissionItem): Date | null {
  const rawDate =
    submission.fecha_envio ||
    submission.fechaEnvio ||
    submission.created_at ||
    submission.createdAt;
  if (!rawDate) return null;

  const parsedDate = new Date(rawDate.replace(' ', 'T'));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function MetricCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <div style={{ color }}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('revision') || normalized.includes('evaluacion')) return '#f59e0b';
  if (normalized.includes('aceptado') || normalized.includes('aprobado')) return '#10b981';
  if (normalized.includes('rechazado')) return '#ef4444';
  if (normalized.includes('publicado')) return '#8b5cf6';
  if (normalized.includes('nuevo') || normalized.includes('recibido')) return '#0891b2';
  return '#6b7280';
}

function getStatusLabel(status: string): string {
  if (!status) return 'Enviado';
  if (['borrador', 'draft'].includes(status.toLocaleLowerCase())) return 'Borrador';
  if (status.toLocaleLowerCase() === 'en_revision') return 'En revisión';
  return status;
}