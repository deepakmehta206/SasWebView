import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiResponse } from '../../../core/models/api-response.model';

/** Binary file-size display (1024-based). */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }

  if (bytes < 1024) {
    return `${Math.floor(bytes)} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${trimDecimal(kb)} KB`;
  }

  const mb = kb / 1024;
  if (mb < 1024) {
    return `${trimDecimal(mb)} MB`;
  }

  return `${trimDecimal(mb / 1024)} GB`;
}

function trimDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Parses Content-Disposition filename / filename* safely.
 * Returns null when header is missing or unsafe.
 */
export function parseContentDispositionFileName(header: string | null | undefined): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      const decoded = decodeURIComponent(utf8Match[1].trim().replace(/^["']|["']$/g, ''));
      return sanitizeDownloadFileName(decoded);
    } catch {
      // fall through
    }
  }

  const plainMatch = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  if (plainMatch?.[2]) {
    return sanitizeDownloadFileName(plainMatch[2].trim());
  }

  return null;
}

export function sanitizeDownloadFileName(name: string): string | null {
  const base = name.replace(/[/\\]/g, '').trim();
  if (!base || base === '.' || base === '..' || base.includes('..')) {
    return null;
  }
  return base.slice(0, 255);
}

export function normalizeFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  if (idx < 0) {
    return '';
  }
  return fileName.slice(idx).toLowerCase();
}

export function validateClientFile(
  file: File,
  allowedExtensions: readonly string[],
  maxBytes: number
): string | null {
  if (!file || file.size <= 0) {
    return 'Selected file is empty.';
  }
  if (file.size > maxBytes) {
    return 'File size exceeds the allowed limit.';
  }
  const ext = normalizeFileExtension(file.name);
  if (!allowedExtensions.some((item) => item.toLowerCase() === ext)) {
    return `File type '${ext || '(none)'}' is not allowed.`;
  }
  return null;
}

export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Maps JSON-inside-Blob download errors into HttpErrorResponse-compatible shape. */
export async function httpErrorFromBlobResponse(
  status: number,
  blob: Blob,
  fallbackMessage: string
): Promise<HttpErrorResponse> {
  let body: ApiResponse<unknown> | { message?: string } | null = null;
  try {
    const text = await blob.text();
    body = text ? (JSON.parse(text) as ApiResponse<unknown>) : null;
  } catch {
    body = null;
  }

  const errors: ApiError[] =
    body && 'errors' in body && Array.isArray(body.errors) && body.errors.length
      ? body.errors
      : [{ code: 'HTTP_ERROR', message: body?.message || fallbackMessage }];

  return new HttpErrorResponse({
    status,
    error: {
      success: false,
      message: body?.message || fallbackMessage,
      data: null,
      errors
    } satisfies ApiResponse<unknown>,
    statusText: 'Error'
  });
}
