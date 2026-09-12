import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import { EffectiveEntitlementsDto } from './entitlement.models';

/**
 * Loads and caches GET /me/entitlements (subscription-aware availability + limits).
 * FeatureAccessService maps modules/features into its existing enabled signal shape.
 */
@Injectable({ providedIn: 'root' })
export class EntitlementService {
  private readonly api = inject(ApiService);

  private readonly entitlementsSignal = signal<EffectiveEntitlementsDto | null>(null);
  private readonly loadedSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly entitlements = this.entitlementsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  load(): Observable<EffectiveEntitlementsDto> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.api.get<ApiResponse<EffectiveEntitlementsDto>>('/me/entitlements').pipe(
      map((response) => {
        const data = response.data;
        if (!data) {
          throw new Error('Empty entitlements payload.');
        }
        return data;
      }),
      tap((data) => {
        this.entitlementsSignal.set(data);
        this.loadedSignal.set(true);
        this.loadingSignal.set(false);
      }),
      catchError((error: unknown) => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Unable to load entitlements.');
        return throwError(() => error);
      })
    );
  }

  reload(): Observable<EffectiveEntitlementsDto> {
    return this.load();
  }

  clear(): void {
    this.entitlementsSignal.set(null);
    this.loadedSignal.set(false);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  /**
   * Soft clear used when falling back to /me/features so FeatureAccess still works.
   */
  clearAfterFallback(): void {
    this.entitlementsSignal.set(null);
    this.errorSignal.set('Entitlements unavailable; using feature flags fallback.');
  }
}
