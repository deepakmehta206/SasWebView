import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';

@Component({
  selector: 'app-salary-components-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './salary-components-form.component.html',
  styleUrl: './salary-components-form.component.scss'
})
export class SalaryComponentFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    componentCode: ['', Validators.required],
    componentName: ['', Validators.required],
    componentType: ['EARNING', Validators.required],
    calculationType: ['FIXED', Validators.required],
    isTaxable: [false],
    isStatutory: [false],
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
    this.api.getSalaryComponents().subscribe({
      next: (rows) => {
        const row = rows.find((item) => item.salaryComponentId === this.id);
        if (!row) {
          this.errorMessage.set('Salary component not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          componentCode: row.componentCode,
          componentName: row.componentName,
          componentType: row.componentType,
          calculationType: row.calculationType,
          isTaxable: row.isTaxable,
          isStatutory: row.isStatutory,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load salary component.'));
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
    const body: Record<string, unknown> = {
      componentCode: value.componentCode.trim(),
      componentName: value.componentName.trim(),
      componentType: value.componentType,
      calculationType: value.calculationType,
      isTaxable: value.isTaxable,
      isStatutory: value.isStatutory
    };
    if (this.isEdit()) {
      body['isActive'] = value.isActive;
    }
    const request$ = this.isEdit()
      ? this.api.updateSalaryComponent(this.id!, body)
      : this.api.createSalaryComponent(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/salary/components']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save salary component.'));
        this.saving.set(false);
      }
    });
  }
}
