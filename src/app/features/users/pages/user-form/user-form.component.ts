import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { BranchDto } from '../../../branch/models/branch.model';
import { BranchService } from '../../../branch/services/branch.service';
import { TenantContextService } from '../../../tenant/services/tenant-context.service';
import { RoleDto } from '../../../roles/models/role.model';
import { RoleService } from '../../../roles/services/role.service';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRoleAssignmentRequest
} from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly branchService = inject(BranchService);
  private readonly tenantContext = inject(TenantContextService);

  readonly isEdit = signal(false);
  readonly userId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);
  readonly branches = signal<BranchDto[]>([]);
  readonly roles = signal<RoleDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    password: [''],
    email: ['', [Validators.email, Validators.maxLength(256)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(50)]],
    defaultBranchId: [''],
    status: ['Active', [Validators.required, Validators.maxLength(30)]],
    roleAssignments: this.fb.array([])
  });

  get roleAssignments(): FormArray {
    return this.form.controls.roleAssignments as FormArray;
  }

  ngOnInit(): void {
    this.loadLookups();
    const rawId = this.route.snapshot.paramMap.get('userId');
    if (!rawId) {
      this.isEdit.set(false);
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(200)
      ]);
      this.form.controls.password.updateValueAndValidity();
      this.addRoleRow();
      return;
    }

    const userId = Number(rawId);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid user id.');
      return;
    }

    this.isEdit.set(true);
    this.userId.set(userId);
    this.loadUser(userId);
  }

  addRoleRow(roleId: number | null = null, branchId: number | null = null): void {
    this.roleAssignments.push(
      this.fb.nonNullable.group({
        roleId: [roleId == null ? '' : String(roleId), [Validators.required]],
        branchId: [branchId == null ? '' : String(branchId)]
      })
    );
  }

  removeRoleRow(index: number): void {
    this.roleAssignments.removeAt(index);
  }

  loadLookups(): void {
    const tenantId = this.tenantContext.tenantId();
    this.branchService.getList(tenantId).subscribe({
      next: (response) => this.branches.set(response.data ?? []),
      error: () => this.branches.set([])
    });
    this.roleService.getList().subscribe({
      next: (response) => this.roles.set(response.data ?? []),
      error: () => this.roles.set([])
    });
  }

  loadUser(userId: number): void {
    this.loading.set(true);
    this.userService.getById(userId).subscribe({
      next: (response) => {
        const user = response.data;
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
        this.roleAssignments.clear();
        if (user.roles.length === 0) {
          this.addRoleRow();
        } else {
          user.roles.forEach((role) => this.addRoleRow(role.roleId, role.branchId ?? null));
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load user.'));
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set([]);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    const value = this.form.getRawValue();
    const rolePayload: UserRoleAssignmentRequest[] = (value.roleAssignments as Array<{ roleId: string; branchId: string }>)
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

      this.userService.update(userId, request).subscribe({
        next: () => {
          this.userService.assignRoles(userId, { roles: rolePayload }).subscribe({
            next: () => {
              this.saving.set(false);
              void this.router.navigate(['/users', userId]);
            },
            error: (error: unknown) => this.handleError(error)
          });
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

    this.userService.create(request).subscribe({
      next: (response) => {
        this.saving.set(false);
        const id = response.data?.userId;
        void this.router.navigate(id ? ['/users', id] : ['/users']);
      },
      error: (error: unknown) => this.handleError(error)
    });
  }

  private handleError(error: unknown): void {
    this.fieldErrors.set(extractApiErrors(error));
    this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save user.'));
    this.saving.set(false);
  }
}
