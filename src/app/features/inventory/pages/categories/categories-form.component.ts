import { Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { InventoryApiService } from '../../services/inventory-api.service';

import { ItemCategory } from '../../models/inventory.models';



@Component({

  selector: 'app-categories-form',

  standalone: true,

  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],

  templateUrl: './categories-form.component.html',

  styleUrl: './categories-form.component.scss'

})

export class CategoryFormComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly loading = signal(false);

  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly isEdit = signal(false);

  readonly parents = signal<ItemCategory[]>([]);

  readonly editId = signal<number | null>(null);

  private id: number | null = null;



  readonly form = this.fb.nonNullable.group({

    categoryCode: ['', Validators.required],

    categoryName: ['', Validators.required],

    parentCategoryId: [null as number | null],

    isActive: [true]

  });



  ngOnInit(): void {

    this.api.getCategories().subscribe({

      next: (data) => this.parents.set(data),

      error: () => this.parents.set([])

    });



    const raw = this.route.snapshot.paramMap.get('id');

    if (!raw) {

      return;

    }



    this.isEdit.set(true);

    this.id = Number(raw);

    this.editId.set(this.id);

    this.loading.set(true);

    this.api.getCategory(this.id).subscribe({

      next: (row) => {

        this.form.patchValue({

          categoryCode: row.categoryCode,

          categoryName: row.categoryName,

          parentCategoryId: row.parentCategoryId,

          isActive: row.isActive

        });

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load category.'));

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
      categoryCode: value.categoryCode.trim(),
      categoryName: value.categoryName.trim(),
      parentCategoryId: value.parentCategoryId ? Number(value.parentCategoryId) : null
    };

    const request$ = this.isEdit()
      ? this.api.updateCategory(this.id!, { ...createBody, isActive: value.isActive })
      : this.api.createCategory(createBody);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        void this.router.navigate(['/inventory/categories']);

      },

      error: (error) => {

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save category.'));

        this.saving.set(false);

      }

    });

  }

}

