import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { CurrentUserDto } from '../../../../core/auth/auth.models';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly authState = inject(AuthStateService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profile = signal<CurrentUserDto | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.me().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load profile.'));
        this.loading.set(false);
      }
    });
  }
}
