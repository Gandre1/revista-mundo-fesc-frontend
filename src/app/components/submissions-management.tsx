import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, Eye } from 'lucide-react';
import { useSubmissions } from './submission-context';
import { EditorSummary, submissionService } from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';
const STATUS_OPTIONS = [
  'Nuevo',
  'enviado',
  'en_revision',
  'evaluado',
  'aceptado',
  'rechazado',
  'revisiones_requeridas',
  'publicado',
];
const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'evaluado', label: 'Evaluado' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'rechazado', label: 'Rechazado' },
];

interface SubmissionsManagementProps {
  onSelectSubmission?: (id: string) => void;
}

export function SubmissionsManagement({ onSelectSubmission }: SubmissionsManagementProps) {
  const { submissions, loading, error, refreshSubmissions } = useSubmissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editors, setEditors] = useState<EditorSummary[]>([]);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void refreshSubmissions();
    submissionService.getEditors()
      .then(({ editors: result }) => {
        setEditors(result);
        setEditorError(null);
      })
      .catch((cause: unknown) => {
        console.error('Error al cargar la lista de editores:', cause);
        setEditorError(cause instanceof Error ? cause.message : 'No fue posible cargar los editores.');
      });
  }, [refreshSubmissions]);

  const filteredSubmissions = submissions.filter((submission) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch =
      !query ||
      submission.titulo.toLocaleLowerCase().includes(query) ||
      submission.autor_nombre.toLocaleLowerCase().includes(query);

    return matchesSearch && (
      statusFilter === 'all' ||
      getStatusCategory(submission.estado) === statusFilter
    );
  });

  const statuses = [...new Set([...STATUS_OPTIONS, ...submissions.map((submission) => submission.estado)])];

  const updateEditorialField = async (
    id: string,
    data: { estado?: string; editor_id?: string | null }
  ) => {
    setSavingSubmissionId(id);
    setActionError(null);
    try {
      await submissionService.updateEditorialFields(id, data);
      await refreshSubmissions();
    } catch (cause) {
      console.error(`Error al guardar cambios editoriales del envío ${id}:`, cause);
      setActionError(cause instanceof Error ? cause.message : 'No fue posible guardar el cambio.');
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
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all text-sm"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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
          Mostrando {filteredSubmissions.length} de {submissions.length} envíos
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Autor principal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha de envío</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Editor asignado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => {
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
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${statusColor(submission.borrador ? 'borrador' : submission.estado)}`}>
                            {submission.borrador ? 'Borrador' : formatStatus(submission.estado)}
                          </span>
                          <select
                            value={submission.estado}
                            onChange={(event) => void updateEditorialField(submission.id, { estado: event.target.value })}
                            disabled={savingSubmissionId !== null}
                            className="max-w-32 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
                            aria-label={`Cambiar estado de ${submission.titulo}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{formatStatus(status)}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={submission.editor_id || ''}
                          onChange={(event) => void updateEditorialField(
                            submission.id,
                            { editor_id: event.target.value || null }
                          )}
                          disabled={savingSubmissionId !== null || Boolean(editorError)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white max-w-44 disabled:opacity-50"
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

        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              {submissions.length === 0 ? 'No hay envíos registrados.' : 'No se encontraron envíos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatStatus(status: string): string {
  const normalized = status.toLocaleLowerCase();
  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    enviado: 'Enviado',
    submitted: 'Enviado',
    en_revision: 'En revisión',
    under_review: 'En revisión',
    evaluado: 'Evaluado',
    evaluated: 'Evaluado',
    revisiones_requeridas: 'Revisiones requeridas',
    revisions_required: 'Revisiones requeridas',
    aceptado: 'Aceptado',
    accepted: 'Aceptado',
    rechazado: 'Rechazado',
    rejected: 'Rechazado',
    publicado: 'Publicado',
    published: 'Publicado',
  };

  return labels[normalized] || status;
}

function getStatusCategory(status: string): string {
  const normalized = status.trim().toLocaleLowerCase().replace(/[\s-]+/g, '_');
  const categories: Record<string, string> = {
    enviado: 'enviado',
    submitted: 'enviado',
    en_revision: 'en_revision',
    under_review: 'en_revision',
    evaluado: 'evaluado',
    evaluated: 'evaluado',
    aceptado: 'aceptado',
    accepted: 'aceptado',
    rechazado: 'rechazado',
    rejected: 'rechazado',
  };

  return categories[normalized] || normalized;
}

function statusColor(status: string): string {
  const category = getStatusCategory(status);
  const colors: Record<string, string> = {
    enviado: 'bg-blue-100 text-blue-800',
    en_revision: 'bg-amber-100 text-amber-800',
    evaluado: 'bg-violet-100 text-violet-800',
    aceptado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
    borrador: 'bg-gray-100 text-gray-700',
  };

  return colors[category] || 'bg-gray-100 text-gray-700';
}

function formatDate(value: string | null): string {
  if (!value) return 'Pendiente';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
}
