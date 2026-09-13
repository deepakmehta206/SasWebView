import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { InventoryApiService } from '../../../inventory/services/inventory-api.service';
import { InventoryItem } from '../../../inventory/models/inventory.models';
import { BillingApiService } from '../../services/billing-api.service';
import { BillingCustomer, BillingInvoiceStatuses } from '../../models/billing.models';
import { formatMoney, previewLineTotals, roundMoney } from '../../utils/billing-display.util';

@Component({
  selector: 'app-invoices-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './invoices-form.component.html',
  styleUrl: './invoices-form.component.scss'
})
export class InvoicesFormComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly masterApi = inject(MasterApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly formatMoney = formatMoney;
  readonly previewLineTotals = previewLineTotals;
  readonly branches = this.branchContext.branches;
  readonly customers = signal<BillingCustomer[]>([]);
  readonly items = signal<InventoryItem[]>([]);
  readonly currencies = signal<Array<{ currencyCode: string; currencyName: string }>>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    branchId: [0, [Validators.required, Validators.min(1)]],
    customerId: [0, [Validators.required, Validators.min(1)]],
    invoiceDate: [new Date().toISOString().slice(0, 10), Validators.required],
    dueDate: [''],
    currencyCode: ['', Validators.required],
    notes: [''],
    lines: this.fb.array([this.createLineGroup()])
  });

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }

    this.api.getCustomers({ isActive: true }).subscribe({
      next: (data) => this.customers.set(data),
      error: () => this.customers.set([])
    });

    this.inventoryApi.getItems({ isActive: true }).subscribe({
      next: (data) => this.items.set(data),
      error: () => this.items.set([])
    });

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
    this.api.getInvoice(this.id).subscribe({
      next: (row) => {
        if (row.status !== BillingInvoiceStatuses.Draft) {
          void this.router.navigate(['/billing/invoices', this.id]);
          return;
        }
        this.form.patchValue({
          branchId: row.branchId,
          customerId: row.customerId,
          invoiceDate: row.invoiceDate.slice(0, 10),
          dueDate: row.dueDate ? row.dueDate.slice(0, 10) : '',
          currencyCode: row.currencyCode,
          notes: row.notes ?? ''
        });
        this.lines.clear();
        for (const line of row.lines ?? []) {
          this.lines.push(
            this.createLineGroup({
              itemId: line.itemId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discountPercent: line.discountPercent,
              taxPercent: line.taxPercent
            })
          );
        }
        if (!this.lines.length) {
          this.lines.push(this.createLineGroup());
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load invoice.'));
        this.loading.set(false);
      }
    });
  }

  createLineGroup(seed?: {
    itemId?: number | null;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    discountPercent?: number;
    taxPercent?: number;
  }) {
    return this.fb.nonNullable.group({
      itemId: [seed?.itemId ?? null as number | null],
      description: [seed?.description ?? ''],
      quantity: [seed?.quantity ?? 1, [Validators.required, Validators.min(0.0001)]],
      unitPrice: [seed?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      discountPercent: [seed?.discountPercent ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxPercent: [seed?.taxPercent ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  addLine(): void {
    this.lines.push(this.createLineGroup());
  }

  removeLine(index: number): void {
    if (this.lines.length <= 1) {
      return;
    }
    this.lines.removeAt(index);
  }

  onItemSelected(index: number): void {
    const lineGroup = this.lines.at(index);
    const itemId = lineGroup.get('itemId')?.value;
    if (!itemId) {
      return;
    }
    const item = this.items().find((row) => row.itemId === Number(itemId));
    if (!item) {
      return;
    }
    lineGroup.patchValue({
      description: item.itemName,
      unitPrice: item.sellingPrice
    });
  }

  linePreview(index: number) {
    const line = this.lines.at(index).getRawValue();
    return previewLineTotals(
      Number(line.quantity),
      Number(line.unitPrice),
      Number(line.discountPercent),
      Number(line.taxPercent)
    );
  }

  invoicePreview() {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    let totalAmount = 0;
    for (let i = 0; i < this.lines.length; i++) {
      const preview = this.linePreview(i);
      subtotal = roundMoney(subtotal + preview.gross);
      discountAmount = roundMoney(discountAmount + preview.discount);
      taxAmount = roundMoney(taxAmount + preview.tax);
      totalAmount = roundMoney(totalAmount + preview.lineTotal);
    }
    return { subtotal, discountAmount, taxAmount, totalAmount };
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const lines = value.lines.map((line) => ({
      itemId: line.itemId ? Number(line.itemId) : null,
      description: line.description.trim() || null,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      discountPercent: Number(line.discountPercent),
      taxPercent: Number(line.taxPercent)
    }));
    const body = {
      branchId: Number(value.branchId),
      customerId: Number(value.customerId),
      invoiceDate: value.invoiceDate,
      dueDate: value.dueDate.trim() || null,
      currencyCode: value.currencyCode.trim(),
      notes: value.notes.trim() || null,
      lines
    };
    const request$ = this.isEdit()
      ? this.api.updateInvoice(this.id!, body)
      : this.api.createInvoice(body);
    request$.subscribe({
      next: (saved) => {
        this.saving.set(false);
        void this.router.navigate(['/billing/invoices', this.isEdit() ? this.id : saved.invoiceId]);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save invoice.'));
        this.saving.set(false);
      }
    });
  }
}
