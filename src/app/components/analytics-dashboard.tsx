import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Layers3,
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
  ViewsSummary,
  exportAnalyticsReport,
  getEditorialTimes,
  getIssuesSummary,
  getOverview,
  getReviewersPerformance,
  getViewsSummary,
} from '../../services/analyticsService';
import { getIssues, Issue } from '../../services/issueService';

interface DashboardData {
  overview: AnalyticsOverview;
  editorialTimes: EditorialTimes;
  issuesSummary: IssuesSummary;
  reviewersPerformance: ReviewersPerformance;
  viewsSummary: ViewsSummary;
}

type AnalyticsSection = 'articulos' | 'numeros' | 'revista' | 'actividad-editorial' | 'usuarios' | 'informe-revision' | 'vistas';

const SECTION_DETAILS: Record<AnalyticsSection, { title: string; description: string }> = {
  articulos: {
    title: 'Estadísticas de artículos',
    description: 'Flujo editorial, estados y secciones de los artículos.',
  },
  numeros: {
    title: 'Estadísticas de números',
    description: 'Publicaciones y artículos agrupados por volumen y número.',
  },
  revista: {
    title: 'Panorama de la revista',
    description: 'Resumen de producción editorial, publicaciones y participación.',
  },
  'actividad-editorial': {
    title: 'Actividad editorial',
    description: 'Tiempos de decisión y avance de las revisiones editoriales.',
  },
  usuarios: {
    title: 'Estadísticas de usuarios/as',
    description: 'Participación de la comunidad editorial por rol.',
  },
  'informe-revision': {
    title: 'Informe de revisión',
    description: 'Revisiones asignadas, dictámenes completados y actividad de evaluadores.',
  },
  vistas: {
    title: 'Vistas y descargas',
    description: 'Consultas de artículos publicados y descargas de sus galeradas.',
  },
};

