import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { RoleDto } from '../../../roles/models/role.model';
import { PlatformTenantDetail } from '../../models/admin.models';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { isLockedRole, parsePositiveId } from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-roles-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-roles-list.component.html',
  styleUrl: './admin-tenant-roles-list.component.scss'
})
export class AdminTenantRolesListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rolesApi = inject(AdminTenantRolesApiService);
  private readonly tenantsApi = inject(AdminTenantsApiService);

  readonly tenantId = signal<number | null>(null);
  readonly tenant = signal<PlatformTenantDetail | null>(null);
  readonly loading = signal(true);
  readonly roles = signal<RoleDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: ''
  });

  readonly filteredRoles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.roles().filter((role) => {
      if (!term) {
        return true;
      }
      return [role.roleCode, role.roleName, role.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

  readonly isLocked = isLockedRole;

  ngOnInit(): void {
    const id = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    this.tenantId.set(id);
    if (!id) {
      this.errorMessage.set('Tenant was not found.');
      this.loading.set(false);
      return;
    }
    this.tenantsApi.getTenant(id).subscribe({
      next: (tenant) => this.tenant.set(tenant),
      error: () => this.tenant.set(null)
    });
    this.load();
  }

  load(): void {
    const tenantId = this.tenantId();
    if (!tenantId) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.rolesApi.getRoles(tenantId).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.roles.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load roles.'));
        this.loading.set(false);
      }
    });
  }
}
