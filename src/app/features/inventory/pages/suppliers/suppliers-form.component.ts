import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { InventoryApiService } from '../../services/inventory-api.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './suppliers-form.component.html',
  styleUrl: './suppliers-form.component.scss'
})
export class SupplierFormComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    supplierCode: ['', Validators.required],
    supplierName: ['', Validators.required],
    contactPerson: [''],
    email: [''],
    phone: [''],
    address: [''],
    taxNumber: [''],
    paymentTerms: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      return;
    }

    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getSupplier(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          supplierCode: row.supplierCode,
          supplierName: row.supplierName,
          contactPerson: row.contactPerson ?? '',
          email: row.email ?? '',
          phone: row.phone ?? '',
          address: row.address ?? '',
          taxNumber: row.taxNumber ?? '',
          paymentTerms: row.paymentTerms ?? '',
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load supplier.'));
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
      supplierCode: value.supplierCode.trim(),
      supplierName: value.supplierName.trim(),
      contactPerson: value.contactPerson.trim() || null,
      email: value.email.trim() || null,
      phone: value.phone.trim() || null,
      address: value.address.trim() || null,
      taxNumber: value.taxNumber.trim() || null,
      paymentTerms: value.paymentTerms.trim() || null
    };
    const updateBody = { ...createBody, isActive: value.isActive };
    const request$ = this.isEdit()
      ? this.api.updateSupplier(this.id!, updateBody)
      : this.api.createSupplier(createBody);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/inventory/suppliers']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save supplier.'));
        this.saving.set(false);
      }
    });
  }
}
