import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  FileDownloadResult,
  FileDto,
  FileListQuery,
  FileUploadResultDto
} from '../models/files.models';
import {
  httpErrorFromBlobResponse,
  parseContentDispositionFileName
} from '../utils/file-display.util';

@Injectable({ providedIn: 'root' })
export class FilesApiService {
  private readonly api = inject(ApiService);

  list(query?: FileListQuery): Observable<FileDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (query?.isActive !== undefined) {
      params['isActive'] = query.isActive;
    }
    if (query?.skip !== undefined) {
      params['skip'] = query.skip;
    }
    if (query?.take !== undefined) {
      params['take'] = query.take;
    }

    return this.api
      .get<ApiResponse<FileDto[]>>('/files', { params })
      .pipe(map((response) => response.data ?? []));
  }

  getById(fileId: number): Observable<FileDto> {
    return this.api
      .get<ApiResponse<FileDto>>(`/files/${fileId}`)
      .pipe(map((response) => response.data as FileDto));
  }

  upload(file: File): Observable<FileUploadResultDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.api
      .postFormData<ApiResponse<FileUploadResultDto>>('/files', formData)
      .pipe(map((response) => response.data as FileUploadResultDto));
  }

  delete(fileId: number): Observable<void> {
    return this.api
      .delete<ApiResponse<null>>(`/files/${fileId}`)
      .pipe(map(() => undefined));
  }

  download(fileId: number, fallbackFileName?: string | null): Observable<FileDownloadResult> {
    return this.api.getBlobResponse(`/files/${fileId}/download`).pipe(
      switchMap((response) => {
        const blob = response.body;
        if (!blob) {
          return throwError(
            () =>
              new HttpErrorResponse({
                status: response.status,
                error: { message: 'Empty download response.' }
              })
          );
        }

        const contentType = response.headers.get('Content-Type') ?? blob.type ?? null;
        const isJsonError =
          response.status >= 400 ||
          (contentType?.toLowerCase().includes('application/json') ?? false);

        if (isJsonError) {
          return from(
            httpErrorFromBlobResponse(
              response.status || 400,
              blob,
              response.status === 404 ? 'File not found.' : 'Unable to download file.'
            )
          ).pipe(switchMap((error) => throwError(() => error)));
        }

        const fromHeader = parseContentDispositionFileName(
          response.headers.get('Content-Disposition')
        );
        const fileName = fromHeader || fallbackFileName?.trim() || `file-${fileId}`;

        return from(
          Promise.resolve({
            blob,
            fileName,
            contentType
          } satisfies FileDownloadResult)
        );
      })
    );
  }
}
