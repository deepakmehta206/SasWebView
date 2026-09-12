import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiResponse } from '../models/api-response.model';

/**
 * Central API error extraction for feature pages.
 * Do not duplicate HttpErrorResponse parsing in every component.
 */
export function extractApiErrors(error: unknown): ApiError[] {
  if (!(error instanceof HttpErrorResponse)) {
    return [];
  }

  const body = error.error as ApiResponse<unknown> | null | undefined;
  if (body?.errors?.length) {
    return body.errors;
  }

  if (body?.message) {
    return [{ code: 'API_ERROR', message: body.message }];
  }

  if (error.status === 0) {
    return [{ code: 'NETWORK_ERROR', message: 'Unable to reach the API.' }];
  }

  if (error.status === 401) {
    return [
      {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.'
      }
    ];
  }

  if (error.status === 403) {
    return [{ code: 'FORBIDDEN', message: 'You do not have permission for this action.' }];
  }

  return [
    {
      code: 'HTTP_ERROR',
      message: error.message || `Request failed with status ${error.status}.`
    }
  ];
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const errors = extractApiErrors(error);
  if (errors.length > 0) {
    return errors.map((item) => item.message).join(' ');
  }

  return fallback;
}

export function extractApiErrorCode(error: unknown): string | null {
  const errors = extractApiErrors(error);
  return errors[0]?.code ?? null;
}
