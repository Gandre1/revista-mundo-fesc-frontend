import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import {
  AnalyticsOverview,
  AnalyticsFilters,
  ArticleStatus,
  EditorialTimes,
  IssuesSummary,
  ReviewersPerformance,
  exportAnalyticsReport,
  getEditorialTimes,
  getIssuesSummary,
  getOverview,
  getReviewersPerformance,
} from '../../services/analyticsService';
import { getIssues, Issue } from '../../services/issueService';

interface DashboardData {
  overview: AnalyticsOverview;
  editorialTimes: EditorialTimes;
  issuesSummary: IssuesSummary;
  reviewersPerformance: ReviewersPerformance;
}

const SECTIONS = [
  'Artículos de Investigación',
  'Artículos Originales',
  'Artículos de Revisión',
  'Reflexión',
  'Prácticas educativas',
];

const STATUS_ROWS: { status: ArticleStatus; label: string; color: string }[] = [
  { status: 'submitted', label: 'Enviados', color: 'bg-cyan-500' },
  { status: 'under_review', label: 'En revisión', color: 'bg-amber-500' },
  { status: 'changes_requested', label: 'Cambios solicitados', color: 'bg-orange-500' },
  { status: 'accepted', label: 'Aceptados', color: 'bg-emerald-500' },
  { status: 'rejected', label: 'Rechazados', color: 'bg-rose-500' },
  { status: 'published', label: 'Publicados', color: 'bg-indigo-500' },
];

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || 'No fue posible cargar las estadísticas.';
  }
  return error instanceof Error ? error.message : 'No fue posible cargar las estadísticas.';
}

