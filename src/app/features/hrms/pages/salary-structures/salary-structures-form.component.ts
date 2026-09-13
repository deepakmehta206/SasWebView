import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { SalaryComponentDto } from '../../models/hrms.models';

@Component({
  selector: 'app-salary-structures-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './salary-structures-form.component.html',
  styleUrl: './salary-structures-form.component.scss'
})
export class SalaryStructureFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly components = signal<SalaryComponentDto[]>([]);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    structureCode: ['', Validators.required],
    structureName: ['', Validators.required],
    isActive: [true],
    details: this.fb.array([this.createDetailGroup()])
  });

  get details(): FormArray {
    return this.form.controls.details;
  }

  ngOnInit(): void {
    this.api.getSalaryComponents().subscribe({
      next: (data) => this.components.set(data),
      error: () => this.components.set([])
    });

    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      return;
    }
    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getSalaryStructure(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          structureCode: row.structureCode,
          structureName: row.structureName,
          isActive: row.isActive
        });
        this.details.clear();
        for (const detail of row.details ?? []) {
          this.details.push(
            this.createDetailGroup({
              salaryComponentId: detail.salaryComponentId,
              calculationType: detail.calculationType,
              amount: detail.amount,
              percentage: detail.percentage,
              sequence: detail.sequence
            })
          );
        }
        if (!this.details.length) {
          this.details.push(this.createDetailGroup());
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load salary structure.'));
        this.loading.set(false);
      }
    });
  }

  createDetailGroup(seed?: {
    salaryComponentId?: number;
    calculationType?: string;
    amount?: number;
    percentage?: number | null;
    sequence?: number;
  }) {
    return this.fb.nonNullable.group({
      salaryComponentId: [seed?.salaryComponentId ?? 0, [Validators.required, Validators.min(1)]],
      calculationType: [seed?.calculationType ?? 'FIXED', Validators.required],
      amount: [seed?.amount ?? 0, [Validators.required, Validators.min(0)]],
      percentage: [seed?.percentage ?? null as number | null],
      sequence: [seed?.sequence ?? 1, [Validators.required, Validators.min(1)]]
    });
  }

  addDetail(): void {
    this.details.push(this.createDetailGroup({ sequence: this.details.length + 1 }));
  }

  removeDetail(index: number): void {
    if (this.details.length <= 1) {
      return;
    }
    this.details.removeAt(index);
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
      structureCode: value.structureCode.trim(),
      structureName: value.structureName.trim(),
      isActive: value.isActive,
      details: value.details.map((detail) => ({
        salaryComponentId: Number(detail.salaryComponentId),
        calculationType: detail.calculationType,
        amount: Number(detail.amount),
        percentage: detail.percentage == null ? 0 : Number(detail.percentage),
        sequence: Number(detail.sequence)
      }))
    };
    const request$ = this.isEdit()
      ? this.api.updateSalaryStructure(this.id!, body)
      : this.api.createSalaryStructure(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/salary/structures']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save salary structure.'));
        this.saving.set(false);
      }
    });
  }
}