function getAnalyticsSection(pathname: string): AnalyticsSection {
  const slug = pathname.split('/').filter(Boolean).pop();
  if (slug === 'contador-iis') return 'informe-revision';
  if (slug === 'informes') return 'vistas';
  return slug && Object.prototype.hasOwnProperty.call(SECTION_DETAILS, slug)
    ? slug as AnalyticsSection
    : 'revista';
}

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
  const { pathname } = useLocation();
  const section = getAnalyticsSection(pathname);
  const sectionDetails = SECTION_DETAILS[section];
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
      const [overview, editorialTimes, issuesSummary, reviewersPerformance, viewsSummary, issues] = await Promise.all([
        getOverview(filters),
        getEditorialTimes(filters),
        getIssuesSummary(filters),
        getReviewersPerformance(filters),
        getViewsSummary(filters),
        getIssues(),
      ]);
      setData({ overview, editorialTimes, issuesSummary, reviewersPerformance, viewsSummary });
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

  const { overview, editorialTimes, issuesSummary, reviewersPerformance, viewsSummary } = data;
  const publishedCount = overview.articlesByStatus.published;
  const maxStatusCount = Math.max(1, ...STATUS_ROWS.map(({ status }) => overview.articlesByStatus[status]));
  const sectionRows = Object.entries(overview.articlesBySection).sort((left, right) => right[1] - left[1]);
  const maxSectionCount = Math.max(1, ...sectionRows.map(([, count]) => count));

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#e30513]">Gestión editorial · Estadísticas</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {sectionDetails.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {sectionDetails.description}
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

      {section !== 'usuarios' && (
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
              {sectionRows.map(([sectionName]) => (
                <option key={sectionName} value={sectionName}>{sectionName}</option>
              ))}
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
      )}

      {section === 'articulos' && (
        <>
          <section aria-label="Indicadores de artículos" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Total de artículos" value={overview.totalArticles.toLocaleString('es-CO')}
              detail="Artículos recibidos en el flujo editorial" icon={Send} iconClass="bg-sky-50 text-sky-700" />
            <MetricCard label="Tasa de aceptación" value={`${overview.acceptanceRate.toLocaleString('es-CO')}%`}
              detail="Aceptados o publicados sobre decisiones" icon={ArrowUpRight} iconClass="bg-emerald-50 text-emerald-700" />
            <MetricCard label="Secciones activas" value={sectionRows.length.toLocaleString('es-CO')}
              detail="Secciones con artículos en el periodo" icon={Layers3} iconClass="bg-violet-50 text-violet-700" />
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Artículos por estado</h2>
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
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Artículos por sección</h2>
              {sectionRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No hay artículos para los filtros seleccionados.</p>
              ) : (
                <div className="space-y-5">
                  {sectionRows.map(([name, count]) => (
                    <div key={name}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-gray-700">{name}</span>
                        <span className="tabular-nums text-gray-500">{count.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-[#e30513]" style={{ width: `${(count / maxSectionCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}

      {section === 'numeros' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Números publicados" value={issuesSummary.issues.length.toLocaleString('es-CO')}
              detail="Números con artículos publicados" icon={BookOpen} iconClass="bg-indigo-50 text-indigo-700" />
            <MetricCard label="Artículos publicados" value={issuesSummary.issues.reduce((total, issue) => total + issue.articles_count, 0).toLocaleString('es-CO')}
              detail="Artículos agrupados en los números mostrados" icon={FileText} iconClass="bg-sky-50 text-sky-700" />
          </section>
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">Publicaciones por número y volumen</h2>
              <p className="mt-1 text-sm text-gray-500">Conteo de artículos publicados en cada número.</p>
            </div>
            {issuesSummary.issues.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">Aún no hay números publicados para los filtros seleccionados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th scope="col" className="px-5 py-3 font-medium">Volumen / número</th>
                    <th scope="col" className="px-5 py-3 font-medium">Título</th>
                    <th scope="col" className="px-5 py-3 font-medium">Fecha de publicación</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Artículos</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {issuesSummary.issues.map((issue) => (
                      <tr key={issue.id} className="text-gray-700">
                        <th scope="row" className="px-5 py-4 font-medium text-gray-900">
                          Vol. {issue.volume} · N.º {issue.number} · {issue.year}
                        </th>
                        <td className="px-5 py-4">{issue.title || 'Número publicado'}</td>
                        <td className="px-5 py-4">{formatPublicationDate(issue.published_at)}</td>
                        <td className="px-5 py-4 text-right tabular-nums">{issue.articles_count.toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {section === 'revista' && (
        <>
          <section aria-label="Panorama de la revista" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Artículos recibidos" value={overview.totalArticles.toLocaleString('es-CO')}
              detail="Producción total en el flujo editorial" icon={FileText} iconClass="bg-sky-50 text-sky-700" />
            <MetricCard label="Artículos publicados" value={publishedCount.toLocaleString('es-CO')}
              detail="Artículos publicados en la revista" icon={BookOpen} iconClass="bg-indigo-50 text-indigo-700" />
            <MetricCard label="Números publicados" value={issuesSummary.issues.length.toLocaleString('es-CO')}
              detail="Volúmenes con artículos publicados" icon={Layers3} iconClass="bg-violet-50 text-violet-700" />
            <MetricCard label="Tasa de aceptación" value={`${overview.acceptanceRate.toLocaleString('es-CO')}%`}
              detail="Aceptados o publicados sobre decisiones" icon={ArrowUpRight} iconClass="bg-emerald-50 text-emerald-700" />
          </section>
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Publicaciones recientes</h2>
            {issuesSummary.issues.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Aún no hay artículos publicados en números.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {issuesSummary.issues.slice(0, 6).map((issue) => (
                  <div key={issue.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900">Vol. {issue.volume} · N.º {issue.number} · {issue.year}</p>
                    <p className="mt-1 truncate text-sm text-gray-600">{issue.title || 'Número publicado'}</p>
                    <p className="mt-3 text-xs text-gray-500">{formatPublicationDate(issue.published_at)}</p>
                    <p className="mt-2 text-sm font-medium text-[#e30513]">{issue.articles_count.toLocaleString('es-CO')} artículos</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </>
      )}

      {section === 'actividad-editorial' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Tiempo promedio hasta decisión"
              value={editorialTimes.averageDecisionDays === null ? '—' : editorialTimes.averageDecisionDays.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
              detail="Días desde el envío hasta la primera decisión" icon={Clock3} iconClass="bg-amber-50 text-amber-700" />
            <MetricCard label="Revisiones completadas" value={editorialTimes.reviews.completed.toLocaleString('es-CO')}
              detail={`De ${editorialTimes.reviews.assigned.toLocaleString('es-CO')} revisiones asignadas`} icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-700" />
            <MetricCard label="Revisiones pendientes" value={editorialTimes.reviews.pending.toLocaleString('es-CO')}
              detail="Asignaciones aún sin completar" icon={Users} iconClass="bg-violet-50 text-violet-700" />
          </section>
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-2 flex justify-between gap-4 text-sm">
              <h2 className="font-semibold text-gray-900">Cumplimiento de revisiones</h2>
              <span className="font-semibold tabular-nums text-gray-800">{editorialTimes.reviews.completionRate.toLocaleString('es-CO')}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100" role="progressbar"
              aria-label="Porcentaje de revisiones completadas" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={editorialTimes.reviews.completionRate}>
              <div className="h-full rounded-full bg-violet-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, editorialTimes.reviews.completionRate))}%` }} />
            </div>
          </article>
        </>
      )}

      {section === 'usuarios' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(overview.usersByRole).map(([role, total]) => (
              <MetricCard key={role} label={role === 'reviewer' ? 'Revisores/as' : role === 'author' ? 'Autores/as' : role === 'admin' ? 'Administradores/as' : 'Editores/as'}
                value={total.toLocaleString('es-CO')} detail="Usuarios registrados con este rol"
                icon={Users} iconClass="bg-sky-50 text-sky-700" />
            ))}
          </section>
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Participación por rol</h2>
            <div className="divide-y divide-gray-100">
              {Object.entries(overview.usersByRole).map(([role, total]) => (
                <div key={role} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium capitalize text-gray-700">{role}</span>
                  <span className="tabular-nums text-gray-600">{total.toLocaleString('es-CO')} usuarios</span>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {section === 'informe-revision' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Revisiones asignadas" value={editorialTimes.reviews.assigned.toLocaleString('es-CO')}
              detail="Asignaciones en el periodo filtrado" icon={Send} iconClass="bg-sky-50 text-sky-700" />
            <MetricCard label="Dictámenes completados" value={editorialTimes.reviews.completed.toLocaleString('es-CO')}
              detail="Revisiones con dictamen registrado" icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-700" />
            <MetricCard label="Pendientes" value={editorialTimes.reviews.pending.toLocaleString('es-CO')}
              detail="Revisiones aún sin completar" icon={Clock3} iconClass="bg-amber-50 text-amber-700" />
            <MetricCard label="Cumplimiento" value={`${editorialTimes.reviews.completionRate.toLocaleString('es-CO')}%`}
              detail="Porcentaje de revisiones completas" icon={ArrowUpRight} iconClass="bg-violet-50 text-violet-700" />
          </section>
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Rendimiento de evaluadores</h2>
              <p className="mt-1 text-sm text-gray-500">Asignaciones, cumplimiento y tiempo promedio de respuesta en el periodo.</p>
            </div>
            {reviewersPerformance.reviewers.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No hay evaluadores para los filtros seleccionados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th scope="col" className="px-3 py-3 font-medium">Evaluador</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Asignadas</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Completadas</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Pendientes</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Cumplimiento</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Días promedio</th>
                  </tr></thead>
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
                          {reviewer.averageResponseDays === null ? '—' : reviewer.averageResponseDays.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      )}

      {section === 'vistas' && (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Vistas de artículos" value={viewsSummary.totalViews.toLocaleString('es-CO')}
              detail="Consultas a artículos publicados" icon={Eye} iconClass="bg-sky-50 text-sky-700" />
            <MetricCard label="Descargas de galeradas" value={viewsSummary.totalDownloads.toLocaleString('es-CO')}
              detail="Descargas registradas de PDF/HTML" icon={Download} iconClass="bg-indigo-50 text-indigo-700" />
          </section>
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">Vistas y descargas por artículo</h2>
            </div>
            {viewsSummary.articles.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">No hay artículos publicados con estos filtros.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th scope="col" className="px-5 py-3 font-medium">Artículo</th>
                    <th scope="col" className="px-5 py-3 font-medium">Número</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Vistas</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Descargas</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewsSummary.articles.map((article) => (
                      <tr key={article.articleId} className="text-gray-700">
                        <th scope="row" className="px-5 py-4 font-medium text-gray-900">{article.title}</th>
                        <td className="px-5 py-4">Vol. {article.volume} · N.º {article.number} · {article.year}</td>
                        <td className="px-5 py-4 text-right tabular-nums">{article.views.toLocaleString('es-CO')}</td>
                        <td className="px-5 py-4 text-right tabular-nums">{article.downloads.toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
