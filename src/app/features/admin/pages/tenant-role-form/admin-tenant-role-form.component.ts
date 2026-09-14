import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { CreateRoleRequest, UpdateRoleRequest } from '../../../roles/models/role.model';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { PLATFORM_ROLE_CODE, isLockedRole, parsePositiveId } from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-role-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-role-form.component.html',
  styleUrl: './admin-tenant-role-form.component.scss'
})
export class AdminTenantRoleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rolesApi = inject(AdminTenantRolesApiService);

  readonly tenantId = signal<number | null>(null);
  readonly isEdit = signal(false);
  readonly roleId = signal<number | null>(null);
  readonly locked = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);

  readonly form = this.fb.nonNullable.group({
    roleCode: ['', [Validators.required, Validators.maxLength(50)]],
    roleName: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(500)]],
    isActive: [true]
  });

  ngOnInit(): void {
    const tenantId = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    this.tenantId.set(tenantId);
    if (!tenantId) {
      this.loadFailed.set(true);
      this.errorMessage.set('Tenant was not found.');
      return;
    }

    const rawId = this.route.snapshot.paramMap.get('roleId');
    if (!rawId) {
      this.isEdit.set(false);
      return;
    }
    const roleId = parsePositiveId(rawId);
    if (!roleId) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid role id.');
      return;
    }
    this.isEdit.set(true);
    this.roleId.set(roleId);
    this.load(tenantId, roleId);
  }

  save(): void {
    const tenantId = this.tenantId();
    if (!tenantId || this.saving()) {
      return;
    }
    if (this.locked()) {
      this.errorMessage.set('System roles cannot be modified.');
      return;
    }

    const value = this.form.getRawValue();
    if (value.roleCode.trim().toUpperCase() === PLATFORM_ROLE_CODE) {
      this.errorMessage.set('PLATFORM_ADMIN role cannot be created through tenant role management.');
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set([]);

    if (this.isEdit()) {
      const request: UpdateRoleRequest = {
        roleCode: value.roleCode.trim(),
        roleName: value.roleName.trim(),
        description: value.description.trim() || null,
        isActive: value.isActive
      };
      this.rolesApi.updateRole(tenantId, this.roleId()!, request).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/admin/tenants', tenantId, 'roles']);
        },
        error: (error: unknown) => this.handleError(error, 'Unable to update role.')
      });
      return;
    }

    const request: CreateRoleRequest = {
      roleCode: value.roleCode.trim(),
      roleName: value.roleName.trim(),
      description: value.description.trim() || null
    };
    this.rolesApi.createRole(tenantId, request).subscribe({
      next: (created) => {
        this.saving.set(false);
        void this.router.navigate(
          created.roleId
            ? ['/admin/tenants', tenantId, 'roles', created.roleId, 'permissions']
            : ['/admin/tenants', tenantId, 'roles']
        );
      },
      error: (error: unknown) => this.handleError(error, 'Unable to create role.')
    });
  }

  private load(tenantId: number, roleId: number): void {
    this.loading.set(true);
    this.rolesApi.getRole(tenantId, roleId).subscribe({
      next: (role) => {
        this.locked.set(isLockedRole(role));
        this.form.patchValue({
          roleCode: role.roleCode,
          roleName: role.roleName,
          description: role.description ?? '',
          isActive: role.isActive
        });
        if (this.locked()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load role.'));
        this.loading.set(false);
      }
    });
  }

  private handleError(error: unknown, fallback: string): void {
    this.fieldErrors.set(extractApiErrors(error));
    this.errorMessage.set(extractApiErrorMessage(error, fallback));
    this.saving.set(false);
  }
}
