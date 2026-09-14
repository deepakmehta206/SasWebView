import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { ModuleDto } from '../../../modules/models/module.model';
import { ModuleService } from '../../../modules/services/module.service';
import { PermissionDto, RoleDto } from '../../../roles/models/role.model';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { catalogWithoutPlatformAdmin, isLockedRole, parsePositiveId } from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-role-permissions',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-role-permissions.component.html',
  styleUrl: './admin-tenant-role-permissions.component.scss'
})
export class AdminTenantRolePermissionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rolesApi = inject(AdminTenantRolesApiService);
  private readonly moduleService = inject(ModuleService);

  readonly tenantId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly locked = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly role = signal<RoleDto | null>(null);
  readonly catalog = signal<PermissionDto[]>([]);
  readonly modules = signal<ModuleDto[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());

  readonly grouped = computed(() => {
    const moduleNames = new Map(this.modules().map((module) => [module.moduleId, module.moduleName]));
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
        moduleName: moduleNames.get(moduleId) ?? `Module ${moduleId}`,
        permissions: permissions.sort((left, right) =>
          left.permissionCode.localeCompare(right.permissionCode)
        )
      }));
  });

  ngOnInit(): void {
    const tenantId = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    const roleId = parsePositiveId(this.route.snapshot.paramMap.get('roleId'));
    this.tenantId.set(tenantId);
    if (!tenantId || !roleId) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid role id.');
      this.loading.set(false);
      return;
    }
    this.load(tenantId, roleId);
  }

  isSelected(permissionId: number): boolean {
    return this.selectedIds().has(permissionId);
  }

  toggle(permissionId: number, checked: boolean): void {
    if (this.locked()) {
      return;
    }
    const next = new Set(this.selectedIds());
    if (checked) {
      next.add(permissionId);
    } else {
      next.delete(permissionId);
    }
    this.selectedIds.set(next);
  }

  save(): void {
    const tenantId = this.tenantId();
    const role = this.role();
    if (!tenantId || !role || this.saving()) {
      return;
    }
    if (this.locked()) {
      this.errorMessage.set('System roles are locked.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.rolesApi
      .assignRolePermissions(tenantId, role.roleId, { permissionIds: [...this.selectedIds()] })
      .subscribe({
        next: () => {
          this.successMessage.set('Role permissions updated.');
          this.saving.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save permissions.'));
          this.saving.set(false);
        }
      });
  }

  private load(tenantId: number, roleId: number): void {
    this.loading.set(true);
    forkJoin({
      role: this.rolesApi.getRole(tenantId, roleId),
      assigned: this.rolesApi.getRolePermissions(tenantId, roleId),
      catalog: this.rolesApi.getPermissionCatalog(),
      modules: this.moduleService.getList(true).pipe(
        catchError(() => of({ data: [] as ModuleDto[] }))
      )
    }).subscribe({
      next: ({ role, assigned, catalog, modules }) => {
        this.role.set(role);
        this.locked.set(isLockedRole(role));
        this.catalog.set(catalogWithoutPlatformAdmin(catalog));
        this.modules.set(modules.data ?? []);
        this.selectedIds.set(
          new Set(
            assigned
              .filter((permission) => permission.permissionCode.trim().toUpperCase() !== 'PLATFORM_ADMIN')
              .map((permission) => permission.permissionId)
          )
        );
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load role permissions.'));
        this.loading.set(false);
      }
    });
  }
}
