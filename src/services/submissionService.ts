import { apiFetch } from '../app/lib/api';

export interface SubmissionPayload {
  titulo: string;
  resumen: string;
  palabras_clave: string;
  seccion: string;
  idioma: string;
}

export const submissionService = {
  // Crear Borrador (Paso 1)
  createSubmission: async (payload: SubmissionPayload) => {
    return apiFetch<{ message: string; submissionId: string }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateSubmission: async (id: string, data: any) => {
    return apiFetch(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Finalizar Borrador (Paso Final)
  finalizeSubmission: async (id: string) => {
    return apiFetch<{ message: string; submission: any }>(`/submissions/${id}/finalize`, {
      method: 'PATCH',
    });
  },
};