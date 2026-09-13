import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';

function toDateInput(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
}

@Component({
  selector: 'app-holidays-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './holidays-form.component.html',
  styleUrl: './holidays-form.component.scss'
})
export class HolidayFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly branches = this.branchContext.branches;
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    branchId: [null as number | null],
    holidayDate: ['', Validators.required],
    holidayName: ['', Validators.required],
    holidayType: [''],
    isOptional: [false],
    isActive: [true]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      return;
    }
    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    // No GetById API — load list and find holidayId.
    this.api.getHolidays().subscribe({
      next: (rows) => {
        const row = rows.find((item) => item.holidayId === this.id);
        if (!row) {
          this.errorMessage.set('Holiday not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          branchId: row.branchId,
          holidayDate: toDateInput(row.holidayDate),
          holidayName: row.holidayName,
          holidayType: row.holidayType ?? '',
          isOptional: row.isOptional,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load holiday.'));
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
      branchId: value.branchId ? Number(value.branchId) : null,
      holidayDate: value.holidayDate,
      holidayName: value.holidayName.trim(),
      holidayType: value.holidayType.trim() || null,
      isOptional: value.isOptional
    };
    if (this.isEdit()) {
      body['isActive'] = value.isActive;
    }
    const request$ = this.isEdit()
      ? this.api.updateHoliday(this.id!, body)
      : this.api.createHoliday(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/holidays']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save holiday.'));
        this.saving.set(false);
      }
    });
  }
}
