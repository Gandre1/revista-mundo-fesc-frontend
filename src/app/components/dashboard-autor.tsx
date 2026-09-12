import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from './auth-context';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function DashboardAutor() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState(storage.getSubmissions());

  useEffect(() => {
    const interval = setInterval(() => {
      setSubmissions(storage.getSubmissions());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar solo envíos del autor actual
  const misEnvios = submissions.filter(s => s.autorId === user?.id);
  
  const stats = {
    total: misEnvios.length,
    borradores: misEnvios.filter(s => s.borrador).length,
    enRevision: misEnvios.filter(s => s.estado === 'En revisión').length,
    aceptados: misEnvios.filter(s => s.estado === 'Aceptado').length,
    rechazados: misEnvios.filter(s => s.estado === 'Rechazado').length,
    publicados: misEnvios.filter(s => s.estado === 'Publicado').length,
  };

  // Obtener envíos recientes (últimos 5)
  const enviosRecientes = [...misEnvios]
    .sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime())
    .slice(0, 5);

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

        {enviosRecientes.length === 0 ? (
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
            {enviosRecientes.map((submission) => (
              <Link
                key={submission.id}
                to={`/autor/envios/${submission.id}`}
                className="block p-4 border border-gray-200 rounded hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {submission.titulo || 'Sin título'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {submission.seccion} • {new Date(submission.fechaEnvio).toLocaleDateString('es-ES')}
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
                </div>
              </Link>
            ))}
          </div>
        )}
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Nuevo': '#0891b2',
    'En revisión': '#f59e0b',
    'Revisiones requeridas': '#f97316',
    'Aceptado': '#10b981',
    'Rechazado': '#ef4444',
    'Publicado': '#8b5cf6',
  };
  return colors[status] || '#6b7280';
}

function getStatusLabel(status: string): string {
  // Ya está en español, solo retornarlo
  return status;
}