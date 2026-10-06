import React, { createContext, useCallback, useContext, useState } from 'react';
import { EditorialSubmission, submissionService } from '../../services/submissionService';

interface SubmissionContextType {
  submissions: EditorialSubmission[];
  loading: boolean;
  error: string | null;
  refreshSubmissions: () => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<EditorialSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { submissions: result } = await submissionService.getEditorialSubmissions();
      setSubmissions(result);
    } catch (cause) {
      console.error('Error al cargar los envíos:', cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar los envíos.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SubmissionContext.Provider value={{ submissions, loading, error, refreshSubmissions }}>
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
