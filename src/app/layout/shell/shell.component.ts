import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  sidebarOpen = false;
  pageTitle = 'Dashboard';

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.pageTitle = this.resolveTitle(event.urlAfterRedirects);
        this.sidebarOpen = false;
      });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private resolveTitle(url: string): string {
    if (url.startsWith('/dashboard')) {
      return 'Dashboard';
    }

    if (url.startsWith('/users/new')) {
      return 'Add user';
    }

    if (url.includes('/users/') && url.endsWith('/edit')) {
      return 'Edit user';
    }

    if (url.startsWith('/users/')) {
      return 'User details';
    }

    if (url.startsWith('/users')) {
      return 'Users';
    }

    if (url.startsWith('/roles/new')) {
      return 'Add role';
    }

    if (url.includes('/roles/') && url.endsWith('/permissions')) {
      return 'Role permissions';
    }

    if (url.includes('/roles/') && url.endsWith('/edit')) {
      return 'Edit role';
    }

    if (url.startsWith('/roles')) {
      return 'Roles';
    }

    if (url.startsWith('/profile')) {
      return 'My profile';
    }

    if (url.startsWith('/change-password')) {
      return 'Change password';
    }

    if (url.startsWith('/403')) {
      return 'Unauthorized';
    }

    if (url.startsWith('/settings/tenant-settings')) {
      return 'Tenant settings';
    }

    if (url.startsWith('/settings/tenant')) {
      return 'Tenant profile';
    }

    if (url.startsWith('/settings/branches/new')) {
      return 'Add branch';
    }

    if (url.includes('/settings/branches/') && url.endsWith('/edit')) {
      return 'Edit branch';
    }

    if (url.startsWith('/settings/branches')) {
      return 'Branches';
    }

    if (url.startsWith('/settings')) {
      return 'Settings';
    }

    return 'SaaS Platform';
  }
}
