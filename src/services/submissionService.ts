import { apiFetch, API_URL, getApiAuthHeaders } from '../app/lib/api';

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

export interface SubmissionSummary {
  id: string;
  titulo: string;
  seccion: string | null;
  estado: string;
  borrador: boolean | number;
  paso_wizard: number;
  fecha_envio: string | null;
  created_at: string;
  total_archivos: number;
  total_autores: number;
}

export interface EditorialSubmission extends SubmissionSummary {
  resumen: string | null;
  autor_nombre: string;
  autor_email: string;
  editor_id: string | null;
  editor_nombre: string | null;
}

export type SubmissionSortField =
  | 'titulo'
  | 'fecha_envio'
  | 'created_at'
  | 'estado'
  | 'autor_nombre'
  | 'editor_nombre';

export interface EditorialSubmissionQuery {
  page?: number;
  limit?: number;
  sortBy?: SubmissionSortField;
  order?: 'asc' | 'desc';
  search?: string;
  status?: string;
}

export interface SubmissionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EditorialSubmissionsResponse {
  submissions: EditorialSubmission[];
  pagination: SubmissionPagination;
}

export interface EditorSummary {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
}

export interface ReviewerSummary {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
}

export interface SubmissionReview {
  id: string | number;
  reviewer_id: string;
  reviewer_nombre: string;
  fecha_limite: string | null;
  estado?: string | null;
}

export interface SubmissionFile {
  id: number | string;
  nombre_original: string;
  tamano: number;
  tipo: string;
  ruta_almacenamiento?: string;
  fecha_subida: string;
}

export interface SubmissionAuthor {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  afiliacion: string | null;
  pais: string | null;
  orcid: string | null;
  es_corresponsal: boolean | number;
  orden: number;
}

export interface SubmissionDetail {
  id: string;
  autor_nombre: string;
  autor_email: string;
  editor_id: string | null;
  editor_nombre: string | null;
  titulo: string;
  resumen: string | null;
  palabras_clave: string | null;
  seccion: string | null;
  idioma: string;
  comentarios_editor: string | null;
  referencias: string | null;
  estado: string;
  status?: string | null;
  revisores?: SubmissionReview[];
  paso_envio?: number | string | null;
  borrador: boolean | number;
  paso_wizard: number;
  fecha_envio: string | null;
  created_at: string;
  archivos: SubmissionFile[];
  autores: SubmissionAuthor[];
}

export const submissionService = {

  getMySubmissions: async () => {
    return apiFetch<{ submissions: SubmissionSummary[] }>('/submissions/my-submissions');
  },

  getEditorialSubmissions: async (options: EditorialSubmissionQuery = {}) => {
    const query = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    const queryString = query.toString();
    return apiFetch<EditorialSubmissionsResponse>(
      `/submissions${queryString ? `?${queryString}` : ''}`
    );
  },

  getEditors: async () => {
    return apiFetch<{ editors: EditorSummary[] }>('/submissions/editors');
  },

  getReviewers: async () => {
    return apiFetch<{ reviewers: ReviewerSummary[] }>('/submissions/reviewers');
  },

  getSubmissionById: async (id: string) => {
    return apiFetch<{ submission: SubmissionDetail }>(`/submissions/${encodeURIComponent(id)}`);
  },

  updateSubmissionStatus: async (id: string, status: string, comentariosEditor?: string) => {
    return apiFetch<{ message: string; submissionId: string }>(
      `/submissions/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          estado: status,
          ...(comentariosEditor ? { comentarios_editor: comentariosEditor } : {}),
        }),
      }
    );
  },

  assignEditor: async (id: string, editorId: string | null) => {
    return apiFetch<{ message: string; submissionId: string }>(
      `/submissions/${encodeURIComponent(id)}/assign-editor`,
      {
        method: 'PATCH',
        body: JSON.stringify({ editor_id: editorId }),
      }
    );
  },

  assignReviewer: async (id: string, reviewerId: string, deadline: string) => {
    return apiFetch<{ message: string; submissionId: string }>(
      `/submissions/${encodeURIComponent(id)}/assign-reviewer`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reviewer_id: reviewerId, fecha_limite: deadline }),
      }
    );
  },

  updateEditorialFields: async (
    id: string,
    data: { estado?: string; editor_id?: string | null }
  ) => {
    return apiFetch<{ message: string; submissionId: string }>(
      `/submissions/${encodeURIComponent(id)}/editorial`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  createSubmission: async (payload: SubmissionPayload) => {
    return apiFetch<{ message: string; submissionId: string }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateSubmission: async (id: string, data: Partial<SubmissionPayload> & Record<string, unknown>) => {
    return apiFetch(`/submissions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSubmission: async (id: string) => {
    return apiFetch<{ message?: string }>(`/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  uploadFile: async (submissionId: string, file: File, tipo: string = 'manuscrito') => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('submission_id', submissionId);
    formData.append('tipo', tipo);

    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      headers: getApiAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir el archivo');
    }

    return response.json();
  },

  getSubmissionFiles: async (submissionId: string) => {
    return apiFetch(`/files/submission/${encodeURIComponent(submissionId)}`);
  },

  getFilePreviewUrl: async (fileId: number | string): Promise<string> => {
    const result = await apiFetch<{ token: string }>(
      `/files/${encodeURIComponent(String(fileId))}/preview-token`
    );
    const encodedId = encodeURIComponent(String(fileId));
    const query = `token=${encodeURIComponent(result.token)}`;

    if (import.meta.env.PROD) {
      return `/api/pdf-preview/${encodedId}?${query}`;
    }

    return `${API_URL}/files/${encodedId}/preview?${query}`;
  },

  getFileContent: async (fileId: number | string, download = false): Promise<Blob> => {
    const query = download ? '?download=1' : '';
    const response = await fetch(
      `${API_URL}/files/${encodeURIComponent(String(fileId))}/content${query}`,
      {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          ...getApiAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      let message = responseText || 'No fue posible obtener el archivo.';
      try {
        const errorData = JSON.parse(responseText) as { message?: string };
        message = errorData.message || message;
      } catch {
        // El servidor puede responder texto plano cuando ocurre un error.
      }
      throw new Error(message);
    }

    return response.blob();
  },

  deleteFile: async (fileId: string) => {
    return apiFetch(`/files/${encodeURIComponent(fileId)}`, {
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
    return apiFetch(`/authors/submission/${encodeURIComponent(submissionId)}`);
  },

  async deleteAuthor(authorId: number) {
    return apiFetch(`/authors/${authorId}`, {
      method: 'DELETE',
    });
  },

  async finalizeSubmission(submissionId: string) {
    return apiFetch(`/submissions/${encodeURIComponent(submissionId)}/finalize`, {
      method: 'PATCH',
    });
  }

};