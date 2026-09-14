import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { BranchDto } from '../../../branch/models/branch.model';
import { BranchService } from '../../../branch/services/branch.service';
import { RoleDto } from '../../../roles/models/role.model';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRoleAssignmentRequest
} from '../../../users/models/user.model';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { assignableRoles, parsePositiveId } from '../../utils/admin-iam.util';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password && !confirm) {
    return null;
  }
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-admin-tenant-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-user-form.component.html',
  styleUrl: './admin-tenant-user-form.component.scss'
})
export class AdminTenantUserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApi = inject(AdminTenantUsersApiService);
  private readonly rolesApi = inject(AdminTenantRolesApiService);
  private readonly branchService = inject(BranchService);

  readonly tenantId = signal<number | null>(null);
  readonly isEdit = signal(false);
  readonly userId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);
  readonly branches = signal<BranchDto[]>([]);
  readonly roles = signal<RoleDto[]>([]);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.maxLength(100)]],
      password: [''],
      confirmPassword: [''],
      email: ['', [Validators.email, Validators.maxLength(256)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(50)]],
      defaultBranchId: [''],
      status: ['Active', [Validators.required, Validators.maxLength(30)]],
      roleAssignments: this.fb.array([])
    },
    { validators: passwordsMatch }
  );

  get roleAssignments(): FormArray {
    return this.form.controls.roleAssignments as FormArray;
  }

  ngOnInit(): void {
    const tenantId = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    this.tenantId.set(tenantId);
    if (!tenantId) {
      this.loadFailed.set(true);
      this.errorMessage.set('Tenant was not found.');
      return;
    }

    this.loadLookups(tenantId);
    const rawUserId = this.route.snapshot.paramMap.get('userId');
    if (!rawUserId) {
      this.isEdit.set(false);
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(200)
      ]);
      this.form.controls.confirmPassword.setValidators([Validators.required]);
      this.form.controls.password.updateValueAndValidity();
      this.form.controls.confirmPassword.updateValueAndValidity();
      this.addRoleRow();
      return;
    }

    const userId = parsePositiveId(rawUserId);
    if (!userId) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid user id.');
      return;
    }

    this.isEdit.set(true);
    this.userId.set(userId);
    this.loadUser(tenantId, userId);
  }

  addRoleRow(roleId: number | null = null, branchId: number | null = null): void {
    this.roleAssignments.push(
      this.fb.nonNullable.group({
        roleId: [roleId == null ? '' : String(roleId)],
        branchId: [branchId == null ? '' : String(branchId)]
      })
    );
  }

  removeRoleRow(index: number): void {
    this.roleAssignments.removeAt(index);
  }

  save(): void {
    const tenantId = this.tenantId();
    if (!tenantId || this.saving()) {
      return;
    }

    this.errorMessage.set(null);
    this.fieldErrors.set([]);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    const value = this.form.getRawValue();
    const rolePayload: UserRoleAssignmentRequest[] = (
      value.roleAssignments as Array<{ roleId: string; branchId: string }>
    )
      .filter((row) => !!row.roleId)
      .map((row) => ({
        roleId: Number(row.roleId),
        branchId: row.branchId ? Number(row.branchId) : null
      }));

    this.saving.set(true);

    if (this.isEdit()) {
      const userId = this.userId()!;
      const request: UpdateUserRequest = {
        username: value.username.trim(),
        email: value.email.trim() || null,
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim() || null,
        phone: value.phone.trim() || null,
        defaultBranchId: value.defaultBranchId ? Number(value.defaultBranchId) : null,
        status: value.status.trim()
      };

      this.usersApi.updateUser(tenantId, userId, request).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/admin/tenants', tenantId, 'users', userId]);
        },
        error: (error: unknown) => this.handleError(error)
      });
      return;
    }

    const request: CreateUserRequest = {
      username: value.username.trim(),
      password: value.password,
      email: value.email.trim() || null,
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim() || null,
      phone: value.phone.trim() || null,
      defaultBranchId: value.defaultBranchId ? Number(value.defaultBranchId) : null,
      status: value.status.trim(),
      roles: rolePayload
    };

    this.usersApi.createUser(tenantId, request).subscribe({
      next: (created) => {
        this.saving.set(false);
        void this.router.navigate(
          created.userId
            ? ['/admin/tenants', tenantId, 'users', created.userId]
            : ['/admin/tenants', tenantId, 'users']
        );
      },
      error: (error: unknown) => this.handleError(error)
    });
  }

  private loadLookups(tenantId: number): void {
    this.branchService.getList(tenantId).subscribe({
      next: (response) => this.branches.set(response.data ?? []),
      error: () => this.branches.set([])
    });
    this.rolesApi.getRoles(tenantId).subscribe({
      next: (roles) => this.roles.set(assignableRoles(roles)),
      error: () => this.roles.set([])
    });
  }

  private loadUser(tenantId: number, userId: number): void {
    this.loading.set(true);
    this.usersApi.getUser(tenantId, userId).subscribe({
      next: (user) => {
        if (!user) {
          this.loadFailed.set(true);
          this.errorMessage.set('User not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          username: user.username,
          email: user.email ?? '',
          firstName: user.firstName,
          lastName: user.lastName ?? '',
          phone: user.phone ?? '',
          defaultBranchId: user.defaultBranchId == null ? '' : String(user.defaultBranchId),
          status: user.status
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load user.'));
        this.loading.set(false);
      }
    });
  }

  private handleError(error: unknown): void {
    this.fieldErrors.set(extractApiErrors(error));
    this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save user.'));
    this.saving.set(false);
  }
}
