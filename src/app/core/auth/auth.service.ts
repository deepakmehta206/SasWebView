import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from '../services/api.service';
import { PermissionService } from '../permissions/permission.service';
import { BranchContextService } from '../../features/branch/services/branch-context.service';
import { TenantContextService } from '../../features/tenant/services/tenant-context.service';
import { FeatureAccessService } from '../entitlements/feature-access.service';
import { AuthStateService, AuthUser } from './auth-state.service';
import {
  ChangePasswordRequest,
  CurrentUserDto,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  ResetPasswordRequest,
  StoredTokenState
} from './auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly authState = inject(AuthStateService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly permissions = inject(PermissionService);
  private readonly featureAccess = inject(FeatureAccessService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly branchContext = inject(BranchContextService);
  private readonly router = inject(Router);

  /** Bypasses interceptors to avoid recursive refresh loops. */
  private readonly rawHttp = new HttpClient(inject(HttpBackend));
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  private refreshInFlight$: Observable<LoginResponse> | null = null;

  initializeSession(): Observable<boolean> {
    this.authState.restoreTokensFromStorage();
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      this.authState.markInitialized();
      return of(false);
    }

    return this.me().pipe(
      map(() => true),
      catchError(() => {
        const refreshToken = this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          this.clearLocalSession();
          this.authState.markInitialized();
          return of(false);
        }

        return this.refreshSession().pipe(
          map(() => true),
          catchError(() => {
            this.clearLocalSession();
            this.authState.markInitialized();
            return of(false);
          })
        );
      }),
      tap(() => this.authState.markInitialized())
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<ApiResponse<LoginResponse>>('/auth/login', request).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error(response.message || 'Login failed.');
        }
        return response.data;
      }),
      tap((data) => this.applyAuthenticatedSession(data))
    );
  }

  me(): Observable<CurrentUserDto> {
    return this.api.get<ApiResponse<CurrentUserDto>>('/auth/me').pipe(
      map((response) => {
        if (!response.data) {
          throw new Error(response.message || 'Unable to load current user.');
        }
        return response.data;
      }),
      tap((user) => this.applyCurrentUser(user))
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api
      .post<ApiResponse<null>>('/auth/change-password', request)
      .pipe(map(() => undefined));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.api
      .post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', request)
      .pipe(map((response) => response.data ?? { developmentResetToken: null }));
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.api
      .post<ApiResponse<null>>('/auth/reset-password', request)
      .pipe(map(() => undefined));
  }

  /**
   * Single-flight refresh used by the auth interceptor.
   * Uses HttpBackend so the refresh call is not intercepted recursively.
   */
  refreshSession(): Observable<LoginResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    const body: RefreshRequest = { refreshToken };

    this.refreshInFlight$ = this.rawHttp
      .post<ApiResponse<LoginResponse>>(`${this.apiBaseUrl}/auth/refresh`, body)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Token refresh failed.');
          }
          return response.data;
        }),
        tap((data) => this.applyAuthenticatedSession(data)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight$;
  }

  logout(redirectToLogin = true): Observable<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const accessToken = this.tokenStorage.getAccessToken();

    const clearAndRedirect = (): void => {
      this.clearLocalSession();
      if (redirectToLogin) {
        void this.router.navigate(['/login']);
      }
    };

    if (!refreshToken) {
      clearAndRedirect();
      return of(undefined);
    }

    const request: LogoutRequest = { refreshToken };
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;

    return this.rawHttp
      .post<ApiResponse<null>>(`${this.apiBaseUrl}/auth/logout`, request, { headers })
      .pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
        tap(() => clearAndRedirect())
      );
  }

  /**
   * Called when a protected API returns 401. Refreshes once, then retries.
   */
  handleUnauthorizedRetry<T>(
    retry: (accessToken: string) => Observable<T>
  ): Observable<T> {
    return this.refreshSession().pipe(
      switchMap((data) => retry(data.accessToken)),
      catchError((error: unknown) => {
        this.clearLocalSession();
        void this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url }
        });
        return throwError(() => error);
      })
    );
  }

  clearLocalSession(): void {
    this.authState.clearSession();
    this.permissions.clear();
    this.featureAccess.clear();
    this.tenantContext.clearAuthenticatedTenant();
    this.branchContext.clearSession();
  }

  private applyAuthenticatedSession(data: LoginResponse): void {
    const tokens: StoredTokenState = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt
    };

    this.authState.setSession(tokens, data.user);
    this.permissions.setPermissions(data.user.permissions);
    this.hydrateTenantAndBranch(data.user);
    this.featureAccess.load().subscribe();
  }

  private applyCurrentUser(user: CurrentUserDto): void {
    this.authState.setCurrentUser(user);
    this.permissions.setPermissions(user.permissions);
    this.hydrateTenantAndBranch(user);
    this.featureAccess.load().subscribe();
  }

  private hydrateTenantAndBranch(user: AuthUser): void {
    // Authenticated TenantId must come from auth context â€” never fall back to 1001.
    this.tenantContext.setAuthenticatedTenantId(user.tenantId);

    const preferredBranchId =
      'branchId' in user && user.branchId != null
        ? user.branchId
        : 'defaultBranchId' in user
          ? user.defaultBranchId ?? null
          : null;

    if (preferredBranchId != null) {
      this.branchContext.selectBranch(preferredBranchId);
    }

    this.branchContext.loadBranches();
  }

  isAuthApiUrl(url: string): boolean {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')
    );
  }

  isRefreshUrl(url: string): boolean {
    return url.includes('/auth/refresh');
  }

  mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiResponse<unknown> | null;
      const code = body?.errors?.[0]?.code;
      if (code === 'USER_INACTIVE') {
        return 'This user account is inactive.';
      }
      if (code === 'TENANT_INACTIVE') {
        return 'This tenant is inactive.';
      }
      if (code === 'INVALID_CREDENTIALS') {
        return 'Invalid tenant code, username, or password.';
      }
      if (body?.message) {
        return body.message;
      }
    }

    return 'Unable to sign in. Please try again.';
  }
}
