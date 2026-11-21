import { AppConfig } from '@/constants/config';
import type { Result } from '@/types/common';

export type AppErrorCode =
  | 'unknown'
  | 'storage'
  | 'audio'
  | 'haptics'
  | 'permission'
  | 'notification'
  | 'camera'
  | 'file'
  | 'validation';

/** Error type used throughout the app so callers can branch on `code`. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

/** Converts any thrown value into an AppError without losing the original. */
export function toAppError(error: unknown, code: AppErrorCode = 'unknown'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(code, error.message, error);
  return new AppError(code, typeof error === 'string' ? error : 'An unexpected error occurred', error);
}

/**
 * Single place to report errors. Currently logs in development;
 * plug a crash-reporting service in here later.
 */
export function logError(error: unknown, context?: string): void {
  if (!AppConfig.enableDebugLogs) return;
  const prefix = context ? `[${context}]` : '[error]';
  console.warn(prefix, error);
}

/** Runs an async operation and returns a Result instead of throwing. */
export async function tryAsync<T>(
  operation: () => Promise<T>,
  code: AppErrorCode = 'unknown',
  context?: string,
): Promise<Result<T, AppError>> {
  try {
    return { ok: true, value: await operation() };
  } catch (error) {
    const appError = toAppError(error, code);
    logError(appError, context ?? code);
    return { ok: false, error: appError };
  }
}

/** User-facing message for an error. Keep technical details out of the UI. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.code === 'validation') return error.message;
  return 'Something went wrong. Please try again.';
}
