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
import { UserDto } from '../../../users/models/user.model';
import { PlatformTenantDetail } from '../../models/admin.models';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { isLastActiveTenantAdmin, parsePositiveId } from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-users-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-users-list.component.html',
  styleUrl: './admin-tenant-users-list.component.scss'
})
export class AdminTenantUsersListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(AdminTenantUsersApiService);
  private readonly tenantsApi = inject(AdminTenantsApiService);

  readonly tenantId = signal<number | null>(null);
  readonly tenant = signal<PlatformTenantDetail | null>(null);
  readonly loading = signal(true);
  readonly statusBusyId = signal<number | null>(null);
  readonly users = signal<UserDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: ''
  });

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.users().filter((user) => {
      if (!term) {
        return true;
      }
      return [user.username, user.email, user.firstName, user.lastName, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

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
    this.usersApi.getUsers(tenantId).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.users.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load users.'));
        this.loading.set(false);
      }
    });
  }

  roleSummary(user: UserDto): string {
    return user.roles.map((role) => role.roleCode).join(', ') || '—';
  }

  toggleStatus(user: UserDto): void {
    const tenantId = this.tenantId();
    if (!tenantId || this.statusBusyId()) {
      return;
    }

    if (user.isActive && isLastActiveTenantAdmin(this.users(), user.userId)) {
      if (
        !confirm(
          `Deactivate "${user.username}"? This appears to be the last active TENANT_ADMIN for the tenant.`
        )
      ) {
        return;
      }
    } else if (!confirm(`${user.isActive ? 'Deactivate' : 'Activate'} user "${user.username}"?`)) {
      return;
    }

    this.statusBusyId.set(user.userId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const request$ = user.isActive
      ? this.usersApi.deactivateUser(tenantId, user.userId)
      : this.usersApi.activateUser(tenantId, user.userId);

    request$.subscribe({
      next: () => {
        this.statusBusyId.set(null);
        this.successMessage.set(user.isActive ? 'User deactivated.' : 'User activated.');
        this.load();
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update user status.'));
        this.statusBusyId.set(null);
      }
    });
  }
}
