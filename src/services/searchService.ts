import { apiFetch } from '../app/lib/api';

export type PublicSearchSort = 'relevance' | 'recent' | 'title';

export interface PublicSearchQuery {
  q?: string;
  query?: string;
  author?: string;
  volume?: number;
  issue?: number;
  section?: string;
  year?: number;
  doi?: string;
  sort?: PublicSearchSort;
  page?: number;
  limit?: number;
}

export interface PublicSearchArticle {
  id: string;
  titulo: string;
  resumen: string | null;
  palabras_clave: string | null;
  seccion: string | null;
  idioma: string | null;
  doi: string | null;
  fecha_envio: string | null;
  created_at: string | null;
  issue_id: number;
  volume: number;
  issue: number;
  year: number;
  published_at: string | null;
  authors: string | null;
}

export interface PublicSearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicSearchResponse {
  articles: PublicSearchArticle[];
  pagination: PublicSearchPagination;
}

export async function searchPublicArticles(
  filters: PublicSearchQuery = {}
): Promise<PublicSearchResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return apiFetch<PublicSearchResponse>(
    `/public/search${queryString ? `?${queryString}` : ''}`
  );
}
