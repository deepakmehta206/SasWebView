import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
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
  private readonly router = inject(Router);

  readonly appName = APP_NAME;

  /** Groups the user explicitly expanded (when not route-active). */
  private readonly userExpanded = signal<ReadonlySet<string>>(new Set());
  /** Groups the user explicitly collapsed (overrides route-active until expanded again). */
  private readonly userCollapsed = signal<ReadonlySet<string>>(new Set());

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

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

  isExpanded(item: NavItem): boolean {
    if (!item.children?.length) {
      return false;
    }

    if (this.userCollapsed().has(item.label)) {
      return false;
    }

    if (this.isGroupActive(item) || this.userExpanded().has(item.label)) {
      return true;
    }

    return false;
  }

  toggleExpand(item: NavItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!item.children?.length) {
      return;
    }

    if (this.isExpanded(item)) {
      const collapsed = new Set(this.userCollapsed());
      collapsed.add(item.label);
      this.userCollapsed.set(collapsed);

      const expanded = new Set(this.userExpanded());
      expanded.delete(item.label);
      this.userExpanded.set(expanded);
      return;
    }

    const collapsed = new Set(this.userCollapsed());
    collapsed.delete(item.label);
    this.userCollapsed.set(collapsed);

    const expanded = new Set(this.userExpanded());
    expanded.add(item.label);
    this.userExpanded.set(expanded);
  }

  onParentNavigate(item: NavItem): void {
    if (item.children?.length) {
      this.openGroup(item.label);
    }
    this.onEnabledNavigate();
  }

  onChildNavigate(item: NavItem): void {
    if (item.label) {
      this.openGroup(item.label);
    }
    this.onEnabledNavigate();
  }

  onEnabledNavigate(): void {
    this.navigate.emit();
  }

  onClose(): void {
    this.closeRequest.emit();
  }

  trackByLabel(_index: number, item: NavItem): string {
    return item.label;
  }

  private openGroup(label: string): void {
    const collapsed = new Set(this.userCollapsed());
    collapsed.delete(label);
    this.userCollapsed.set(collapsed);

    const expanded = new Set(this.userExpanded());
    expanded.add(label);
    this.userExpanded.set(expanded);
  }

  private isGroupActive(item: NavItem): boolean {
    const url = this.currentUrl().split('?')[0];
    if (item.route && (url === item.route || url.startsWith(item.route + '/'))) {
      return true;
    }

    return (item.children ?? []).some(
      (child) =>
        !!child.route && (url === child.route || url.startsWith(child.route + '/'))
    );
  }
}
