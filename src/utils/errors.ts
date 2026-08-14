/**
 * Shared error-handling helpers used by services, hooks, and the
 * ErrorBoundary component.
 */

export class AppError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/** Turns any thrown value into a safe, user-displayable message. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

/** Narrow, dev-only logger so production console stays quiet. */
export function logError(context: string, err: unknown): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
  }
}
