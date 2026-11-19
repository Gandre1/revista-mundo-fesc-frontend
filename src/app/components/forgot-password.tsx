import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { forgotPassword } from '../../services/authService';

const FESC_RED = '#e30513';
const FESC_DARK_RED = '#9c0f06';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'No fue posible enviar la solicitud. Inténtalo de nuevo.';
  }
  return error instanceof Error ? error.message : 'No fue posible enviar la solicitud. Inténtalo de nuevo.';
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
      toast.success(response.message || 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.');
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
          Recuperar contraseña
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          {submitted
            ? 'Si el correo corresponde a una cuenta, recibirás un enlace para restablecer la contraseña.'
            : 'Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones para restablecerla.'}
        </p>

        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 inline-block text-sm hover:underline" style={{ color: FESC_RED }}>
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}
