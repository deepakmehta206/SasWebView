import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { FilesApiService } from '../../../files/services/files-api.service';
import {
  FILE_ACCEPT_ATTR,
  FILE_ALLOWED_EXTENSIONS,
  FILE_MAX_SIZE_BYTES
} from '../../../files/models/files.models';
import {
  formatFileSize,
  triggerBrowserDownload,
  validateClientFile
} from '../../../files/utils/file-display.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import {
  EmployeeDocumentDto,
  EmployeeDto,
  EmployeeProfileDto,
  SensitiveEmployeeProfileDto
} from '../../models/hrms.models';

interface DocumentTypeRow {
  documentTypeId: number;
  documentTypeCode: string;
  documentTypeName: string;
}

@Component({
  selector: 'app-employees-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './employees-detail.component.html',
  styleUrl: './employees-detail.component.scss'
})
export class EmployeeDetailComponent implements OnInit {
  @ViewChild('documentFileInput') private readonly documentFileInput?: ElementRef<HTMLInputElement>;

  private readonly api = inject(HrmsApiService);
  private readonly filesApi = inject(FilesApiService);
  private readonly masters = inject(MasterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly permissions = inject(PermissionService);

  readonly permissionCodes = PermissionCodes;
  readonly acceptAttr = FILE_ACCEPT_ATTR;
  readonly formatSize = formatFileSize;

  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly savingDocument = signal(false);
  readonly downloadingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly sensitiveError = signal<string | null>(null);
  readonly employee = signal<EmployeeDto | null>(null);
  readonly profile = signal<EmployeeProfileDto | null>(null);
  readonly sensitive = signal<SensitiveEmployeeProfileDto | null>(null);
  readonly documents = signal<EmployeeDocumentDto[]>([]);
  readonly documentTypes = signal<DocumentTypeRow[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly canViewSensitive = this.permissions.hasPermission(PermissionCodes.EmployeeProfileSensitive);
  readonly canUploadFile = this.permissions.hasPermission(PermissionCodes.FileUpload);
  readonly canDownloadFile = this.permissions.hasPermission(PermissionCodes.FileView);

  private employeeId = 0;

  readonly profileForm = this.fb.nonNullable.group({
    fatherName: [''],
    motherName: [''],
    address: [''],
    cityId: [null as number | null],
    stateId: [null as number | null],
    countryId: [null as number | null],
    postalCode: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    bloodGroup: [''],
    maritalStatus: [''],
    bankAccountNumber: [''],
    bankName: [''],
    ifscCode: [''],
    pan: [''],
    aadhaarLast4: ['']
  });

  readonly documentForm = this.fb.nonNullable.group({
    documentTypeId: [0 as number, [Validators.required, Validators.min(1)]],
    documentNumber: [''],
    issueDate: [''],
    expiryDate: [''],
    status: ['ACTIVE']
  });

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.masters.getList<DocumentTypeRow>('/document-types', { isActive: true }).subscribe({
      next: (rows) => this.documentTypes.set(rows),
      error: () => this.documentTypes.set([])
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getEmployee(this.employeeId).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.loading.set(false);
        this.loadProfile();
        this.loadDocuments();
        if (this.canViewSensitive) {
          this.loadSensitive();
        }
      },
      error: (error) => {
        this.employee.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load employee.'));
        this.loading.set(false);
      }
    });
  }

