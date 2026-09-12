import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { RoleDto } from '../../models/role.model';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly deletingId = signal<number | null>(null);
  readonly roles = signal<RoleDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: ''
  });

  readonly filteredRoles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.roles().filter((role) => {
      if (!term) return true;
      return [role.roleCode, role.roleName, role.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.roleService.getList().subscribe({
      next: (response) => {
        this.roles.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.roles.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load roles.'));
        this.loading.set(false);
      }
    });
  }

  deleteRole(role: RoleDto): void {
    if (role.isSystemRole) {
      this.errorMessage.set('System roles cannot be deleted.');
      return;
    }
    this.deletingId.set(role.roleId);
    this.roleService.delete(role.roleId).subscribe({
      next: (response) => {
        this.roles.set(this.roles().filter((item) => item.roleId !== role.roleId));
        this.successMessage.set(response.message || 'Role deleted.');
        this.deletingId.set(null);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to delete role.'));
        this.deletingId.set(null);
      }
    });
  }
}
