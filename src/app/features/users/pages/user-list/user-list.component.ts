import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { UserDto } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly statusUpdatingId = signal<number | null>(null);
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
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.userService.getList().subscribe({
      next: (response) => {
        this.users.set(response.data ?? []);
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
    const nextActive = !user.isActive;
    const nextStatus = nextActive ? 'Active' : 'Inactive';
    this.statusUpdatingId.set(user.userId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.userService.setStatus(user.userId, { status: nextStatus, isActive: nextActive }).subscribe({
      next: (response) => {
        this.users.set(
          this.users().map((item) =>
            item.userId === user.userId ? { ...item, status: nextStatus, isActive: nextActive } : item
          )
        );
        this.successMessage.set(response.message || 'User status updated.');
        this.statusUpdatingId.set(null);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update user status.'));
        this.statusUpdatingId.set(null);
      }
    });
  }
}
