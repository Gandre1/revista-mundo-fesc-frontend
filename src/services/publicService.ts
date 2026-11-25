import { apiFetch, API_URL } from '../app/lib/api';
import type { Issue } from './issueService';

export interface PublicArticleAuthor {
  nombre: string;
  apellidos: string;
  email: string;
  afiliacion: string | null;
  pais: string | null;
  orcid: string | null;
  es_corresponsal: boolean;
  orden: number;
}

export interface PublicArticle {
  id: string;
  titulo: string;
  resumen: string | null;
  palabras_clave: string | null;
  seccion: string | null;
  idioma: string | null;
  estado: string;
  doi: string | null;
  pdf_galley_url: string | null;
  html_galley_url: string | null;
  fecha_envio: string | null;
  created_at?: string;
  updated_at?: string;
  authors: PublicArticleAuthor[];
}

export interface PublicIssueDetail {
  issue: Issue;
  articles: PublicArticle[];
}

export interface PublicSubmissionDetail {
  article: PublicArticle;
  issue: Issue;
}

export type PublicCitationStyle = 'apa' | 'ieee';
export type PublicCitationExportFormat = 'bibtex' | 'ris';

export interface PublicArticleCitation {
  articleId: string;
  style: PublicCitationStyle;
  citation: string;
}

export interface PublicArticleMetrics {
  articleId: string;
  views: number;
  downloads: number;
}

export function getScieloXmlUrl(submissionId: string): string {
  return `${API_URL}/public/submissions/${encodeURIComponent(submissionId)}/export/scielo-xml`;
}

export async function getPublicArticleCitation(
  submissionId: string,
  style: PublicCitationStyle
): Promise<PublicArticleCitation> {
  return apiFetch<PublicArticleCitation>(
    `/public/articles/${encodeURIComponent(submissionId)}/citation?style=${style}`
  );
}

export async function getPublicArticleMetrics(
  submissionId: string
): Promise<PublicArticleMetrics> {
  return apiFetch<PublicArticleMetrics>(
    `/public/articles/${encodeURIComponent(submissionId)}/metrics`
  );
}

export async function downloadPublicArticleCitation(
  submissionId: string,
  format: PublicCitationExportFormat
): Promise<void> {
  const response = await fetch(
    `${API_URL}/public/articles/${encodeURIComponent(submissionId)}/citation/export?format=${format}`,
    { headers: { 'Bypass-Tunnel-Reminder': 'true' } }
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message || `No fue posible descargar la referencia: ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `article-${submissionId}.${format === 'bibtex' ? 'bib' : 'ris'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function downloadScieloXml(submissionId: string): Promise<void> {
  const response = await fetch(getScieloXmlUrl(submissionId));
  if (!response.ok) throw new Error(`No fue posible descargar el XML: ${response.status}`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `submission-${submissionId}-scielo.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function getPublicIssues(): Promise<Issue[]> {
  const response = await apiFetch<{ issues: Issue[] }>('/public/issues');
  return response.issues;
}

export async function getPublicIssue(issueId: number | string): Promise<PublicIssueDetail> {
  return apiFetch<PublicIssueDetail>(
    `/public/issues/${encodeURIComponent(String(issueId))}`
  );
}

export async function getPublicSubmissionDetail(
  submissionId: string
): Promise<PublicSubmissionDetail> {
  return apiFetch<PublicSubmissionDetail>(
    `/public/submissions/${encodeURIComponent(submissionId)}`
  );
}
