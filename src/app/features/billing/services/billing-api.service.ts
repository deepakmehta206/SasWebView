import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  BillingCustomer,
  BillingCustomerListQuery,
  BillingInvoice,
  BillingInvoiceListQuery,
  BillingPayment,
  BillingPaymentListQuery,
  CreateBillingCustomerRequest,
  CreateBillingInvoiceRequest,
  PostBillingPaymentRequest,
  SetBillingCustomerStatusRequest,
  UpdateBillingCustomerRequest,
  UpdateBillingInvoiceRequest
} from '../models/billing.models';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly api = inject(ApiService);

  getCustomers(query?: BillingCustomerListQuery): Observable<BillingCustomer[]> {
    return this.list('/billing/customers', this.buildCustomerParams(query));
  }

  getCustomer(id: number): Observable<BillingCustomer> {
    return this.one<BillingCustomer>(`/billing/customers/${id}`);
  }

  createCustomer(body: CreateBillingCustomerRequest): Observable<BillingCustomer> {
    return this.create('/billing/customers', body);
  }

  updateCustomer(id: number, body: UpdateBillingCustomerRequest): Observable<BillingCustomer> {
    return this.update(`/billing/customers/${id}`, body);
  }

  setCustomerStatus(id: number, body: SetBillingCustomerStatusRequest): Observable<unknown> {
    return this.api
      .patch<ApiResponse<unknown>>(`/billing/customers/${id}/status`, body)
      .pipe(map((response) => response.data));
  }

  getInvoices(query?: BillingInvoiceListQuery): Observable<BillingInvoice[]> {
    return this.list('/billing/invoices', this.buildInvoiceParams(query));
  }

  getInvoice(id: number): Observable<BillingInvoice> {
    return this.one<BillingInvoice>(`/billing/invoices/${id}`);
  }

  createInvoice(body: CreateBillingInvoiceRequest): Observable<BillingInvoice> {
    return this.create('/billing/invoices', body);
  }

  updateInvoice(id: number, body: UpdateBillingInvoiceRequest): Observable<BillingInvoice> {
    return this.update(`/billing/invoices/${id}`, body);
  }

  approveInvoice(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/billing/invoices/${id}/approve`, {})
      .pipe(map((response) => response.data));
  }

  cancelInvoice(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/billing/invoices/${id}/cancel`, {})
      .pipe(map((response) => response.data));
  }

  getPayments(query?: BillingPaymentListQuery): Observable<BillingPayment[]> {
    return this.list('/billing/payments', this.buildPaymentParams(query));
  }

  getPayment(id: number): Observable<BillingPayment> {
    return this.one<BillingPayment>(`/billing/payments/${id}`);
  }

  postPayment(body: PostBillingPaymentRequest): Observable<BillingPayment> {
    return this.create('/billing/payments', body);
  }

  cancelPayment(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/billing/payments/${id}/cancel`, {})
      .pipe(map((response) => response.data));
  }

  /** Never includes tenantId. Omits null/undefined/empty. */
  buildCustomerParams(query?: BillingCustomerListQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }
    this.setNumber(params, 'branchId', query.branchId);
    return params;
  }

  buildInvoiceParams(query?: BillingInvoiceListQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    this.setNumber(params, 'customerId', query.customerId);
    this.setString(params, 'status', query.status);
    this.setNumber(params, 'branchId', query.branchId);
    this.setString(params, 'fromDate', query.fromDate);
    this.setString(params, 'toDate', query.toDate);
    return params;
  }

  buildPaymentParams(query?: BillingPaymentListQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    this.setNumber(params, 'invoiceId', query.invoiceId);
    this.setString(params, 'fromDate', query.fromDate);
    this.setString(params, 'toDate', query.toDate);
    return params;
  }

  private list<T>(path: string, params: Record<string, string | number | boolean>): Observable<T[]> {
    return this.api
      .get<ApiResponse<T[]>>(path, { params })
      .pipe(map((response) => response.data ?? []));
  }

  private one<T>(path: string): Observable<T> {
    return this.api.get<ApiResponse<T>>(path).pipe(map((response) => response.data as T));
  }

  private create<T>(path: string, body: unknown): Observable<T> {
    return this.api.post<ApiResponse<T>>(path, body).pipe(map((response) => response.data as T));
  }

  private update<T>(path: string, body: unknown): Observable<T> {
    return this.api.put<ApiResponse<T>>(path, body).pipe(map((response) => response.data as T));
  }

  private setNumber(
    params: Record<string, string | number | boolean>,
    key: string,
    value: number | null | undefined
  ): void {
    if (value !== undefined && value !== null && !Number.isNaN(value)) {
      params[key] = value;
    }
  }

  private setString(
    params: Record<string, string | number | boolean>,
    key: string,
    value: string | null | undefined
  ): void {
    if (value?.trim()) {
      params[key] = value.trim();
    }
  }
}
