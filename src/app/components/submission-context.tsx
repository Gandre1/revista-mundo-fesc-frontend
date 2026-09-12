import { createContext, useContext, useState, ReactNode } from 'react';

const FESC_RED = '#e30513';
const FESC_BLUE = '#0891b2';

// Types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  fileType: 'article' | 'other';
  uploadedAt: string;
  version: number;
}

export interface Contributor {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  afiliacion: string;
  orcid?: string;
  isPrincipal: boolean;
  role: 'author' | 'translator';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  text: string;
  timestamp: string;
  isPrivate: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'declined';
  recommendation?: 'accept' | 'revisions-required' | 'resubmit' | 'decline';
  comments?: string;
  dateAssigned: string;
  dateCompleted?: string;
  rating?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface SubmissionData {
  id?: string;
  number?: number;
  
  // Step 1: Inicio
  idioma: 'es' | 'en';
  titulo: string;
  seccion: string;
  checklistItems: boolean[];
  consentimientoPrivacidad: boolean;
  
  // Step 2: Detalles
  tituloIngles?: string;
  palabrasClave: string;
  resumen: string;
  referencias: string;
  
  // Step 3: Archivos
  files: FileUpload[];
  
  // Step 4: Colaboradores
  colaboradores: Contributor[];
  
  // Step 5: Para editores
  comentariosEditor: string;
  
  // Admin data
  status: 'draft' | 'submitted' | 'in-review' | 'revisions-required' | 'accepted' | 'rejected' | 'published';
  stage: 'submission' | 'review' | 'copyediting' | 'production';
  assignedEditor?: string;
  assignedEditorName?: string;
  reviews: Review[];
  comments: Comment[];
  activityLog: ActivityLog[];
  dateSubmitted?: string;
  dateDecision?: string;
  lastModified: string;
}

interface SubmissionContextType {
  submissions: SubmissionData[];
  currentSubmission: SubmissionData | null;
  addSubmission: (submission: SubmissionData) => void;
  updateSubmission: (id: string, updates: Partial<SubmissionData>) => void;
  getSubmission: (id: string) => SubmissionData | undefined;
  deleteSubmission: (id: string) => void;
  addComment: (submissionId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  addReview: (submissionId: string, review: Omit<Review, 'id' | 'dateAssigned'>) => void;
  updateReview: (submissionId: string, reviewId: string, updates: Partial<Review>) => void;
  addActivityLog: (submissionId: string, action: string, userId: string, userName: string, details?: string) => void;
  assignEditor: (submissionId: string, editorId: string, editorName: string) => void;
  changeStatus: (submissionId: string, newStatus: SubmissionData['status'], newStage?: SubmissionData['stage']) => void;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

// Mock data inicial
const MOCK_SUBMISSIONS: SubmissionData[] = [
  {
    id: '1793',
    number: 1793,
    idioma: 'es',
    titulo: 'Los ODS en las escuelas de administración: ¿qué tanto hemos avanzado?',
    seccion: 'Artículos de Investigación',
    checklistItems: [true, true, true, true, true, true],
    consentimientoPrivacidad: true,
    palabrasClave: 'ODS, educación superior, administración, sostenibilidad',
    resumen: 'Este artículo analiza la incorporación de los Objetivos de Desarrollo Sostenible en las escuelas de administración latinoamericanas.',
    referencias: 'UNESCO (2017). Education for Sustainable Development Goals.\nRaworth, K. (2017). Doughnut Economics.',
    files: [
      {
        id: 'f1',
        name: 'articulo-principal.docx',
        size: 2456789,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileType: 'article',
        uploadedAt: '2024-03-15T10:30:00',
        version: 1,
      },
    ],
    colaboradores: [
      {
        id: 'c1',
        nombre: 'María José',
        apellidos: 'Uribe Arévalo',
        email: 'mjuribe@universidad.edu',
        pais: 'CO',
        afiliacion: 'Universidad Nacional de Colombia',
        isPrincipal: true,
        role: 'author',
      },
      {
        id: 'c2',
        nombre: 'Carlos',
        apellidos: 'González',
        email: 'cgonzalez@universidad.edu',
        pais: 'CO',
        afiliacion: 'Universidad Nacional de Colombia',
        isPrincipal: false,
        role: 'author',
      },
    ],
    comentariosEditor: 'El artículo presenta una revisión sistemática importante para el campo.',
    status: 'in-review',
    stage: 'review',
    assignedEditor: 'ed1',
    assignedEditorName: 'Dr. Pedro Ramírez',
    reviews: [
      {
        id: 'r1',
        reviewerId: 'rev1',
        reviewerName: 'Dra. Ana Martínez',
        status: 'in-progress',
        dateAssigned: '2024-03-20T09:00:00',
      },
      {
        id: 'r2',
        reviewerId: 'rev2',
        reviewerName: 'Dr. Luis Fernández',
        status: 'completed',
        recommendation: 'revisions-required',
        comments: 'El artículo es sólido pero requiere mejorar la metodología en la sección 3.',
        dateAssigned: '2024-03-20T09:00:00',
        dateCompleted: '2024-04-01T14:30:00',
        rating: 4,
      },
    ],
    comments: [
      {
        id: 'com1',
        userId: 'ed1',
        userName: 'Dr. Pedro Ramírez',
        userRole: 'Editor',
        text: 'Artículo enviado a revisión por pares.',
        timestamp: '2024-03-20T09:00:00',
        isPrivate: true,
      },
    ],
    activityLog: [
      {
        id: 'log1',
        action: 'Envío recibido',
        userId: 'c1',
        userName: 'María José Uribe Arévalo',
        timestamp: '2024-03-15T10:30:00',
      },
      {
        id: 'log2',
        action: 'Editor asignado',
        userId: 'admin',
        userName: 'Sistema',
        timestamp: '2024-03-16T08:00:00',
        details: 'Dr. Pedro Ramírez',
      },
      {
        id: 'log3',
        action: 'Enviado a revisión',
        userId: 'ed1',
        userName: 'Dr. Pedro Ramírez',
        timestamp: '2024-03-20T09:00:00',
      },
    ],
    dateSubmitted: '2024-03-15T10:30:00',
    lastModified: '2024-04-01T14:30:00',
  },
  {
    id: '2058',
    number: 2058,
    idioma: 'es',
    titulo: 'Artículo en proceso',
    seccion: 'Artículos Originales',
    checklistItems: [true, false, false, false, false, false],
    consentimientoPrivacidad: true,
    palabrasClave: '',
    resumen: '',
    referencias: '',
    files: [],
    colaboradores: [],
    comentariosEditor: '',
    status: 'draft',
    stage: 'submission',
    reviews: [],
    comments: [],
    activityLog: [
      {
        id: 'log1',
        action: 'Borrador creado',
        userId: 'author1',
        userName: 'Autor Ejemplo',
        timestamp: '2024-04-03T15:20:00',
      },
    ],
    lastModified: '2024-04-03T15:20:00',
  },
];

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<SubmissionData[]>(MOCK_SUBMISSIONS);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionData | null>(null);

  const addSubmission = (submission: SubmissionData) => {
    const newSubmission = {
      ...submission,
      id: `${Date.now()}`,
      number: submissions.length + 1,
      status: 'draft' as const,
      stage: 'submission' as const,
      reviews: [],
      comments: [],
      activityLog: [
        {
          id: `log-${Date.now()}`,
          action: 'Borrador creado',
          userId: 'current-user',
          userName: 'Usuario Actual',
          timestamp: new Date().toISOString(),
        },
      ],
      lastModified: new Date().toISOString(),
    };
    setSubmissions([...submissions, newSubmission]);
    return newSubmission;
  };

  const updateSubmission = (id: string, updates: Partial<SubmissionData>) => {
    setSubmissions(
      submissions.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              ...updates,
              lastModified: new Date().toISOString(),
            }
          : sub
      )
    );
  };

