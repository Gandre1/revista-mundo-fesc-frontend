import { apiFetch, API_URL } from '../app/lib/api';

export interface SubmissionPayload {
  titulo: string;
  resumen: string;
  palabras_clave: string;
  seccion: string;
  idioma: string;
}

export interface AuthorPayload {
  submission_id: string;
  nombre: string;
  apellidos: string;
  email: string;
  afiliacion?: string;
  pais?: string;
  orcid?: string;
  es_corresponsal?: boolean;
  orden?: number;
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

  async addAuthor(data: AuthorPayload) {
    return apiFetch('/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAuthors(submissionId: string) {
    return apiFetch(`/authors/submission/${submissionId}`);
  },

  async deleteAuthor(authorId: number) {
    return apiFetch(`/authors/${authorId}`, {
      method: 'DELETE',
    });
  },

  async finalizeSubmission(submissionId: string) {
    return apiFetch(`/submissions/${submissionId}/finalize`, {
      method: 'PATCH',
    });
  }

};