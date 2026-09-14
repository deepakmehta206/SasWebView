import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthStateService, AuthUser } from '../auth/auth-state.service';
import { platformAdminGuard } from './platform-admin.guard';

describe('platformAdminGuard', () => {
  let router: Router;

  function configure(user: AuthUser | null, authenticated: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: () => authenticated,
            currentUser: () => user
          }
        }
      ]
    });
    router = TestBed.inject(Router);
  }

  function run() {
    return TestBed.runInInjectionContext(() =>
      platformAdminGuard({} as never, { url: '/admin/tenants' } as never)
    );
  }

  function user(isPlatformAdmin: boolean): AuthUser {
    return {
      userId: 1,
      tenantId: 1001,
      username: isPlatformAdmin ? 'superadmin' : 'tenant.admin',
      firstName: 'Test',
      isPlatformAdmin,
      roles: isPlatformAdmin ? ['PLATFORM_ADMIN'] : ['TENANT_ADMIN'],
      permissions: isPlatformAdmin ? ['PLATFORM_ADMIN'] : ['TENANT_VIEW']
    };
  }

  it('allows an authenticated platform admin', () => {
    configure(user(true), true);
    expect(run()).toBeTrue();
  });

  it('denies an authenticated tenant admin', () => {
    configure(user(false), true);
    const result = run();
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/403');
  });

  it('denies an unauthenticated user', () => {
    configure(null, false);
    const result = run();
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
  });
});
