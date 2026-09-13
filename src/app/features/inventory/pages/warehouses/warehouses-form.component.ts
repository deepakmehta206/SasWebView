import { Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { BranchContextService } from '../../../branch/services/branch-context.service';

import { InventoryApiService } from '../../services/inventory-api.service';

import { InventoryWarehouseTypes } from '../../models/inventory.models';



@Component({

  selector: 'app-warehouses-form',

  standalone: true,

  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],

  templateUrl: './warehouses-form.component.html',

  styleUrl: './warehouses-form.component.scss'

})

export class WarehouseFormComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly branchContext = inject(BranchContextService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly warehouseTypes = InventoryWarehouseTypes;

  readonly branches = this.branchContext.branches;

  readonly loading = signal(false);

  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly isEdit = signal(false);

  private id: number | null = null;



  readonly form = this.fb.nonNullable.group({

    branchId: [0, [Validators.required, Validators.min(1)]],

    warehouseCode: ['', Validators.required],

    warehouseName: ['', Validators.required],

    warehouseType: [InventoryWarehouseTypes.Main, Validators.required],

    address: [''],

    isActive: [true]

  });



  ngOnInit(): void {

    if (!this.branchContext.branches().length) {

      this.branchContext.loadBranches();

    }



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

    this.api.getWarehouse(this.id).subscribe({

      next: (row) => {

        this.form.patchValue({

          branchId: row.branchId,

          warehouseCode: row.warehouseCode,

          warehouseName: row.warehouseName,

          warehouseType: row.warehouseType as typeof InventoryWarehouseTypes.Main,

          address: row.address ?? '',

          isActive: row.isActive

        });

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load warehouse.'));

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

      branchId: Number(value.branchId),

      warehouseCode: value.warehouseCode.trim(),

      warehouseName: value.warehouseName.trim(),

      warehouseType: value.warehouseType,

      address: value.address.trim() || null

    };

    const updateBody = { ...createBody, isActive: value.isActive };

    const request$ = this.isEdit()

      ? this.api.updateWarehouse(this.id!, updateBody)

      : this.api.createWarehouse(createBody);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        void this.router.navigate(['/inventory/warehouses']);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save warehouse.'));

        this.saving.set(false);

      }

    });

  }

}

