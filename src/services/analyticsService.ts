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

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  issueId?: number;
  section?: string;
}

export interface ReviewerPerformance {
  nombre: string;
  correo: string;
  assignedReviews: number;
  completedReviews: number;
  pendingReviews: number;
  completionRate: number;
  averageResponseDays: number | null;
}

export interface ReviewersPerformance {
  reviewers: ReviewerPerformance[];
}

function getAnalytics<T>(path: string, filters: AnalyticsFilters = {}): Promise<T> {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  });
  const queryString = searchParams.toString();
  const query = queryString ? `?${queryString}` : '';
  return axios
    .get<T>(`${API_URL}/analytics/${path}${query}`, { headers: getApiAuthHeaders() })
    .then(({ data }) => data);
}

export function getOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
  return getAnalytics<AnalyticsOverview>('overview', filters);
}

export function getEditorialTimes(filters?: AnalyticsFilters): Promise<EditorialTimes> {
  return getAnalytics<EditorialTimes>('editorial-times', filters);
}

export function getIssuesSummary(filters?: AnalyticsFilters): Promise<IssuesSummary> {
  return getAnalytics<IssuesSummary>('issues-summary', filters);
}

export function getReviewersPerformance(filters?: AnalyticsFilters): Promise<ReviewersPerformance> {
  return getAnalytics<ReviewersPerformance>('reviewers', filters);
}
