import { TestBed } from '@angular/core/testing';
import { AuthStateService } from '../auth/auth-state.service';
import { FeatureAccessService } from '../entitlements/feature-access.service';
import { PermissionService } from '../permissions/permission.service';
import { NavigationService, SIDEBAR_NAV_ITEMS } from './nav.config';

describe('NavigationService platform admin', () => {
  let navigation: NavigationService;
  let authState: { currentUser: () => { isPlatformAdmin: boolean } | null };

  beforeEach(() => {
    authState = { currentUser: () => null };
    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        PermissionService,
        {
          provide: FeatureAccessService,
          useValue: {
            modules: () => [],
            isModuleEnabled: () => true,
            isFeatureEnabled: () => true
          }
        },
        { provide: AuthStateService, useValue: authState }
      ]
    });
    navigation = TestBed.inject(NavigationService);
  });

  it('shows Admin for a platform admin', () => {
    authState.currentUser = () => ({ isPlatformAdmin: true });
    const labels = navigation.getVisibleNavItems(SIDEBAR_NAV_ITEMS).map((item) => item.label);
    expect(labels).toContain('Admin');
  });

  it('hides Admin for a tenant admin', () => {
    authState.currentUser = () => ({ isPlatformAdmin: false });
    const labels = navigation.getVisibleNavItems(SIDEBAR_NAV_ITEMS).map((item) => item.label);
    expect(labels).not.toContain('Admin');
  });
});
