/**
 * Shared result envelope for anything that talks to Supabase/Cloudinary
 * (or any other external service). Services return this instead of
 * throwing, so calling code can handle errors explicitly and
 * predictably.
 */
export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError };

export interface ServiceError {
  message: string;
  code?: string;
  cause?: unknown;
}

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function fail<T>(error: ServiceError): ServiceResult<T> {
  return { data: null, error };
}

export function toServiceError(err: unknown, fallbackMessage: string): ServiceError {
  if (err && typeof err === 'object' && 'message' in err) {
    const maybeCode = 'code' in err ? (err as { code?: string }).code : undefined;
    return {
      message: String((err as { message: unknown }).message) || fallbackMessage,
      code: maybeCode,
      cause: err,
    };
  }
  return { message: fallbackMessage, cause: err };
}
