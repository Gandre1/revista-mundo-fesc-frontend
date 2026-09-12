import { BarChart3, FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, Calendar, PlusCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function Dashboard() {
  const [stats, setStats] = useState(storage.getStatistics());
  const [submissions, setSubmissions] = useState(storage.getSubmissions());

  useEffect(() => {
    // Actualizar estadísticas cuando cambie el storage
    const interval = setInterval(() => {
      setStats(storage.getStatistics());
      setSubmissions(storage.getSubmissions());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calcular tasa de aceptación
  const acceptanceRate = stats.acceptanceRate;
  const avgReviewTime = stats.avgReviewTime;

  return (
    <div className="space-y-6">
      {/* Header con botón de acción */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            Todos los envíos
          </h1>
          <p className="text-sm text-gray-600">
            Vista general del sistema editorial
          </p>
        </div>
        <Link
          to="/admin/new-submission"
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
          style={{ backgroundColor: FESC_RED }}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">Nuevo Envío</span>
        </Link>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<FileText className="w-6 h-6" />}
          title="Total Envíos"
          value={stats.totalSubmissions}
          subtitle="Todos los tiempos"
          color={FESC_RED}
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="En Revisión"
          value={stats.inReview}
          subtitle="Pendientes"
          color="#f59e0b"
        />
        <MetricCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Aceptados"
          value={stats.accepted}
          subtitle={`Tasa: ${acceptanceRate}%`}
          color="#10b981"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Tiempo Promedio"
          value={`${avgReviewTime} días`}
          subtitle="Revisión"
          color="#6366f1"
        />
      </div>

      {/* Estado de envíos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Estado de Envíos
        </h2>
        <div className="space-y-3">
          <StatusBar label="Nuevos" count={stats.newSubmissions} total={stats.totalSubmissions} color="#3b82f6" />
          <StatusBar label="En revisión" count={stats.inReview} total={stats.totalSubmissions} color="#f59e0b" />
          <StatusBar label="Aceptados" count={stats.accepted} total={stats.totalSubmissions} color="#10b981" />
          <StatusBar label="Rechazados" count={stats.rejected} total={stats.totalSubmissions} color="#ef4444" />
          <StatusBar label="Publicados" count={stats.published} total={stats.totalSubmissions} color="#8b5cf6" />
        </div>
      </div>

      {/* Lista de TODOS los envíos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            Todos los artículos ({submissions.length})
          </h2>
          <Link
            to="/admin/submissions"
            className="text-sm hover:underline"
            style={{ color: FESC_RED }}
          >
            Ver gestión completa →
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No hay envíos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/admin/submissions/${submission.id}`}
                className="block p-4 border border-gray-200 rounded hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">{submission.id}</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getStatusColor(submission.estado) + '20',
                          color: getStatusColor(submission.estado),
                        }}
                      >
                        {submission.estado}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {submission.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {submission.autorNombre} • {submission.seccion} • {new Date(submission.fechaEnvio).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl mb-4" style={{ color: FESC_GRAY, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Actividad Reciente
        </h2>
        <RecentActivity />
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1" style={{ color: FESC_DARK_RED }}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function StatusBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm" style={{ color: FESC_GRAY }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: FESC_GRAY }}>
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RecentActivity() {
  const recentEvents = storage.getRecentActivity();

  return (
    <div className="space-y-4">
      {recentEvents.map((event, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="p-2 rounded" style={{ backgroundColor: `${FESC_RED}20` }}>
            <FileText className="w-5 h-5" style={{ color: FESC_RED }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: FESC_GRAY }}>{event.title}</p>
            <p className="text-xs text-gray-500">{event.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Nuevo':
      return '#3b82f6';
    case 'En revisión':
      return '#f59e0b';
    case 'Revisiones requeridas':
      return '#f97316';
    case 'Aceptado':
      return '#10b981';
    case 'Rechazado':
      return '#ef4444';
    case 'Publicado':
      return '#8b5cf6';
    default:
      return '#9ca3af';
  }
}