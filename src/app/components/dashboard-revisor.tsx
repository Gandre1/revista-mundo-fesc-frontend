import { FileText, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ReviewerAssignment, submissionService } from '../../services/submissionService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function DashboardRevisor() {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    submissionService.getMyReviews()
      .then(({ reviews }) => {
        if (active) setAssignments(reviews);
      })
      .catch((cause: unknown) => {
        if (active) {
          console.error('Error al cargar las asignaciones del revisor:', cause);
          setError(cause instanceof Error ? cause.message : 'No fue posible cargar tus asignaciones.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completed = assignments.filter((review) => review.estado_revision === 'completado').length;
  const stats = {
    total: assignments.length,
    pendientes: assignments.length - completed,
    completadas: completed,
  };

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Artículos asignados
        </h1>
        <p className="text-sm text-gray-600">
          Revisa los artículos que te han sido asignados
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<FileText className="w-6 h-6" />}
          title="Asignados"
          value={loading ? 0 : stats.total}
          subtitle="Artículos"
          color={FESC_RED}
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="Pendientes"
          value={loading ? 0 : stats.pendientes}
          subtitle="Por revisar"
          color="#f59e0b"
        />
        <MetricCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Completadas"
          value={loading ? 0 : stats.completadas}
          subtitle="Revisiones"
          color="#10b981"
        />
      </div>

      {/* Artículos asignados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Artículos por revisar
        </h2>

        {error ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : loading ? (
          <p role="status" className="py-8 text-center text-sm text-gray-500">Cargando tus asignaciones...</p>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No tienes artículos asignados por el momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((review) => {
              const isCompleted = review.estado_revision === 'completado';
              const deadline = review.fecha_limite.slice(0, 10);
              const today = new Date();
              const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const isOverdue = !isCompleted && deadline < todayString;

              return (
                <Link
                  key={review.id}
                  to={`/revisor/asignados/${review.submission_id}`}
                  className="block rounded border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {review.titulo || 'Sin título'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {review.seccion || 'Sin sección'} · Fecha límite:{' '}
                        {new Date(`${deadline}T00:00:00`).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: isCompleted ? '#dcfce7' : isOverdue ? '#fee2e2' : '#fef3c7',
                        color: isCompleted ? '#15803d' : isOverdue ? '#b91c1c' : '#b45309',
                      }}
                    >
                      {isCompleted ? 'Dictamen enviado' : isOverdue ? 'Vencido' : 'Pendiente'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Información útil */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Proceso de revisión</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Lee el artículo completo cuidadosamente</li>
          <li>• Evalúa la calidad, originalidad y relevancia</li>
          <li>• Proporciona comentarios constructivos</li>
          <li>• Recomienda: Aceptar, Revisiones menores, Revisiones mayores, o Rechazar</li>
        </ul>
      </div>
    </div>
  );
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