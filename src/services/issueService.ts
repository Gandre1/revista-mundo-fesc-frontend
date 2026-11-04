import { apiFetch } from '../app/lib/api';

export interface Issue {
  id: number;
  volume: number;
  number: number;
  year: number;
  title: string | null;
  description: string | null;
  cover_url?: string | null;
  status: 'draft' | 'scheduled' | 'published';
  published_at?: string | null;
  created_at?: string;
}

export interface AssignIssuePayload {
  issue_id: number | null;
}

export interface CreateIssuePayload {
  volume: number;
  number: number;
  year: number;
  title: string;
  description?: string | null;
  status: 'draft' | 'scheduled' | 'published';
  published_at?: string | null;
}

export async function getIssues(): Promise<Issue[]> {
  const response = await apiFetch<{ issues: Issue[] }>('/issues');
  return response.issues;
}

export async function createIssue(data: CreateIssuePayload): Promise<Issue> {
  const response = await apiFetch<{ issue: Issue }>('/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.issue;
}

export async function updateIssue(issueId: number, data: CreateIssuePayload): Promise<Issue> {
  const response = await apiFetch<{ issue: Issue }>(`/issues/${encodeURIComponent(issueId)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.issue;
}

export async function deleteIssue(issueId: number): Promise<void> {
  await apiFetch<{ message: string }>(`/issues/${encodeURIComponent(issueId)}`, {
    method: 'DELETE',
  });
}

export async function uploadIssueCover(issueId: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('cover', file);
  const response = await apiFetch<{ cover_url: string }>(
    `/issues/${encodeURIComponent(issueId)}/cover`,
    {
      method: 'PATCH',
      body: formData,
    }
  );
  return response.cover_url;
}

export async function assignSubmissionToIssue(
  submissionId: string,
  issueId: number | null
): Promise<{ message: string; submissionId: string; issueId: number | null }> {
  const payload: AssignIssuePayload = { issue_id: issueId };
  return apiFetch<{ message: string; submissionId: string; issueId: number | null }>(
    `/submissions/${encodeURIComponent(submissionId)}/assign-issue`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}
