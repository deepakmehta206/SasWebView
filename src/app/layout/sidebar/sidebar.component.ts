import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationService, NavItem } from '../../core/constants/nav.config';
import { PermissionService } from '../../core/permissions/permission.service';
import { FeatureAccessService } from '../../core/entitlements/feature-access.service';
import { APP_NAME } from '../../core/constants/app.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly navigation = inject(NavigationService);
  private readonly permissions = inject(PermissionService);
  private readonly featureAccess = inject(FeatureAccessService);

  readonly appName = APP_NAME;

  /**
   * Permission + feature-aware nav.
   * Filtering lives in NavigationService — not inline checks here.
   */
  readonly navItems = computed(() => {
    this.permissions.permissions();
    this.featureAccess.modules();
    return this.navigation.getVisibleNavItems();
  });

  @Input() open = false;
  @Output() readonly navigate = new EventEmitter<void>();
  @Output() readonly closeRequest = new EventEmitter<void>();

  onEnabledNavigate(): void {
    this.navigate.emit();
  }

  onClose(): void {
    this.closeRequest.emit();
  }

  trackByLabel(_index: number, item: NavItem): string {
    return item.label;
  }
}
