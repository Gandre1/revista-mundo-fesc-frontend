import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SubmissionProvider } from './components/submission-context';
import { AuthProvider } from './components/auth-context';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <SubmissionProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </SubmissionProvider>
    </AuthProvider>
  );
}