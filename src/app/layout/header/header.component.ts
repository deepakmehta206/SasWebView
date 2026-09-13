import { Component, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME } from '../../core/constants/app.constants';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { BranchSelectorComponent } from '../../features/branch/components/branch-selector/branch-selector.component';
import { NotificationBellComponent } from '../../features/notifications/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BranchSelectorComponent, NotificationBellComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  readonly authState = inject(AuthStateService);

  readonly appName = APP_NAME;
  readonly menuOpen = signal(false);

  @Input() pageTitle = 'Dashboard';
  @Input() sidebarOpen = false;
  @Output() readonly menuToggle = new EventEmitter<void>();

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  toggleUserMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout(true).subscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.header__user')) {
      this.menuOpen.set(false);
    }
  }
}
