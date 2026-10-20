export const SUBMISSION_STATUSES = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'evaluado', label: 'Evaluado' },
  { value: 'revisiones_requeridas', label: 'Ajustes solicitados' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'publicado', label: 'Publicado' },
] as const;

const STATUS_ALIASES: Record<string, string> = {
  nuevo: 'nuevo',
  draft: 'borrador',
  borrador: 'borrador',
  enviado: 'enviado',
  submitted: 'enviado',
  recibido: 'enviado',
  en_revision: 'en_revision',
  under_review: 'en_revision',
  evaluado: 'evaluado',
  evaluated: 'evaluado',
  revisiones_requeridas: 'revisiones_requeridas',
  revisions_required: 'revisiones_requeridas',
  ajustes_solicitados: 'revisiones_requeridas',
  aceptado: 'aceptado',
  accepted: 'aceptado',
  aprobado: 'aceptado',
  rejected: 'rechazado',
  rechazado: 'rechazado',
  publicado: 'publicado',
  published: 'publicado',
};

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  borrador: 'Borrador',
  enviado: 'Enviado',
  en_revision: 'En revisión',
  evaluado: 'Evaluado',
  revisiones_requeridas: 'Ajustes solicitados',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  publicado: 'Publicado',
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  nuevo: '#2563eb',
  borrador: '#6b7280',
  enviado: '#0891b2',
  en_revision: '#d97706',
  evaluado: '#7c3aed',
  revisiones_requeridas: '#ea580c',
  aceptado: '#059669',
  rechazado: '#dc2626',
  publicado: '#4f46e5',
};

export function normalizeSubmissionStatus(status: string | null | undefined): string {
  const normalized = (status || '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');

  return STATUS_ALIASES[normalized] || normalized;
}

export function getSubmissionStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeSubmissionStatus(status);
  return STATUS_LABELS[normalized] || status || 'Sin estado';
}

export function getSubmissionStatusColor(status: string | null | undefined): string {
  return SUBMISSION_STATUS_COLORS[normalizeSubmissionStatus(status)] || '#6b7280';
}

export function getSubmissionStatusBadgeClass(status: string | null | undefined): string {
  const colorByStatus: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-800',
    borrador: 'bg-gray-100 text-gray-700',
    enviado: 'bg-cyan-100 text-cyan-800',
    en_revision: 'bg-amber-100 text-amber-800',
    evaluado: 'bg-violet-100 text-violet-800',
    revisiones_requeridas: 'bg-orange-100 text-orange-800',
    aceptado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
    publicado: 'bg-indigo-100 text-indigo-800',
  };

  return colorByStatus[normalizeSubmissionStatus(status)] || 'bg-gray-100 text-gray-700';
}
