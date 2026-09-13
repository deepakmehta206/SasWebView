import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { BillingApiService } from '../../services/billing-api.service';
import { BillingCustomerTypes } from '../../models/billing.models';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './customers-form.component.html',
  styleUrl: './customers-form.component.scss'
})
export class CustomersFormComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly masterApi = inject(MasterApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly customerTypes = BillingCustomerTypes;
  readonly branches = this.branchContext.branches;
  readonly currencies = signal<Array<{ currencyCode: string; currencyName: string }>>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    branchId: [null as number | null],
    customerCode: ['', Validators.required],
    customerName: ['', Validators.required],
    customerType: [BillingCustomerTypes.Individual, Validators.required],
    email: [''],
    phone: [''],
    taxNumber: [''],
    billingAddress: [''],
    paymentTerms: [''],
    creditLimit: [0, [Validators.required, Validators.min(0)]],
    currencyCode: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }

    this.masterApi.getList<{ currencyCode: string; currencyName: string }>('/currencies', { isActive: true }).subscribe({
      next: (data) => this.currencies.set(data),
      error: () => this.currencies.set([])
    });

    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      const selected = this.branchContext.selectedBranchId();
      if (selected) {
        this.form.patchValue({ branchId: selected });
      }
      return;
    }

    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getCustomer(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          branchId: row.branchId,
          customerCode: row.customerCode,
          customerName: row.customerName,
          customerType: row.customerType as typeof BillingCustomerTypes.Individual,
          email: row.email ?? '',
          phone: row.phone ?? '',
          taxNumber: row.taxNumber ?? '',
          billingAddress: row.billingAddress ?? '',
          paymentTerms: row.paymentTerms ?? '',
          creditLimit: row.creditLimit,
          currencyCode: row.currencyCode ?? '',
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load customer.'));
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const createBody = {
      branchId: value.branchId ? Number(value.branchId) : null,
      customerCode: value.customerCode.trim(),
      customerName: value.customerName.trim(),
      customerType: value.customerType,
      email: value.email.trim() || null,
      phone: value.phone.trim() || null,
      taxNumber: value.taxNumber.trim() || null,
      billingAddress: value.billingAddress.trim() || null,
      paymentTerms: value.paymentTerms.trim() || null,
      creditLimit: Number(value.creditLimit),
      currencyCode: value.currencyCode.trim() || null
    };
    const updateBody = { ...createBody, isActive: value.isActive };
    const request$ = this.isEdit()
      ? this.api.updateCustomer(this.id!, updateBody)
      : this.api.createCustomer(createBody);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/billing/customers']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save customer.'));
        this.saving.set(false);
      }
    });
  }
}
