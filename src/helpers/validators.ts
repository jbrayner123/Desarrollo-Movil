/**
 * Validadores de formularios. Cada uno devuelve un mensaje de error en espanol,
 * o null si el valor es valido.
 */

export type Validator = (value: string) => string | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const required =
  (label: string): Validator =>
  (value) =>
    value.trim() ? null : `Completa ${label.charAt(0).toLowerCase()}${label.slice(1)}.`;

export const email: Validator = (value) =>
  EMAIL_RE.test(value.trim()) ? null : 'Ingresa un correo válido, por ejemplo nombre@correo.com.';

export const minLength =
  (min: number, label: string): Validator =>
  (value) =>
    value.trim().length >= min ? null : `${label} debe tener al menos ${min} caracteres.`;

export const maxLength =
  (max: number, label: string): Validator =>
  (value) =>
    value.length <= max ? null : `${label} no puede superar ${max} caracteres.`;

export const password: Validator = (value) => {
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'La contraseña debe combinar letras y números.';
  return null;
};

export const matches =
  (other: string, message: string): Validator =>
  (value) =>
    value === other ? null : message;

/** Ejecuta varios validadores y devuelve el primer error encontrado. */
export function validate(value: string, ...validators: Validator[]): string | null {
  for (const v of validators) {
    const error = v(value);
    if (error) return error;
  }
  return null;
}

/** Valida un formulario completo: { campo: [validadores] } -> { campo: error }. */
export function validateForm<T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, Validator[]>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const error = validate(values[key] ?? '', ...(rules[key] ?? []));
    if (error) errors[key] = error;
  }
  return errors;
}
