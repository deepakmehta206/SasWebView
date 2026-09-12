import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { CreateRoleRequest, UpdateRoleRequest } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);

  readonly isEdit = signal(false);
  readonly roleId = signal<number | null>(null);
  readonly isSystemRole = signal(false);
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
    const rawId = this.route.snapshot.paramMap.get('roleId');
    if (!rawId) {
      this.isEdit.set(false);
      return;
    }
    const roleId = Number(rawId);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid role id.');
      return;
    }
    this.isEdit.set(true);
    this.roleId.set(roleId);
    this.load(roleId);
  }

  load(roleId: number): void {
    this.loading.set(true);
    this.roleService.getById(roleId).subscribe({
      next: (response) => {
        const role = response.data;
        if (!role) {
          this.loadFailed.set(true);
          this.errorMessage.set('Role not found.');
          this.loading.set(false);
          return;
        }
        this.isSystemRole.set(role.isSystemRole);
        this.form.patchValue({
          roleCode: role.roleCode,
          roleName: role.roleName,
          description: role.description ?? '',
          isActive: role.isActive
        });
        if (role.isSystemRole) {
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

  save(): void {
    if (this.isSystemRole()) {
      this.errorMessage.set('System roles cannot be modified.');
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }
    const value = this.form.getRawValue();
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
      this.roleService.update(this.roleId()!, request).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/roles']);
        },
        error: (error: unknown) => {
          this.fieldErrors.set(extractApiErrors(error));
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update role.'));
          this.saving.set(false);
        }
      });
      return;
    }

    const request: CreateRoleRequest = {
      roleCode: value.roleCode.trim(),
      roleName: value.roleName.trim(),
      description: value.description.trim() || null
    };
    this.roleService.create(request).subscribe({
      next: (response) => {
        this.saving.set(false);
        const id = response.data?.roleId;
        void this.router.navigate(id ? ['/roles', id, 'permissions'] : ['/roles']);
      },
      error: (error: unknown) => {
        this.fieldErrors.set(extractApiErrors(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create role.'));
        this.saving.set(false);
      }
    });
  }
}
