import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { UserDto } from '../../../users/models/user.model';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { parsePositiveId } from '../../utils/admin-iam.util';

@Component({
  selector: 'app-admin-tenant-user-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-tenant-user-detail.component.html',
  styleUrl: './admin-tenant-user-detail.component.scss'
})
export class AdminTenantUserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(AdminTenantUsersApiService);

  readonly tenantId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly user = signal<UserDto | null>(null);

  ngOnInit(): void {
    const tenantId = parsePositiveId(this.route.snapshot.paramMap.get('id'));
    const userId = parsePositiveId(this.route.snapshot.paramMap.get('userId'));
    this.tenantId.set(tenantId);
    if (!tenantId || !userId) {
      this.errorMessage.set('User was not found.');
      this.loading.set(false);
      return;
    }
    this.load(tenantId, userId);
  }

  load(tenantId: number, userId: number): void {
    this.loading.set(true);
    this.usersApi.getUser(tenantId, userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load user.'));
        this.loading.set(false);
      }
    });
  }
}
