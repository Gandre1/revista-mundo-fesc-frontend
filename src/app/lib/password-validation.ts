export const PASSWORD_REQUIREMENTS =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

export function getPasswordValidationError(password: string): string | null {
  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return PASSWORD_REQUIREMENTS;
  }

  return null;
}
