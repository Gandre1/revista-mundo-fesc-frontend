import axios from 'axios';
import { API_URL, getApiAuthHeaders } from '../app/lib/api';

export interface AuditLog {
  id: number;
  user_id: string | null;
  action: string;
  target_model: string;
  target_id: string | null;
  details: Record<string, unknown> | string | null;
  ip_address: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

export interface AuditLogsFilters {
  page?: number;
  limit?: number;
  userId?: string;
  user?: string;
  action?: string;
  target?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditSummary {
  total: number;
  byAction: Array<{
    action: string;
    total: number;
  }>;
}

function getAudit<T>(path: string, params?: AuditLogsFilters): Promise<T> {
  const filteredParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    : undefined;

  return axios
    .get<T>(`${API_URL}/audit-logs${path}`, {
      headers: getApiAuthHeaders(),
      params: filteredParams,
    })
    .then(({ data }) => data);
}

export function getAuditLogs(filters: AuditLogsFilters = {}): Promise<AuditLogsResponse> {
  return getAudit<AuditLogsResponse>('', filters);
}

export function getAuditSummary(): Promise<AuditSummary> {
  return getAudit<AuditSummary>('/summary');
}
