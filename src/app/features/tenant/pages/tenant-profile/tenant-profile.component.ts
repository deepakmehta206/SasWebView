import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import {
  ENTITY_STATUS_OPTIONS,
  TENANT_TYPE_OPTIONS,
  TenantDto,
  UpdateTenantRequest
} from '../../models/tenant.model';
import { TenantContextService } from '../../services/tenant-context.service';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './tenant-profile.component.html',
  styleUrl: './tenant-profile.component.scss'
})
export class TenantProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);
  private readonly tenantContext = inject(TenantContextService);

  readonly tenantTypes = TENANT_TYPE_OPTIONS;
  readonly statusOptions = ENTITY_STATUS_OPTIONS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly statusUpdating = signal(false);
  readonly tenant = signal<TenantDto | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);

  readonly form = this.fb.nonNullable.group({
    tenantCode: ['', [Validators.required, Validators.maxLength(50)]],
    tenantName: ['', [Validators.required, Validators.maxLength(200)]],
    tenantType: ['Generic', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(256)]],
    phone: ['', [Validators.maxLength(50)]],
    address: ['', [Validators.maxLength(500)]],
    timeZone: ['', [Validators.maxLength(100)]],
    currencyCode: ['', [Validators.maxLength(10)]],
    status: ['Active', [Validators.required, Validators.maxLength(30)]]
  });

  ngOnInit(): void {
    this.loadTenant();
  }

  loadTenant(): void {
    const tenantId = this.tenantContext.tenantId();
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set([]);

    this.tenantService.getById(tenantId).subscribe({
      next: (response) => {
        const data = response.data;
        this.tenant.set(data);
        if (data) {
          this.patchForm(data);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.tenant.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant profile.'));
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.successMessage.set(null);
    this.fieldErrors.set([]);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    const tenantId = this.tenantContext.tenantId();
    const value = this.form.getRawValue();
    const request: UpdateTenantRequest = {
      tenantCode: value.tenantCode.trim(),
      tenantName: value.tenantName.trim(),
      tenantType: value.tenantType.trim(),
      email: this.emptyToNull(value.email),
      phone: this.emptyToNull(value.phone),
      address: this.emptyToNull(value.address),
      timeZone: this.emptyToNull(value.timeZone),
      currencyCode: this.emptyToNull(value.currencyCode),
      status: value.status.trim()
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    this.tenantService.update(tenantId, request).subscribe({
      next: (response) => {
        const data = response.data;
        this.tenant.set(data);
        if (data) {
          this.patchForm(data);
        }
        this.successMessage.set(response.message || 'Tenant updated.');
        this.saving.set(false);
      },
      error: (error: unknown) => {
        this.fieldErrors.set(extractApiErrors(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update tenant.'));
        this.saving.set(false);
      }
    });
  }

  toggleActive(): void {
    const current = this.tenant();
    if (!current) {
      return;
    }

    const nextActive = !current.isActive;
    const nextStatus = nextActive ? 'Active' : 'Inactive';

    this.statusUpdating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.tenantService
      .setStatus(this.tenantContext.tenantId(), { status: nextStatus, isActive: nextActive })
      .subscribe({
        next: (response) => {
          const updated: TenantDto = {
            ...current,
            status: nextStatus,
            isActive: nextActive
          };
          this.tenant.set(updated);
          this.form.controls.status.setValue(nextStatus);
          this.successMessage.set(response.message || 'Tenant status updated.');
          this.statusUpdating.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update tenant status.'));
          this.statusUpdating.set(false);
        }
      });
  }

  controlError(controlName: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters.`;
    }

    return 'Invalid value.';
  }

  private patchForm(tenant: TenantDto): void {
    this.form.patchValue({
      tenantCode: tenant.tenantCode,
      tenantName: tenant.tenantName,
      tenantType: tenant.tenantType,
      email: tenant.email ?? '',
      phone: tenant.phone ?? '',
      address: tenant.address ?? '',
      timeZone: tenant.timeZone ?? '',
      currencyCode: tenant.currencyCode ?? '',
      status: tenant.status
    });
  }

  private emptyToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
}
