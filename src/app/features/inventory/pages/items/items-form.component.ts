import { Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { MasterApiService } from '../../../masters/services/master-api.service';

import { MasterSelectOption } from '../../../masters/models/master.definitions';

import { InventoryApiService } from '../../services/inventory-api.service';

import { InventoryItemTypes, ItemBrand, ItemCategory } from '../../models/inventory.models';



@Component({

  selector: 'app-items-form',

  standalone: true,

  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],

  templateUrl: './items-form.component.html',

  styleUrl: './items-form.component.scss'

})

export class ItemFormComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly masterApi = inject(MasterApiService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly itemTypes = InventoryItemTypes;

  readonly loading = signal(false);

  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly isEdit = signal(false);

  readonly categories = signal<ItemCategory[]>([]);

  readonly brands = signal<ItemBrand[]>([]);

  readonly uomOptions = signal<MasterSelectOption[]>([]);

  private id: number | null = null;



  readonly form = this.fb.nonNullable.group({

    itemCode: ['', Validators.required],

    itemName: ['', Validators.required],

    description: [''],

    categoryId: [null as number | null],

    brandId: [null as number | null],

    unitOfMeasureId: [0, [Validators.required, Validators.min(1)]],

    itemType: [InventoryItemTypes.Goods, Validators.required],

    barcode: [''],

    sku: [''],

    reorderLevel: [0, [Validators.required, Validators.min(0)]],

    reorderQuantity: [0, [Validators.required, Validators.min(0)]],

    costPrice: [0, [Validators.required, Validators.min(0)]],

    sellingPrice: [0, [Validators.required, Validators.min(0)]],

    isActive: [true]

  });



  ngOnInit(): void {

    this.api.getCategories({ isActive: true }).subscribe({

      next: (data) => this.categories.set(data),

      error: () => this.categories.set([])

    });

    this.api.getBrands({ isActive: true }).subscribe({

      next: (data) => this.brands.set(data),

      error: () => this.brands.set([])

    });

    this.masterApi.loadSelectOptions('units-of-measure').subscribe({

      next: (data) => this.uomOptions.set(data),

      error: () => this.uomOptions.set([])

    });



    const raw = this.route.snapshot.paramMap.get('id');

    if (!raw) {

      return;

    }



    this.isEdit.set(true);

    this.id = Number(raw);

    this.loading.set(true);

    this.api.getItem(this.id).subscribe({

      next: (row) => {

        this.form.patchValue({

          itemCode: row.itemCode,

          itemName: row.itemName,

          description: row.description ?? '',

          categoryId: row.categoryId,

          brandId: row.brandId,

          unitOfMeasureId: row.unitOfMeasureId,

          itemType: row.itemType as typeof InventoryItemTypes.Goods,

          barcode: row.barcode ?? '',

          sku: row.sku ?? '',

          reorderLevel: row.reorderLevel,

          reorderQuantity: row.reorderQuantity,

          costPrice: row.costPrice,

          sellingPrice: row.sellingPrice,

          isActive: row.isActive

        });

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load item.'));

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

    const body = {

      itemCode: value.itemCode.trim(),

      itemName: value.itemName.trim(),

      description: value.description.trim() || null,

      categoryId: value.categoryId ? Number(value.categoryId) : null,

      brandId: value.brandId ? Number(value.brandId) : null,

      unitOfMeasureId: Number(value.unitOfMeasureId),

      itemType: value.itemType,

      barcode: value.barcode.trim() || null,

      sku: value.sku.trim() || null,

      reorderLevel: Number(value.reorderLevel),

      reorderQuantity: Number(value.reorderQuantity),

      costPrice: Number(value.costPrice),

      sellingPrice: Number(value.sellingPrice),

      ...(this.isEdit() ? { isActive: value.isActive } : {})

    };

    const request$ = this.isEdit()

      ? this.api.updateItem(this.id!, { ...body, isActive: value.isActive })

      : this.api.createItem(body);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        void this.router.navigate(['/inventory/items']);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save item.'));

        this.saving.set(false);

      }

    });

  }

}

