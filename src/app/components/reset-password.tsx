import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { resetPassword } from '../../services/authService';
import { getPasswordValidationError } from '../lib/password-validation';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'No fue posible restablecer la contraseña. Inténtalo de nuevo.';
  }
  return error instanceof Error ? error.message : 'No fue posible restablecer la contraseña. Inténtalo de nuevo.';
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error('El enlace de restablecimiento no es válido o está incompleto.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({ token, password });
      toast.success(response.message || 'Contraseña restablecida correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold" style={{ color: FESC_DARK_RED }}>
          Restablecer contraseña
        </h1>
        {!token ? (
          <>
            <p className="mb-6 text-sm text-red-700">
              El enlace no contiene un token válido. Solicita uno nuevo para continuar.
            </p>
            <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: FESC_RED }}>
              Solicitar otro enlace
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
              />
              <p className="mt-2 text-xs text-gray-500">
                Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
              </p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded px-4 py-2 font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: FESC_RED }}
            >
              {isSubmitting ? 'Restableciendo...' : 'Guardar nueva contraseña'}
            </button>
            <Link to="/login" className="inline-block text-sm hover:underline" style={{ color: FESC_RED }}>
              Volver al inicio de sesión
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