function formatPublicationDate(value: string | null): string {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Send;
  iconClass: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">{detail}</p>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Cargando estadísticas" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="mt-5 h-8 w-1/3 rounded bg-gray-200" />
            <div className="mt-4 h-3 w-1/2 rounded bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-5 w-1/3 rounded bg-gray-200" />
            <div className="mt-8 space-y-6">
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="h-8 rounded bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [issueOptions, setIssueOptions] = useState<Issue[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, editorialTimes, issuesSummary, reviewersPerformance, issues] = await Promise.all([
        getOverview(filters),
        getEditorialTimes(filters),
        getIssuesSummary(filters),
        getReviewersPerformance(filters),
        getIssues(),
      ]);
      setData({ overview, editorialTimes, issuesSummary, reviewersPerformance });
      setIssueOptions(issues);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportAnalyticsReport(filters);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'analytics-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (cause) {
      setExportError(getErrorMessage(cause));
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No se pudieron cargar las estadísticas</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
          {error || 'Intenta nuevamente en unos momentos.'}
        </p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e30513] px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }

  const { overview, editorialTimes, issuesSummary, reviewersPerformance } = data;
  const publishedCount = overview.articlesByStatus.published;
  const maxStatusCount = Math.max(1, ...STATUS_ROWS.map(({ status }) => overview.articlesByStatus[status]));
  const maxIssueCount = Math.max(1, ...issuesSummary.issues.map((issue) => issue.articles_count));

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#e30513]">Gestión editorial</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Estadísticas editoriales
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Indicadores generales del flujo de artículos y las publicaciones de la revista.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        </div>
      </header>

      {exportError && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          No fue posible exportar el informe: {exportError}
        </p>
      )}

      <section aria-label="Filtros de analíticas" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-end">
          <label className="block text-sm font-medium text-gray-700">
            Fecha de inicio
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(event) => setFilters((current) => ({
                ...current,
                startDate: event.target.value || undefined,
              }))}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Fecha final
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(event) => setFilters((current) => ({
                ...current,
                endDate: event.target.value || undefined,
              }))}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Volumen / número
            <select
              value={filters.issueId || ''}
              onChange={(event) => setFilters((current) => ({
                ...current,
                issueId: event.target.value ? Number(event.target.value) : undefined,
              }))}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              <option value="">Todos los volúmenes</option>
              {issueOptions.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  Vol. {issue.volume} · N.º {issue.number} · {issue.year}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Sección
            <select
              value={filters.section || ''}
              onChange={(event) => setFilters((current) => ({
                ...current,
                section: event.target.value || undefined,
              }))}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              <option value="">Todas las secciones</option>
              {SECTIONS.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setFilters({})}
            disabled={!filters.startDate && !filters.endDate && !filters.issueId && !filters.section}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de envíos"
          value={overview.totalArticles.toLocaleString('es-CO')}
          detail="Artículos en el flujo editorial"
          icon={Send}
          iconClass="bg-sky-50 text-sky-700"
        />
        <MetricCard
          label="Tasa de aceptación"
          value={`${overview.acceptanceRate.toLocaleString('es-CO')}%`}
          detail="Aceptados o publicados sobre decisiones"
          icon={ArrowUpRight}
          iconClass="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Artículos publicados"
          value={publishedCount.toLocaleString('es-CO')}
          detail="Artículos en números publicados"
          icon={BookOpen}
          iconClass="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Tiempo hasta decisión"
          value={editorialTimes.averageDecisionDays === null
            ? '—'
            : editorialTimes.averageDecisionDays.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
          detail="Promedio de días desde el envío"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-700"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Artículos por estado</h2>
            <p className="mt-1 text-sm text-gray-500">Distribución de los envíos en el proceso editorial.</p>
          </div>
          <div className="space-y-5">
            {STATUS_ROWS.map(({ status, label, color }) => {
              const count = overview.articlesByStatus[status];
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="tabular-nums text-gray-500">{count.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Artículos por número</h2>
            <p className="mt-1 text-sm text-gray-500">Conteo de artículos publicados en cada volumen.</p>
          </div>
          {issuesSummary.issues.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <BookOpen className="h-9 w-9 text-gray-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-gray-700">Aún no hay números publicados</p>
              <p className="mt-1 text-sm text-gray-500">Los artículos aparecerán aquí al publicarse.</p>
            </div>
          ) : (
            <div className="max-h-80 space-y-5 overflow-y-auto pr-1">
              {issuesSummary.issues.map((issue) => (
                <div key={issue.id}>
                  <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">
                        Vol. {issue.volume} · N.º {issue.number} · {issue.year}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {issue.title || 'Número publicado'} · {formatPublicationDate(issue.published_at)}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-gray-600">
                      {issue.articles_count.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#e30513]"
                      style={{ width: `${(issue.articles_count / maxIssueCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cumplimiento de revisiones</h2>
              <p className="mt-1 text-sm text-gray-500">Revisiones asignadas que ya fueron completadas.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <span className="text-sm text-gray-600">
              <strong className="font-semibold text-gray-900">
                {editorialTimes.reviews.completed.toLocaleString('es-CO')}
              </strong>
              {' de '}
              {editorialTimes.reviews.assigned.toLocaleString('es-CO')} completadas
            </span>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-500">
              {editorialTimes.reviews.pending.toLocaleString('es-CO')} pendientes
            </span>
            <span className="font-semibold tabular-nums text-gray-800">
              {editorialTimes.reviews.completionRate.toLocaleString('es-CO')}%
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-label="Porcentaje de revisiones completadas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={editorialTimes.reviews.completionRate}
          >
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, editorialTimes.reviews.completionRate))}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Rendimiento de evaluadores</h2>
          <p className="mt-1 text-sm text-gray-500">
            Asignaciones, cumplimiento y tiempo promedio de respuesta en el periodo filtrado.
          </p>
        </div>
        {reviewersPerformance.reviewers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No hay evaluadores para los filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th scope="col" className="px-3 py-3 font-medium">Evaluador</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Asignadas</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Completadas</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Pendientes</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Cumplimiento</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Días promedio de respuesta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviewersPerformance.reviewers.map((reviewer) => (
                  <tr key={reviewer.correo} className="text-gray-700">
                    <th scope="row" className="px-3 py-3 font-medium text-gray-900">
                      <span className="block">{reviewer.nombre}</span>
                      <span className="mt-0.5 block text-xs font-normal text-gray-500">{reviewer.correo}</span>
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">{reviewer.assignedReviews.toLocaleString('es-CO')}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{reviewer.completedReviews.toLocaleString('es-CO')}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{reviewer.pendingReviews.toLocaleString('es-CO')}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{reviewer.completionRate.toLocaleString('es-CO')}%</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {reviewer.averageResponseDays === null
                        ? '—'
                        : reviewer.averageResponseDays.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
