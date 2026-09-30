import { apiFetch, API_URL } from '../app/lib/api';

export interface SubmissionPayload {
  titulo: string;
  resumen: string;
  palabras_clave: string;
  seccion: string;
  idioma: string;
}

export const submissionService = {

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

  uploadFile: async (submissionId: string, file: File, tipo: string = 'manuscrito') => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('submission_id', submissionId);
    formData.append('tipo', tipo);

    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir el archivo');
    }

    return response.json();
  },

  getSubmissionFiles: async (submissionId: string) => {
    return apiFetch(`/files/submission/${submissionId}`);
  },

  deleteFile: async (fileId: string) => {
    return apiFetch(`/files/${fileId}`, {
      method: 'DELETE',
    });
  },
  
  finalizeSubmission: async (id: string) => {
    return apiFetch<{ message: string; submission: any }>(`/submissions/${id}/finalize`, {
      method: 'PATCH',
    });
  },

};