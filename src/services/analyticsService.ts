import axios from 'axios';
import { API_URL, getApiAuthHeaders } from '../app/lib/api';

export type ArticleStatus =
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface AnalyticsOverview {
  totalArticles: number;
  articlesByStatus: Record<ArticleStatus, number>;
  acceptanceRate: number;
  usersByRole: Record<string, number>;
}

export interface EditorialTimes {
  averageDecisionDays: number | null;
  reviews: {
    assigned: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
}

export interface IssueSummary {
  id: number;
  volume: number;
  number: number;
  year: number;
  title: string | null;
  published_at: string | null;
  articles_count: number;
}

export interface IssuesSummary {
  issues: IssueSummary[];
}

function getAnalytics<T>(path: string): Promise<T> {
  return axios
    .get<T>(`${API_URL}/analytics/${path}`, { headers: getApiAuthHeaders() })
    .then(({ data }) => data);
}

export function getOverview(): Promise<AnalyticsOverview> {
  return getAnalytics<AnalyticsOverview>('overview');
}

export function getEditorialTimes(): Promise<EditorialTimes> {
  return getAnalytics<EditorialTimes>('editorial-times');
}

export function getIssuesSummary(): Promise<IssuesSummary> {
  return getAnalytics<IssuesSummary>('issues-summary');
}
