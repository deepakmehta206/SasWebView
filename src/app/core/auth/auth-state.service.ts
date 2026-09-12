import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthUserDto, CurrentUserDto, StoredTokenState } from './auth.models';
import { TokenStorageService } from './token-storage.service';

export type AuthUser = AuthUserDto | CurrentUserDto;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly initializedSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => !!this.accessTokenSignal() && !!this.currentUserSignal()
  );

  readonly userId = computed(() => this.currentUserSignal()?.userId ?? null);
  readonly tenantId = computed(() => this.currentUserSignal()?.tenantId ?? null);
  readonly username = computed(() => this.currentUserSignal()?.username ?? null);

  readonly branchId = computed(() => {
    const user = this.currentUserSignal();
    if (!user) {
      return null;
    }

    if ('branchId' in user && user.branchId != null) {
      return user.branchId;
    }

    if ('defaultBranchId' in user) {
      return user.defaultBranchId ?? null;
    }

    return null;
  });

  readonly displayName = computed(() => {
    const user = this.currentUserSignal();
    if (!user) {
      return null;
    }

    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return full || user.username;
  });

  /**
   * Hydrate in-memory token from TokenStorageService (no user yet).
   */
  restoreTokensFromStorage(): void {
    const state = this.tokenStorage.getTokenState();
    this.accessTokenSignal.set(state?.accessToken ?? null);
  }

  setSession(tokens: StoredTokenState, user: AuthUser): void {
    this.tokenStorage.saveTokenState(tokens);
    this.accessTokenSignal.set(tokens.accessToken);
    this.currentUserSignal.set(user);
  }

  setCurrentUser(user: AuthUser): void {
    this.currentUserSignal.set(user);
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  markInitialized(): void {
    this.initializedSignal.set(true);
  }
}
