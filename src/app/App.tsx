import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SubmissionProvider } from './components/submission-context';
import { AuthProvider } from './components/auth-context';

export default function App() {
  return (
    <AuthProvider>
      <SubmissionProvider>
        <RouterProvider router={router} />
      </SubmissionProvider>
    </AuthProvider>
  );
}