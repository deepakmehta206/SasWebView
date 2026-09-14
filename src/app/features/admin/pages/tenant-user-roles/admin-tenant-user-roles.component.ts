import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchDto } from '../../../branch/models/branch.model';
import { BranchService } from '../../../branch/services/branch.service';
import { RoleDto } from '../../../roles/models/role.model';
import { UserDto, UserRoleAssignmentRequest } from '../../../users/models/user.model';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import {
  TENANT_ADMIN_ROLE_CODE,
  assignableRoles,
  isLastActiveTenantAdmin,
  parsePositiveId
} from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-user-roles',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-user-roles.component.html',
  styleUrl: './admin-tenant-user-roles.component.scss'
})
export class AdminTenantUserRolesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApi = inject(AdminTenantUsersApiService);
  private readonly rolesApi = inject(AdminTenantRolesApiService);
  private readonly branchService = inject(BranchService);

  readonly tenantId = signal<number | null>(null);
  readonly userId = signal<number | null>(null);
  readonly user = signal<UserDto | null>(null);
  readonly roles = signal<RoleDto[]>([]);
  readonly branches = signal<BranchDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private usersForWarning: UserDto[] = [];

  readonly form = this.fb.nonNullable.group({
    roleAssignments: this.fb.array([])
  });

  get roleAssignments(): FormArray {
    return this.form.controls.roleAssignments as FormArray;
  }

  ngOnInit(): void {
    const tenantId = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    const userId = parsePositiveId(this.route.snapshot.paramMap.get('userId'));
    this.tenantId.set(tenantId);
    this.userId.set(userId);
    if (!tenantId || !userId) {
      this.loadFailed.set(true);
      this.errorMessage.set('User was not found.');
      this.loading.set(false);
      return;
    }
    this.load(tenantId, userId);
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
    const userId = this.userId();
    if (!tenantId || !userId || this.saving()) {
      return;
    }

    this.form.markAllAsTouched();
    const payload: UserRoleAssignmentRequest[] = (
      this.form.getRawValue().roleAssignments as Array<{ roleId: string; branchId: string }>
    )
      .filter((row) => !!row.roleId)
      .map((row) => ({
        roleId: Number(row.roleId),
        branchId: row.branchId ? Number(row.branchId) : null
      }));

    const current = this.user();
    const nextHasTenantAdmin = payload.some((row) => {
      const role = this.roles().find((item) => item.roleId === row.roleId);
      return role?.roleCode.trim().toUpperCase() === TENANT_ADMIN_ROLE_CODE;
    });
    if (
      current &&
      isLastActiveTenantAdmin(this.usersForWarning, current.userId) &&
      !nextHasTenantAdmin
    ) {
      if (
        !confirm(
          `Remove TENANT_ADMIN from "${current.username}"? This appears to be the last active TENANT_ADMIN for the tenant.`
        )
      ) {
        return;
      }
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.usersApi.assignUserRoles(tenantId, userId, { roles: payload }).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/admin/tenants', tenantId, 'users', userId]);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update user roles.'));
        this.saving.set(false);
      }
    });
  }

  private load(tenantId: number, userId: number): void {
    this.loading.set(true);
    forkJoin({
      user: this.usersApi.getUser(tenantId, userId),
      users: this.usersApi.getUsers(tenantId),
      roles: this.rolesApi.getRoles(tenantId),
      branches: this.branchService.getList(tenantId)
    }).subscribe({
      next: ({ user, users, roles, branches }) => {
        this.user.set(user);
        this.roles.set(assignableRoles(roles));
        this.branches.set(branches.data ?? []);
        this.roleAssignments.clear();
        if (user.roles.length === 0) {
          this.addRoleRow();
        } else {
          user.roles.forEach((role) => this.addRoleRow(role.roleId, role.branchId ?? null));
        }
        this.usersForWarning = users;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load user roles.'));
        this.loading.set(false);
      }
    });
  }
}
