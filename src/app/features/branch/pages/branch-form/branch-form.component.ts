import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { ENTITY_STATUS_OPTIONS } from '../../../tenant/models/tenant.model';
import { TenantContextService } from '../../../tenant/services/tenant-context.service';
import { CreateBranchRequest, UpdateBranchRequest } from '../../models/branch.model';
import { BranchContextService } from '../../services/branch-context.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.scss'
})
export class BranchFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly branchService = inject(BranchService);
  private readonly branchContext = inject(BranchContextService);
  private readonly tenantContext = inject(TenantContextService);

  readonly statusOptions = ENTITY_STATUS_OPTIONS;
  readonly isEdit = signal(false);
  readonly branchId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);
  readonly loadFailed = signal(false);

  readonly form = this.fb.nonNullable.group({
    branchCode: ['', [Validators.required, Validators.maxLength(50)]],
    branchName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.email, Validators.maxLength(256)]],
    phone: ['', [Validators.maxLength(50)]],
    address: ['', [Validators.maxLength(500)]],
    city: ['', [Validators.maxLength(100)]],
    state: ['', [Validators.maxLength(100)]],
    country: ['', [Validators.maxLength(100)]],
    status: ['Active', [Validators.required, Validators.maxLength(30)]]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('branchId');
    if (!rawId) {
      this.isEdit.set(false);
      return;
    }

    const branchId = Number(rawId);
    if (!Number.isFinite(branchId) || branchId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid branch id.');
      return;
    }

    this.isEdit.set(true);
    this.branchId.set(branchId);
    this.loadBranch(branchId);
  }

  loadBranch(branchId: number): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.errorMessage.set(null);

    this.branchService.getById(this.tenantContext.tenantId(), branchId).subscribe({
      next: (response) => {
        const branch = response.data;
        if (!branch) {
          this.loadFailed.set(true);
          this.errorMessage.set('Branch not found.');
          this.loading.set(false);
          return;
        }

        this.form.patchValue({
          branchCode: branch.branchCode,
          branchName: branch.branchName,
          email: branch.email ?? '',
          phone: branch.phone ?? '',
          address: branch.address ?? '',
          city: branch.city ?? '',
          state: branch.state ?? '',
          country: branch.country ?? '',
          status: branch.status
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load branch.'));
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

    const value = this.form.getRawValue();
    const payload = {
      branchCode: value.branchCode.trim(),
      branchName: value.branchName.trim(),
      email: this.emptyToNull(value.email),
      phone: this.emptyToNull(value.phone),
      address: this.emptyToNull(value.address),
      city: this.emptyToNull(value.city),
      state: this.emptyToNull(value.state),
      country: this.emptyToNull(value.country),
      status: value.status.trim()
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    const tenantId = this.tenantContext.tenantId();

    if (this.isEdit()) {
      const branchId = this.branchId();
      if (branchId == null) {
        this.saving.set(false);
        return;
      }

      const request: UpdateBranchRequest = payload;
      this.branchService.update(tenantId, branchId, request).subscribe({
        next: (response) => {
          if (response.data) {
            this.branchContext.upsertBranch(response.data);
          }
          this.successMessage.set(response.message || 'Branch updated.');
          this.saving.set(false);
          void this.router.navigate(['/settings/branches']);
        },
        error: (error: unknown) => this.handleSaveError(error)
      });
      return;
    }

    const request: CreateBranchRequest = payload;
    this.branchService.create(tenantId, request).subscribe({
      next: (response) => {
        if (response.data) {
          this.branchContext.upsertBranch(response.data);
          this.branchContext.selectBranch(response.data.branchId);
        }
        this.successMessage.set(response.message || 'Branch created.');
        this.saving.set(false);
        void this.router.navigate(['/settings/branches']);
      },
      error: (error: unknown) => this.handleSaveError(error)
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

  private handleSaveError(error: unknown): void {
    this.fieldErrors.set(extractApiErrors(error));
    this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save branch.'));
    this.saving.set(false);
  }

  private emptyToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
}
