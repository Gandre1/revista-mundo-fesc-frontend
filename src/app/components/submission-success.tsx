import { Link } from 'react-router';
import { CheckCircle, FileText, Home } from 'lucide-react';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

export function SubmissionSuccess() {
  const submissionId = localStorage.getItem('lastSubmissionId') || 'SUB-2024-XXX';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4" style={{ borderBottomColor: FESC_RED }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            Revista Mundo FESC
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Sistema de Gestión Editorial
          </p>
        </div>
      </div>

      {/* Success Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-3" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
            ¡Envío Exitoso!
          </h2>

          {/* Submission ID */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Su artículo ha sido enviado para revisión
            </p>
            <div className="inline-block px-4 py-2 rounded" style={{ backgroundColor: `${FESC_RED}10` }}>
              <span className="text-sm text-gray-600">ID de envío: </span>
              <span className="font-mono font-semibold" style={{ color: FESC_RED }}>
                {submissionId}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3" style={{ color: FESC_GRAY }}>
              ¿Qué sigue?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span style={{ color: FESC_RED }}>•</span>
                <span>Su artículo será revisado por el equipo editorial</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: FESC_RED }}>•</span>
                <span>Recibirá notificaciones sobre el estado de su envío por correo electrónico</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: FESC_RED }}>•</span>
                <span>El proceso de revisión puede tomar entre 2-4 semanas</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: FESC_RED }}>•</span>
                <span>Puede consultar el estado de su envío contactando a: revista@fesc.edu.co</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/submission/new"
              className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Enviar Otro Artículo
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-white rounded hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: FESC_RED }}
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-8">
            Guarde el ID de envío para futuras consultas
          </p>
        </div>
      </div>
    </div>
  );
}
