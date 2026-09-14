import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { MasterApiService } from '../../../masters/services/master-api.service';
import {
  ENTITY_STATUS_OPTIONS,
  TENANT_TYPE_OPTIONS
} from '../../../tenant/models/tenant.model';
import { PlatformTenantDetail, PlatformTenantUpdateRequest } from '../../models/admin.models';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';

@Component({
  selector: 'app-tenant-edit',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './tenant-edit.component.html',
  styleUrl: './tenant-edit.component.scss'
})
export class TenantEditComponent implements OnInit {
  private readonly api = inject(AdminTenantsApiService);
  private readonly masterApi = inject(MasterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly tenantTypes = TENANT_TYPE_OPTIONS;
  readonly statusOptions = ENTITY_STATUS_OPTIONS;
  readonly currencies = signal<Array<{ currencyCode: string; currencyName: string }>>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly tenant = signal<PlatformTenantDetail | null>(null);
  readonly errorMessage = signal<string | null>(null);
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
    this.masterApi
      .getList<{ currencyCode: string; currencyName: string }>('/currencies', { isActive: true })
      .subscribe({
        next: (data) => this.currencies.set(data),
        error: () => this.currencies.set([])
      });
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.tenant.set(null);
      this.errorMessage.set('Tenant was not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getTenant(id).subscribe({
      next: (data) => {
        this.tenant.set(data);
        this.form.patchValue({
          tenantCode: data.tenantCode,
          tenantName: data.tenantName,
          tenantType: data.tenantType,
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          timeZone: data.timeZone ?? '',
          currencyCode: data.currencyCode ?? '',
          status: data.status
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.tenant.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant.'));
        this.loading.set(false);
      }
    });
  }

  save(): void {
    const current = this.tenant();
    this.form.markAllAsTouched();
    this.fieldErrors.set([]);
    if (!current) {
      return;
    }
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    const value = this.form.getRawValue();
    const request: PlatformTenantUpdateRequest = {
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
    this.api.updateTenant(current.tenantId, request).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/admin/tenants', current.tenantId]);
      },
      error: (error: unknown) => {
        this.fieldErrors.set(extractApiErrors(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update tenant.'));
        this.saving.set(false);
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

  private emptyToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
}
