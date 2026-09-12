import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { PermissionDto, RoleDto } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

/**
 * Permission matrix catalog is built by unioning PermissionDto values from GET /roles.
 * LIMITATION (UI only, not a security boundary): permissions not assigned to any
 * available role may not appear until a role contains them. No backend catalog endpoint exists.
 */
@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss'
})
export class RolePermissionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly role = signal<RoleDto | null>(null);
  readonly catalog = signal<PermissionDto[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());

  readonly grouped = computed(() => {
    const map = new Map<number, PermissionDto[]>();
    for (const permission of this.catalog()) {
      const list = map.get(permission.moduleId) ?? [];
      list.push(permission);
      map.set(permission.moduleId, list);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([moduleId, permissions]) => ({
        moduleId,
        permissions: permissions.sort((a, b) => a.permissionCode.localeCompare(b.permissionCode))
      }));
  });

  ngOnInit(): void {
    const roleId = Number(this.route.snapshot.paramMap.get('roleId'));
    if (!Number.isFinite(roleId) || roleId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid role id.');
      this.loading.set(false);
      return;
    }
    this.load(roleId);
  }

  load(roleId: number): void {
    this.loading.set(true);
    this.roleService.getList().subscribe({
      next: (rolesResponse) => {
        const roles = rolesResponse.data ?? [];
        const byId = new Map<number, PermissionDto>();
        for (const item of roles) {
          for (const permission of item.permissions ?? []) {
            byId.set(permission.permissionId, permission);
          }
        }

        this.roleService.getById(roleId).subscribe({
          next: (roleResponse) => {
            const role = roleResponse.data;
            if (!role) {
              this.loadFailed.set(true);
              this.errorMessage.set('Role not found.');
              this.loading.set(false);
              return;
            }
            this.role.set(role);
            for (const permission of role.permissions ?? []) {
              byId.set(permission.permissionId, permission);
            }

            this.roleService.getPermissions(roleId).subscribe({
              next: (assignedResponse) => {
                const assigned = assignedResponse.data ?? [];
                for (const permission of assigned) {
                  byId.set(permission.permissionId, permission);
                }
                this.catalog.set([...byId.values()]);
                this.selectedIds.set(new Set(assigned.map((item) => item.permissionId)));
                this.loading.set(false);
              },
              error: (error: unknown) => {
                this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load role permissions.'));
                this.loading.set(false);
              }
            });
          },
          error: (error: unknown) => {
            this.loadFailed.set(true);
            this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load role.'));
            this.loading.set(false);
          }
        });
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load permission catalog.'));
        this.loading.set(false);
      }
    });
  }

  isSelected(permissionId: number): boolean {
    return this.selectedIds().has(permissionId);
  }

  toggle(permissionId: number, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) {
      next.add(permissionId);
    } else {
      next.delete(permissionId);
    }
    this.selectedIds.set(next);
  }

  save(): void {
    const role = this.role();
    if (!role) {
      return;
    }
    if (role.isSystemRole) {
      this.errorMessage.set('System roles are locked.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.roleService
      .assignPermissions(role.roleId, { permissionIds: [...this.selectedIds()] })
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message || 'Role permissions updated.');
          this.saving.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save permissions.'));
          this.saving.set(false);
        }
      });
  }
}
