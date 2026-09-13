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

    if (url.startsWith('/modules/new')) {
      return 'Add module';
    }

    if (url.includes('/modules/') && url.endsWith('/edit')) {
      return 'Edit module';
    }

    if (url.startsWith('/modules/')) {
      return 'Module details';
    }

    if (url.startsWith('/modules')) {
      return 'Modules';
    }

    if (url.startsWith('/features/new')) {
      return 'Add feature';
    }

    if (url.includes('/features/') && url.endsWith('/edit')) {
      return 'Edit feature';
    }

    if (url.startsWith('/features')) {
      return 'Features';
    }

    if (url.startsWith('/subscription/plans')) {
      return 'Plans';
    }

    if (url.startsWith('/subscription/usage')) {
      return 'Usage & limits';
    }

    if (url.includes('/subscription/invoices/') && !url.endsWith('/invoices')) {
      return 'Invoice detail';
    }

    if (url.startsWith('/subscription/invoices')) {
      return 'Invoices';
    }

    if (url.startsWith('/subscription')) {
      return 'Subscription';
    }

    if (url.includes('/masters/') && url.endsWith('/edit')) {
      return 'Edit master';
    }

    if (url.includes('/masters/') && url.endsWith('/new')) {
      return 'Add master';
    }

    if (url.startsWith('/masters/')) {
      return 'Masters';
    }

    if (url.startsWith('/masters')) {
      return 'Masters';
    }

    if (url.startsWith('/hrms/employees')) {
      return 'Employees';
    }

    if (url.startsWith('/hrms/departments')) {
      return 'Departments';
    }

    if (url.startsWith('/hrms/designations')) {
      return 'Designations';
    }

    if (url.startsWith('/hrms/employee-types')) {
      return 'Employee types';
    }

    if (url.startsWith('/hrms/shifts')) {
      return 'Shifts';
    }

    if (url.startsWith('/hrms/holidays')) {
      return 'Holidays';
    }

    if (url.startsWith('/hrms/attendance')) {
      return 'Attendance';
    }

    if (url.startsWith('/hrms/overtime')) {
      return 'Overtime';
    }

    if (url.startsWith('/hrms/leave')) {
      return 'Leave';
    }

    if (url.startsWith('/hrms/salary')) {
      return 'Salary';
    }

    if (url.startsWith('/hrms/payroll')) {
      return 'Payroll';
    }

    if (url.startsWith('/hrms')) {
      return 'HRMS';
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

    if (url.startsWith('/settings/modules')) {
      return 'Tenant modules';
    }

    if (url.startsWith('/settings/features')) {
      return 'Tenant features';
    }

    if (url.startsWith('/settings')) {
      return 'Settings';
    }

    return 'SaaS Platform';
  }
}
