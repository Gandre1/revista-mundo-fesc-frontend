import { apiFetch } from '../app/lib/api';

export type HelpContentType = 'faq' | 'guide' | 'policy';
export type HelpAudience = 'general' | 'author' | 'reviewer' | 'editor';

export interface HelpContent {
  id: number;
  title: string;
  slug: string;
  category: string;
  content_type: HelpContentType;
  audience: HelpAudience;
  content: string;
  display_order: number;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface HelpContentFilters {
  type?: HelpContentType;
  audience?: HelpAudience;
  category?: string;
}

export interface HelpContentPayload {
  title: string;
  slug: string;
  category: string;
  content_type: HelpContentType;
  audience: HelpAudience;
  content: string;
  display_order: number;
  is_active: boolean;
}

function buildHelpQuery(filters: HelpContentFilters): string {
  const query = new URLSearchParams();
  if (filters.type) query.set('type', filters.type);
  if (filters.audience) query.set('audience', filters.audience);
  if (filters.category) query.set('category', filters.category);
  const search = query.toString();
  return search ? `?${search}` : '';
}

export async function getPublicHelpContents(
  filters: HelpContentFilters = {}
): Promise<HelpContent[]> {
  const response = await apiFetch<{ items: HelpContent[] }>(`/help${buildHelpQuery(filters)}`);
  return response.items;
}

export async function getPublicHelpContentBySlug(slug: string): Promise<HelpContent> {
  const response = await apiFetch<{ item: HelpContent }>(
    `/help/${encodeURIComponent(slug)}`
  );
  return response.item;
}

export async function getAllHelpContents(
  filters: HelpContentFilters = {}
): Promise<HelpContent[]> {
  const response = await apiFetch<{ items: HelpContent[] }>(
    `/help/manage${buildHelpQuery(filters)}`
  );
  return response.items;
}

export async function createHelpContent(
  data: HelpContentPayload
): Promise<HelpContent> {
  const response = await apiFetch<{ message: string; item: HelpContent }>('/help', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.item;
}

export async function updateHelpContent(
  id: number,
  data: HelpContentPayload
): Promise<HelpContent> {
  const response = await apiFetch<{ message: string; item: HelpContent }>(
    `/help/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.item;
}

export async function deleteHelpContent(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/help/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
