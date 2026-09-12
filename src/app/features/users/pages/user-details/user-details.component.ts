import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  selector: 'app-user-details',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly user = signal<UserDto | null>(null);

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (!Number.isFinite(userId) || userId <= 0) {
      this.errorMessage.set('Invalid user id.');
      this.loading.set(false);
      return;
    }
    this.load(userId);
  }

  load(userId: number): void {
    this.loading.set(true);
    this.userService.getById(userId).subscribe({
      next: (response) => {
        this.user.set(response.data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load user.'));
        this.loading.set(false);
      }
    });
  }
}
