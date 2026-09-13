/** Mirrors SaaSPlatform.Application DTOs for Phase 8 files. */

export interface FileDto {
  fileId: number;
  originalFileName: string;
  contentType: string;
  fileExtension: string;
  fileSizeBytes: number;
  storageProvider: string;
  checksumSha256: string | null;
  status: string;
  createdDate: string;
  createdBy: number | null;
  modifiedDate: string | null;
  isActive: boolean;
}

export interface FileUploadResultDto {
  fileId: number;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  createdDate: string;
}

export interface FileListQuery {
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface FileDownloadResult {
  blob: Blob;
  fileName: string;
  contentType: string | null;
}

export const FILE_ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'] as const;

export const FILE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const FILE_ACCEPT_ATTR = '.pdf,.png,.jpg,.jpeg,.docx';
