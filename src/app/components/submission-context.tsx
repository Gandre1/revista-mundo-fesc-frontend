import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  EditorialSubmission,
  EditorialSubmissionQuery,
  SubmissionPagination,
  submissionService,
} from '../../services/submissionService';

interface SubmissionContextType {
  submissions: EditorialSubmission[];
  pagination: SubmissionPagination;
  loading: boolean;
  error: string | null;
  refreshSubmissions: (query?: EditorialSubmissionQuery) => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<EditorialSubmission[]>([]);
  const [pagination, setPagination] = useState<SubmissionPagination>({
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastQuery = useRef<EditorialSubmissionQuery>({});

  const refreshSubmissions = useCallback(async (query?: EditorialSubmissionQuery) => {
    if (query) lastQuery.current = query;
    setLoading(true);
    setError(null);

    try {
      const { submissions: result, pagination: resultPagination } =
        await submissionService.getEditorialSubmissions(query || lastQuery.current);
      setSubmissions(result);
      setPagination(resultPagination);
    } catch (cause) {
      console.error('Error al cargar los envíos:', cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar los envíos.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SubmissionContext.Provider value={{ submissions, pagination, loading, error, refreshSubmissions }}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmissions() {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error('useSubmissions must be used within a SubmissionProvider');
  }
  return context;
}
