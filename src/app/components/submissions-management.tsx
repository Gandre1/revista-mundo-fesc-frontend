import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Eye, Trash2, Download } from 'lucide-react';
import { storage } from '../lib/storage';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';
const FESC_GRAY = '#3c3c3b';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Nuevo': { bg: '#dbeafe', text: '#1e40af' },
  'En revisión': { bg: '#fef3c7', text: '#92400e' },
  'Revisiones requeridas': { bg: '#fed7aa', text: '#9a3412' },
  'Aceptado': { bg: '#d1fae5', text: '#065f46' },
  'Rechazado': { bg: '#fee2e2', text: '#991b1b' },
  'Publicado': { bg: '#ede9fe', text: '#5b21b6' },
};

export function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState(storage.getSubmissions());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Actualizar envíos cada segundo para reflejar cambios
  useEffect(() => {
    const interval = setInterval(() => {
      setSubmissions(storage.getSubmissions());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar envíos
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = !searchQuery || 
      sub.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.autorNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || sub.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este envío?')) {
      storage.deleteSubmission(id);
      setSubmissions(storage.getSubmissions());
    }
  };

  const handleChangeStatus = (id: string, newStatus: string) => {
    storage.updateSubmission(id, { estado: newStatus as any });
    setSubmissions(storage.getSubmissions());
  };

  const handleAssignEditor = (id: string, editor: string) => {
    storage.updateSubmission(id, { editorAsignado: editor });
    setSubmissions(storage.getSubmissions());
  };

  const statuses = ['Nuevo', 'En revisión', 'Revisiones requeridas', 'Aceptado', 'Rechazado', 'Publicado'];
  const editors = ['Dr. Pedro Sánchez', 'Dra. Ana Martínez', 'Dr. Luis Fernández', 'Dra. Carmen Torres'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2" style={{ color: FESC_DARK_RED, fontFamily: "'Roboto', Calibri, sans-serif" }}>
          Gestión de Envíos
        </h1>
        <p className="text-sm text-gray-600">
          Administre todos los envíos de artículos de la revista
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, autor o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  fontFamily: "'Roboto', Calibri, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FESC_RED;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Filtro de estado */}
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 transition-all"
              style={{ fontFamily: "'Roboto', Calibri, sans-serif" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = FESC_RED;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${FESC_RED}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">Todos los estados</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {filteredSubmissions.length} de {submissions.length} envíos
        </div>
      </div>

      {/* Tabla de envíos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Editor
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.map(submission => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono" style={{ color: FESC_GRAY }}>
                      {submission.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <Link 
                        to={`/admin/submissions/${submission.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: FESC_RED }}
                      >
                        {submission.titulo}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {submission.resumen}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm" style={{ color: FESC_GRAY }}>
                      {submission.autorNombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(submission.fechaEnvio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={submission.estado}
                      onChange={(e) => handleChangeStatus(submission.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border-0 font-medium cursor-pointer"
                      style={{
                        backgroundColor: STATUS_COLORS[submission.estado]?.bg || '#f3f4f6',
                        color: STATUS_COLORS[submission.estado]?.text || '#374151'
                      }}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={submission.editorAsignado || ''}
                      onChange={(e) => handleAssignEditor(submission.id, e.target.value)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1"
                      style={{ 
                        fontFamily: "'Roboto', Calibri, sans-serif",
                        maxWidth: '150px'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = FESC_RED;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    >
                      <option value="">Sin asignar</option>
                      {editors.map(editor => (
                        <option key={editor} value={editor}>{editor}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/submissions/${submission.id}`}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" style={{ color: FESC_GRAY }} />
                      </Link>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron envíos</p>
          </div>
        )}
      </div>
    </div>
  );
}