  const getSubmission = (id: string) => {
    return submissions.find((sub) => sub.id === id);
  };

  const deleteSubmission = (id: string) => {
    setSubmissions(submissions.filter((sub) => sub.id !== id));
  };

  const addComment = (submissionId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `com-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    updateSubmission(submissionId, {
      comments: [...(getSubmission(submissionId)?.comments || []), newComment],
    });
  };

  const addReview = (submissionId: string, review: Omit<Review, 'id' | 'dateAssigned'>) => {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      dateAssigned: new Date().toISOString(),
    };
    
    updateSubmission(submissionId, {
      reviews: [...(getSubmission(submissionId)?.reviews || []), newReview],
    });
  };

  const updateReview = (submissionId: string, reviewId: string, updates: Partial<Review>) => {
    const submission = getSubmission(submissionId);
    if (!submission) return;

    const updatedReviews = submission.reviews.map((review) =>
      review.id === reviewId ? { ...review, ...updates } : review
    );

    updateSubmission(submissionId, { reviews: updatedReviews });
  };

  const addActivityLog = (submissionId: string, action: string, userId: string, userName: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      details,
    };

    const submission = getSubmission(submissionId);
    if (!submission) return;

    updateSubmission(submissionId, {
      activityLog: [...submission.activityLog, newLog],
    });
  };

  const assignEditor = (submissionId: string, editorId: string, editorName: string) => {
    updateSubmission(submissionId, {
      assignedEditor: editorId,
      assignedEditorName: editorName,
    });
    addActivityLog(submissionId, 'Editor asignado', 'admin', 'Sistema', editorName);
  };

  const changeStatus = (submissionId: string, newStatus: SubmissionData['status'], newStage?: SubmissionData['stage']) => {
    const updates: Partial<SubmissionData> = { status: newStatus };
    
    if (newStage) {
      updates.stage = newStage;
    }

    if (newStatus === 'submitted' && !getSubmission(submissionId)?.dateSubmitted) {
      updates.dateSubmitted = new Date().toISOString();
    }

    if (newStatus === 'accepted' || newStatus === 'rejected') {
      updates.dateDecision = new Date().toISOString();
    }

    updateSubmission(submissionId, updates);
    addActivityLog(submissionId, `Estado cambiado a: ${newStatus}`, 'admin', 'Sistema');
  };

  return (
    <SubmissionContext.Provider
      value={{
        submissions,
        currentSubmission,
        addSubmission,
        updateSubmission,
        getSubmission,
        deleteSubmission,
        addComment,
        addReview,
        updateReview,
        addActivityLog,
        assignEditor,
        changeStatus,
      }}
    >
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
