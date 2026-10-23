import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmissions } from './submission-context';
import {
  EditorSummary,
  SubmissionSortField,
  submissionService,
} from '../../services/submissionService';
import {
  getSubmissionStatusBadgeClass,
  getSubmissionStatusLabel,
  normalizeSubmissionStatus,
  SUBMISSION_STATUSES,
} from '../lib/submission-status';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';
const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'revisiones_requeridas', label: 'Ajustes solicitados' },
  { value: 'evaluado', label: 'Evaluado' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'publicado', label: 'Publicado' },
];

interface SubmissionsManagementProps {
  onSelectSubmission?: (id: string) => void;
}

export function SubmissionsManagement({ onSelectSubmission }: SubmissionsManagementProps) {
  const { submissions, pagination, loading, error, refreshSubmissions } = useSubmissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editors, setEditors] = useState<EditorSummary[]>([]);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SubmissionSortField>('fecha_envio');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    void refreshSubmissions({
      page,
      limit: 10,
      sortBy,
      order,
      search: searchQuery.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    });
  }, [refreshSubmissions, page, sortBy, order, searchQuery, statusFilter]);

  useEffect(() => {
    submissionService.getEditors()
      .then(({ editors: result }) => {
        setEditors(result);
        setEditorError(null);
      })
      .catch((cause: unknown) => {
        console.error('Error al cargar la lista de editores:', cause);
        setEditorError(cause instanceof Error ? cause.message : 'No fue posible cargar los editores.');
      });
  }, []);

  const handleSort = (column: SubmissionSortField) => {
    if (sortBy === column) {
      setOrder((currentOrder) => currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder(column === 'fecha_envio' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const renderSortableHeader = (label: string, column: SubmissionSortField) => (
    <th
      aria-sort={sortBy === column ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
    >
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="inline-flex items-center gap-2 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
      >
        {label}
        {sortBy === column
          ? order === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
          : <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />}
      </button>
    </th>
  );

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const saveSubmissionChange = async (
    id: string,
    save: () => Promise<unknown>,
    successMessage: string
  ) => {
    setSavingSubmissionId(id);
    setActionError(null);
    try {
      await save();
      await refreshSubmissions();
      toast.success(successMessage);
    } catch (cause) {
      console.error(`Error al guardar cambios editoriales del envío ${id}:`, cause);
      const message = cause instanceof Error ? cause.message : 'No fue posible guardar el cambio.';
      setActionError(message);
      toast.error(message);
    } finally {
      setSavingSubmissionId(null);
    }
  };

  const openSubmission = (id: string) => {
    if (onSelectSubmission) {
      onSelectSubmission(id);
      return;
    }

    navigate(`${location.pathname.replace(/\/$/, '')}/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-bold" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Gestión de Envíos
        </h1>
        <p className="text-sm text-gray-600">
          Consulte los artículos y la información registrada para cada envío
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              aria-label="Buscar por título o nombre del autor"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all text-sm"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filtrar envíos por estado"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all text-sm"
            >
              {STATUS_FILTERS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Mostrando {startItem}-{endItem} de {pagination.total} envíos
        </div>
      </div>

      {(error || editorError || actionError) && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error && <p>No fue posible cargar los envíos: {error}</p>}
          {editorError && <p>No fue posible cargar los editores: {editorError}</p>}
          {actionError && <p>No fue posible guardar el cambio: {actionError}</p>}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-500 text-sm">Cargando envíos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {renderSortableHeader('Título', 'titulo')}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Autor principal</th>
                  {renderSortableHeader('Fecha de envío', 'fecha_envio')}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Editor asignado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const submittedDate = submission.fecha_envio || submission.created_at;

                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 min-w-64">
                        <button
                          type="button"
                          onClick={() => openSubmission(submission.id)}
                          className="text-sm font-medium hover:underline text-left"
                          style={{ color: FESC_RED }}
                        >
                          {submission.titulo || 'Sin título'}
                        </button>
                        <p className="mt-1 text-xs font-mono" style={{ color: FESC_GRAY }}>
                          ID: {submission.id}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 min-w-48">
                        {submission.autor_nombre || 'Autor no disponible'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        {formatDate(submittedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex w-32 shrink-0 justify-center rounded-full px-2 py-1.5 text-xs font-medium ${getSubmissionStatusBadgeClass(submission.borrador ? 'borrador' : submission.estado)}`}>
                            {submission.borrador ? 'Borrador' : getSubmissionStatusLabel(submission.estado)}
                          </span>
                          <select
                            value={normalizeSubmissionStatus(submission.estado)}
                            onChange={(event) => void saveSubmissionChange(
                              submission.id,
                              () => submissionService.updateSubmissionStatus(submission.id, event.target.value),
                              'Estado del envío actualizado.'
                            )}
                            disabled={savingSubmissionId !== null}
                            title="En revisión: un evaluador está trabajando en el artículo. Ajustes solicitados: el autor debe corregirlo y volver a enviarlo."
                            className="w-52 shrink-0 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
                            aria-label={`Cambiar estado de ${submission.titulo}`}
                          >
                            {SUBMISSION_STATUSES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {value === 'revisiones_requeridas' ? 'Ajustes solicitados (autor)' : label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={submission.editor_id || ''}
                          onChange={(event) => void saveSubmissionChange(
                            submission.id,
                            () => submissionService.assignEditor(submission.id, event.target.value || null),
                            'Editor asignado correctamente.'
                          )}
                          disabled={savingSubmissionId !== null || Boolean(editorError)}
                          className="w-44 shrink-0 text-xs px-2 py-1.5 border border-gray-300 rounded bg-white disabled:opacity-50"
                          aria-label={`Asignar editor a ${submission.titulo}`}
                        >
                          <option value="">Sin asignar</option>
                          {editors.map((editor) => (
                            <option key={editor.id} value={editor.id}>
                              {[editor.nombre, editor.apellidos].filter(Boolean).join(' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => openSubmission(submission.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                          style={{ backgroundColor: FESC_DARK_RED }}
                          aria-label={`Ver detalle y gestionar ${submission.titulo}`}
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle / Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              {pagination.total === 0 && !searchQuery && statusFilter === 'all'
                ? 'No hay envíos registrados.'
                : 'No se encontraron envíos.'}
            </p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={pagination.page <= 1}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return 'Pendiente';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
}
