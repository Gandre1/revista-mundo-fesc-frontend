import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  AuditLog,
  AuditLogsFilters,
  AuditLogsResponse,
  AuditSummary,
  getAuditLogs,
  getAuditSummary,
} from '../../services/auditService';

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || 'No fue posible cargar los logs de auditoría.';
  }
  return error instanceof Error ? error.message : 'No fue posible cargar los logs de auditoría.';
}

function formatDateTime(value: string): string {
  const date = new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDetails(details: AuditLog['details']): string {
  if (details === null || details === undefined || details === '') return 'Sin detalles';
  if (typeof details === 'string') {
    try {
      return JSON.stringify(JSON.parse(details), null, 2);
    } catch {
      return details;
    }
  }
  return JSON.stringify(details, null, 2);
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  percent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  percent?: number;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            {value.toLocaleString('es-CO')}
          </p>
        </div>
        <span className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {percent !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">{percent}% del total</p>
        </div>
      )}
      {percent === undefined && (
        <p className="mt-3 text-sm text-gray-500">Eventos registrados en el sistema</p>
      )}
    </article>
  );
}

function getActionAccent(index: number): string {
  const accents = [
    'bg-blue-50 text-blue-700',
    'bg-emerald-50 text-emerald-700',
    'bg-amber-50 text-amber-700',
    'bg-violet-50 text-violet-700',
    'bg-rose-50 text-rose-700',
  ];
  return accents[index % accents.length];
}

export function AuditLogsPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryReload, setSummaryReload] = useState(0);
  const [result, setResult] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [logsReload, setLogsReload] = useState(0);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AuditLogsFilters>({});

  useEffect(() => {
    let active = true;
    getAuditSummary()
      .then((data) => {
        if (active) {
          setSummary(data);
          setSummaryError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) setSummaryError(getErrorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [summaryReload]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAuditLogs({ ...appliedFilters, page, limit: PAGE_SIZE })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(getErrorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appliedFilters, page, logsReload]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({
      user: userFilter.trim() || undefined,
      action: actionFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const clearFilters = () => {
    setUserFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setAppliedFilters({});
  };

  const retryLogs = () => {
    setLogsReload((current) => current + 1);
  };

  const totalPages = result?.pagination.totalPages ?? 0;
  const currentPage = result?.pagination.page ?? page;
  const actionMetrics = summary?.byAction ?? [];

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#e30513]">Seguridad y seguimiento</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Logs de auditoría
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Consulta las acciones realizadas por los usuarios y su actividad reciente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLogsReload((current) => current + 1);
            setSummaryReload((current) => current + 1);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </header>

      {summaryError && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>{summaryError}</span>
          <button
            type="button"
            onClick={() => setSummaryReload((current) => current + 1)}
            className="font-semibold underline underline-offset-2"
          >
            Reintentar resumen
          </button>
        </div>
      )}

      <section aria-label="Resumen de auditoría">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-gray-800">Actividad registrada</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total de registros"
            value={summary?.total ?? 0}
            icon={ShieldCheck}
            accent="bg-red-50 text-[#e30513]"
          />
          {actionMetrics.map((item, index) => {
            const percent = summary?.total
              ? Math.round((item.total / summary.total) * 100)
              : 0;
            return (
              <MetricCard
                key={item.action}
                label={item.action.replace(/_/g, ' ')}
                value={item.total}
                icon={ClipboardList}
                accent={getActionAccent(index)}
                percent={percent}
              />
            );
          })}
          {summary && actionMetrics.length === 0 && (
            <div className="flex min-h-36 items-center rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
              Aún no hay acciones registradas.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-gray-900">Filtrar actividad</h2>
        </div>
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Usuario o correo</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                placeholder="Buscar por nombre o correo"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </span>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Tipo de acción</span>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            >
              <option value="">Todas las acciones</option>
              {actionMetrics.map(({ action }) => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Desde</span>
            <span className="relative block">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-2 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </span>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Hasta</span>
            <span className="relative block">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                min={startDate || undefined}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-2 text-sm text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </span>
          </label>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e30513] px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Registro de actividad</h2>
            <p className="mt-1 text-xs text-gray-500">
              {result ? `${result.pagination.total.toLocaleString('es-CO')} registros encontrados` : 'Cargando registros…'}
            </p>
          </div>
          {loading && <span className="text-xs font-medium text-gray-500">Actualizando…</span>}
        </div>

        {error ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-rose-500" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-gray-900">No se pudo cargar la actividad</h3>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <button
              type="button"
              onClick={retryLogs}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#e30513] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Fecha / hora</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Usuario</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Acción</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Objetivo</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Detalles / IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && !result ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index} className="animate-pulse">
                        {Array.from({ length: 5 }, (_, cell) => (
                          <td key={cell} className="px-5 py-5">
                            <div className="h-4 rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : result?.logs.length ? (
                    result.logs.map((log) => (
                      <tr key={log.id} className="align-top transition-colors hover:bg-gray-50/70">
                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{formatDateTime(log.created_at)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 rounded-full bg-gray-100 p-1.5 text-gray-500">
                              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <span>
                              <span className="block font-medium text-gray-900">{log.user_name || 'Usuario eliminado'}</span>
                              <span className="mt-0.5 block text-xs text-gray-500">{log.user_email || log.user_id || 'Sin usuario asociado'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="block font-medium text-gray-800">{log.target_model}</span>
                          <span className="mt-0.5 block text-xs text-gray-500">{log.target_id || 'Sin identificador'}</span>
                        </td>
                        <td className="max-w-sm px-5 py-4">
                          <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                            {formatDetails(log.details)}
                          </pre>
                          {log.ip_address && (
                            <span className="mt-2 inline-flex rounded bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-500">
                              IP {log.ip_address}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <ClipboardList className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                        <p className="mt-3 font-medium text-gray-700">No hay registros para mostrar</p>
                        <p className="mt-1 text-sm text-gray-500">Prueba modificando o limpiando los filtros.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Página {currentPage} de {Math.max(totalPages, 1)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={loading || currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={loading || currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
