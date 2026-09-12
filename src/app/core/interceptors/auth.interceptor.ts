import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Attaches Bearer access tokens and performs single-flight refresh on 401.
 * Extends the Phase 1 interceptor — do not register a second auth interceptor.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  const isAnonymousAuthEndpoint = authService.isAuthApiUrl(req.url);
  const isRefresh = authService.isRefreshUrl(req.url);

  const accessToken = tokenStorage.getAccessToken();
  const authReq =
    accessToken && !isAnonymousAuthEndpoint
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` }
        })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // Do not attempt refresh for anonymous auth endpoints or the refresh call itself.
      if (isAnonymousAuthEndpoint || isRefresh) {
        return throwError(() => error);
      }

      // Avoid infinite retry loops on already-retried requests.
      if (authReq.headers.has('X-Auth-Retry')) {
        return throwError(() => error);
      }

      return authService.handleUnauthorizedRetry((newAccessToken) =>
        next(
          authReq.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
              'X-Auth-Retry': '1'
            }
          })
        )
      );
    })
  );
};