  private loadProfile(): void {
    this.api.getEmployeeProfile(this.employeeId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          fatherName: profile.fatherName ?? '',
          motherName: profile.motherName ?? '',
          address: profile.address ?? '',
          cityId: profile.cityId,
          stateId: profile.stateId,
          countryId: profile.countryId,
          postalCode: profile.postalCode ?? '',
          emergencyContactName: profile.emergencyContactName ?? '',
          emergencyContactPhone: profile.emergencyContactPhone ?? '',
          bloodGroup: profile.bloodGroup ?? '',
          maritalStatus: profile.maritalStatus ?? ''
        });
      },
      error: () => this.profile.set(null)
    });
  }

  private loadSensitive(): void {
    this.sensitiveError.set(null);
    this.api.getSensitiveProfile(this.employeeId).subscribe({
      next: (sensitive) => {
        this.sensitive.set(sensitive);
        this.profileForm.patchValue({
          bankAccountNumber: sensitive.bankAccountNumber ?? '',
          bankName: sensitive.bankName ?? '',
          ifscCode: sensitive.ifscCode ?? '',
          pan: sensitive.pan ?? '',
          aadhaarLast4: sensitive.aadhaarLast4 ?? ''
        });
      },
      error: (error: unknown) => {
        this.sensitive.set(null);
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.sensitiveError.set('You do not have permission to view sensitive profile data.');
          return;
        }
        this.sensitiveError.set(extractApiErrorMessage(error, 'Unable to load sensitive profile.'));
      }
    });
  }

  private loadDocuments(): void {
    this.api.getEmployeeDocuments(this.employeeId).subscribe({
      next: (rows) => this.documents.set(rows),
      error: () => this.documents.set([])
    });
  }

  saveProfile(): void {
    if (this.savingProfile()) {
      return;
    }
    this.savingProfile.set(true);
    this.errorMessage.set(null);
    const value = this.profileForm.getRawValue();
    const body: Record<string, unknown> = {
      fatherName: value.fatherName.trim() || null,
      motherName: value.motherName.trim() || null,
      address: value.address.trim() || null,
      cityId: value.cityId ? Number(value.cityId) : null,
      stateId: value.stateId ? Number(value.stateId) : null,
      countryId: value.countryId ? Number(value.countryId) : null,
      postalCode: value.postalCode.trim() || null,
      emergencyContactName: value.emergencyContactName.trim() || null,
      emergencyContactPhone: value.emergencyContactPhone.trim() || null,
      bloodGroup: value.bloodGroup.trim() || null,
      maritalStatus: value.maritalStatus.trim() || null
    };
    if (this.canViewSensitive) {
      body['bankAccountNumber'] = value.bankAccountNumber.trim() || null;
      body['bankName'] = value.bankName.trim() || null;
      body['ifscCode'] = value.ifscCode.trim() || null;
      body['pan'] = value.pan.trim() || null;
      body['aadhaarLast4'] = value.aadhaarLast4.trim() || null;
    }
    this.api.saveEmployeeProfile(this.employeeId, body).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.savingProfile.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save profile.'));
        this.savingProfile.set(false);
      }
    });
  }

  openDocumentFilePicker(): void {
    if (!this.canUploadFile || this.savingDocument()) {
      return;
    }
    this.documentFileInput?.nativeElement.click();
  }

  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    const validationError = validateClientFile(file, FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES);
    if (validationError) {
      this.selectedFile.set(null);
      this.errorMessage.set(validationError);
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile.set(file);
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
    if (this.documentFileInput) {
      this.documentFileInput.nativeElement.value = '';
    }
  }

  addDocument(): void {
    if (this.documentForm.invalid || this.savingDocument()) {
      this.documentForm.markAllAsTouched();
      return;
    }

    this.savingDocument.set(true);
    this.errorMessage.set(null);
    const value = this.documentForm.getRawValue();
    const file = this.selectedFile();

    const createDocument = (fileId: number | null): void => {
      this.api
        .createEmployeeDocument(this.employeeId, {
          documentTypeId: Number(value.documentTypeId),
          documentNumber: value.documentNumber.trim() || null,
          fileId,
          issueDate: value.issueDate || null,
          expiryDate: value.expiryDate || null,
          status: value.status || 'ACTIVE'
        })
        .subscribe({
          next: () => {
            this.savingDocument.set(false);
            this.documentForm.reset({
              documentTypeId: 0,
              documentNumber: '',
              issueDate: '',
              expiryDate: '',
              status: 'ACTIVE'
            });
            this.clearSelectedFile();
            this.loadDocuments();
          },
          error: (error) => {
            this.errorMessage.set(
              extractApiErrorMessage(
                error,
                fileId
                  ? 'File uploaded, but the document record could not be created. The file was kept.'
                  : 'Unable to add document.'
              )
            );
            this.savingDocument.set(false);
          }
        });
    };

    if (file) {
      if (!this.canUploadFile) {
        this.errorMessage.set('You do not have permission to upload files.');
        this.savingDocument.set(false);
        return;
      }

      this.filesApi.upload(file).subscribe({
        next: (uploaded) => createDocument(uploaded.fileId),
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to upload file.'));
          this.savingDocument.set(false);
        }
      });
      return;
    }

    createDocument(null);
  }

  downloadDocumentFile(fileId: number, fallbackName?: string | null): void {
    if (!this.canDownloadFile) {
      return;
    }

    this.downloadingId.set(fileId);
    this.errorMessage.set(null);
    this.filesApi.download(fileId, fallbackName ?? `document-${fileId}`).subscribe({
      next: (result) => {
        triggerBrowserDownload(result.blob, result.fileName);
        this.downloadingId.set(null);
      },
      error: (error: unknown) => {
        this.downloadingId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'File not found.'));
      }
    });
  }

  deleteDocument(documentId: number): void {
    if (!confirm('Delete this document?')) {
      return;
    }
    this.api.deleteEmployeeDocument(this.employeeId, documentId).subscribe({
      next: () => this.loadDocuments(),
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to delete document.'));
      }
    });
  }
}
