import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PermissionService } from './permission.service';

/**
 * Structural directive for UX-only permission checks.
 *
 * @example
 * <button *appHasPermission="'USER_ADD'">Add User</button>
 * <button *appHasPermission="['USER_EDIT','USER_DELETE']; mode: 'any'">…</button>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  private codes: string[] = [];
  private mode: 'all' | 'any' = 'all';
  private hasView = false;

  constructor() {
    effect(() => {
      // Track permission signal changes.
      this.permissionService.permissions();
      this.updateView();
    });
  }

  @Input()
  set appHasPermission(value: string | readonly string[] | null | undefined) {
    if (typeof value === 'string') {
      this.codes = [value];
    } else if (Array.isArray(value)) {
      this.codes = [...value];
    } else {
      this.codes = [];
    }
    this.updateView();
  }

  @Input()
  set appHasPermissionMode(value: 'all' | 'any' | null | undefined) {
    this.mode = value === 'any' ? 'any' : 'all';
    this.updateView();
  }

  private updateView(): void {
    const allowed =
      this.codes.length === 0
        ? true
        : this.mode === 'any'
          ? this.permissionService.hasAnyPermission(this.codes)
          : this.permissionService.hasAllPermissions(this.codes);

    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
