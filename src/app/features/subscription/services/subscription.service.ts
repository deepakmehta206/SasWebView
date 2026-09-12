import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { FeatureAccessService } from '../../../core/entitlements/feature-access.service';
import { extractApiErrors } from '../../../core/utils/api-error.util';
import {
  CancelSubscriptionRequest,
  ChangePlanRequest,
  RenewSubscriptionRequest,
  SubscriptionChangeResult,
  SubscriptionInvoiceDto,
  SubscriptionLimitsDto,
  TenantSubscriptionDto,
  TenantUsageDto
} from '../models/subscription.models';

const DOWNGRADE_SCHEDULED = 'DOWNGRADE_SCHEDULED';

/**
 * Tenant subscription lifecycle + usage/invoices.
 * Does not call /api/v1/admin/... endpoints.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);
  private readonly featureAccess = inject(FeatureAccessService);

  private readonly currentSignal = signal<TenantSubscriptionDto | null>(null);
  private readonly limitsSignal = signal<SubscriptionLimitsDto | null>(null);
  private readonly usageSignal = signal<TenantUsageDto | null>(null);
  private readonly loadedSignal = signal(false);

  readonly current = this.currentSignal.asReadonly();
  readonly limits = this.limitsSignal.asReadonly();
  readonly usage = this.usageSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  getCurrent(): Observable<TenantSubscriptionDto> {
    return this.api.get<ApiResponse<TenantSubscriptionDto>>('/subscription').pipe(
      map((response) => response.data as TenantSubscriptionDto),
      tap((data) => {
        this.currentSignal.set(data);
        this.loadedSignal.set(true);
      })
    );
  }

  getUsage(): Observable<TenantUsageDto> {
    return this.api.get<ApiResponse<TenantUsageDto>>('/subscription/usage').pipe(
      map((response) => response.data as TenantUsageDto),
      tap((data) => this.usageSignal.set(data))
    );
  }

  getLimits(): Observable<SubscriptionLimitsDto> {
    return this.api.get<ApiResponse<SubscriptionLimitsDto>>('/subscription/limits').pipe(
      map((response) => response.data as SubscriptionLimitsDto),
      tap((data) => this.limitsSignal.set(data))
    );
  }

  getInvoices(): Observable<SubscriptionInvoiceDto[]> {
    return this.api
      .get<ApiResponse<SubscriptionInvoiceDto[]>>('/subscription/invoices')
      .pipe(map((response) => response.data ?? []));
  }

  getInvoiceById(invoiceId: number): Observable<SubscriptionInvoiceDto> {
    return this.api
      .get<ApiResponse<SubscriptionInvoiceDto>>(`/subscription/invoices/${invoiceId}`)
      .pipe(map((response) => response.data as SubscriptionInvoiceDto));
  }

  upgrade(request: ChangePlanRequest): Observable<SubscriptionChangeResult> {
    return this.api
      .post<ApiResponse<TenantSubscriptionDto>>('/subscription/upgrade', request)
      .pipe(
        map((response) => ({
          subscription: response.data ?? null,
          scheduledDowngrade: false,
          message: response.message ?? 'Subscription upgraded.'
        })),
        switchMap((result) => this.afterChange(result))
      );
  }

  downgrade(request: ChangePlanRequest): Observable<SubscriptionChangeResult> {
    return this.api
      .post<ApiResponse<TenantSubscriptionDto>>('/subscription/downgrade', request)
      .pipe(
        map((response) => ({
          subscription: response.data ?? null,
          scheduledDowngrade: false,
          message: response.message ?? 'Subscription downgraded.'
        })),
        catchError((error: unknown) => {
          if (isDowngradeScheduled(error)) {
            const message =
              extractApiErrors(error)[0]?.message ??
              'Downgrade scheduled for the next billing period.';
            return of({
              subscription: null,
              scheduledDowngrade: true,
              message
            } satisfies SubscriptionChangeResult);
          }
          return throwError(() => error);
        }),
        switchMap((result) => this.afterChange(result))
      );
  }

  cancel(request: CancelSubscriptionRequest = {}): Observable<SubscriptionChangeResult> {
    const body: CancelSubscriptionRequest = {
      reason: request.reason ?? null,
      preserveAccessUntilPeriodEnd: request.preserveAccessUntilPeriodEnd ?? true
    };

    return this.api
      .post<ApiResponse<TenantSubscriptionDto>>('/subscription/cancel', body)
      .pipe(
        map((response) => ({
          subscription: response.data ?? null,
          scheduledDowngrade: false,
          message: response.message ?? 'Subscription cancelled.'
        })),
        switchMap((result) => this.afterChange(result))
      );
  }

  renew(request: RenewSubscriptionRequest = {}): Observable<SubscriptionChangeResult> {
    return this.api
      .post<ApiResponse<TenantSubscriptionDto>>('/subscription/renew', request)
      .pipe(
        map((response) => ({
          subscription: response.data ?? null,
          scheduledDowngrade: false,
          message: response.message ?? 'Subscription renewed.'
        })),
        switchMap((result) => this.afterChange(result))
      );
  }

  /**
   * Reloads subscription + feature/entitlement access after lifecycle changes.
   */
  refreshState(): Observable<void> {
    return forkJoin({
      subscription: this.getCurrent().pipe(catchError(() => of(null))),
      limits: this.getLimits().pipe(catchError(() => of(null))),
      usage: this.getUsage().pipe(catchError(() => of(null))),
      features: this.featureAccess.reload().pipe(catchError(() => of({ modules: [] })))
    }).pipe(map(() => undefined));
  }

  clear(): void {
    this.currentSignal.set(null);
    this.limitsSignal.set(null);
    this.usageSignal.set(null);
    this.loadedSignal.set(false);
  }

  private afterChange(result: SubscriptionChangeResult): Observable<SubscriptionChangeResult> {
    if (result.subscription) {
      this.currentSignal.set(result.subscription);
    }

    return this.refreshState().pipe(
      map(() => ({
        ...result,
        subscription: this.currentSignal() ?? result.subscription
      }))
    );
  }
}

function isDowngradeScheduled(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 409) {
    return false;
  }

  return extractApiErrors(error).some((item) => item.code === DOWNGRADE_SCHEDULED);
}
