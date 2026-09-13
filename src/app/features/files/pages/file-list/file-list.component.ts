import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { formatNotificationDateTime } from '../../../../core/notifications/notification-display.util';
import {
  FILE_ACCEPT_ATTR,
  FILE_ALLOWED_EXTENSIONS,
  FILE_MAX_SIZE_BYTES,
  FileDto
} from '../../models/files.models';
import { FilesApiService } from '../../services/files-api.service';
import {
  formatFileSize,
  triggerBrowserDownload,
  validateClientFile
} from '../../utils/file-display.util';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent implements OnInit {
  @ViewChild('fileInput') private readonly fileInput?: ElementRef<HTMLInputElement>;

  private readonly api = inject(FilesApiService);
  private readonly permissions = inject(PermissionService);

  readonly permissionCodes = PermissionCodes;
  readonly acceptAttr = FILE_ACCEPT_ATTR;
  readonly formatSize = formatFileSize;
  readonly formatDate = formatNotificationDateTime;

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly actingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly rows = signal<FileDto[]>([]);
  readonly showDeleted = signal(false);
  readonly skip = signal(0);
  readonly hasMore = signal(false);

  readonly canUpload = this.permissions.hasPermission(PermissionCodes.FileUpload);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.skip.set(0);
    this.loadPage(false);
  }

  loadMore(): void {
    this.loadPage(true);
  }

  onShowDeletedChange(checked: boolean): void {
    this.showDeleted.set(checked);
    this.reload();
  }

  openFilePicker(): void {
    if (!this.canUpload || this.uploading()) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    const validationError = validateClientFile(file, FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES);
    if (validationError) {
      this.errorMessage.set(validationError);
      this.successMessage.set(null);
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.api.upload(file).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.successMessage.set(`Uploaded “${result.originalFileName}”.`);
        this.reload();
      },
      error: (error: unknown) => {
        this.uploading.set(false);
        this.errorMessage.set(
          extractApiErrorMessage(error, 'Unable to upload file.')
        );
      }
    });
  }

  download(row: FileDto): void {
    this.actingId.set(row.fileId);
    this.errorMessage.set(null);
    this.api.download(row.fileId, row.originalFileName).subscribe({
      next: (result) => {
        triggerBrowserDownload(result.blob, result.fileName);
        this.actingId.set(null);
      },
      error: (error: unknown) => {
        this.actingId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'File not found.'));
      }
    });
  }

  delete(row: FileDto): void {
    if (!confirm(`Delete file “${row.originalFileName}”?`)) {
      return;
    }

    this.actingId.set(row.fileId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.api.delete(row.fileId).subscribe({
      next: () => {
        this.actingId.set(null);
        this.successMessage.set('File deleted.');
        this.reload();
      },
      error: (error: unknown) => {
        this.actingId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to delete file.'));
      }
    });
  }

  private loadPage(append: boolean): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const skip = append ? this.skip() : 0;
    const isActive = this.showDeleted() ? undefined : true;

    this.api.list({ isActive, skip, take: PAGE_SIZE }).subscribe({
      next: (data) => {
        const nextRows = append ? [...this.rows(), ...data] : data;
        this.rows.set(nextRows);
        this.skip.set(skip + data.length);
        this.hasMore.set(data.length >= PAGE_SIZE);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        if (!append) {
          this.rows.set([]);
        }
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load files.'));
        this.loading.set(false);
      }
    });
  }
}
