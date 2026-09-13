import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';

function toTimeSpan(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

function fromApiTime(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const match = String(value).match(/(\d{2}:\d{2}(?::\d{2})?)/);
  if (!match) {
    return String(value);
  }
  return match[1].length === 5 ? `${match[1]}:00` : match[1];
}

@Component({
  selector: 'app-shifts-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './shifts-form.component.html',
  styleUrl: './shifts-form.component.scss'
})
export class ShiftFormComponent implements OnInit {
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
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    shiftCode: ['', Validators.required],
    shiftName: ['', Validators.required],
    startTime: ['09:00:00', Validators.required],
    endTime: ['18:00:00', Validators.required],
    breakMinutes: [60, [Validators.required, Validators.min(0)]],
    graceInMinutes: [0, [Validators.required, Validators.min(0)]],
    isNightShift: [false],
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
    this.api.getShift(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          branchId: row.branchId,
          shiftCode: row.shiftCode,
          shiftName: row.shiftName,
          startTime: fromApiTime(row.startTime),
          endTime: fromApiTime(row.endTime),
          breakMinutes: row.breakMinutes,
          graceInMinutes: row.graceInMinutes,
          isNightShift: row.isNightShift,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load shift.'));
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
      branchId: Number(value.branchId),
      shiftCode: value.shiftCode.trim(),
      shiftName: value.shiftName.trim(),
      startTime: toTimeSpan(value.startTime),
      endTime: toTimeSpan(value.endTime),
      breakMinutes: Number(value.breakMinutes),
      graceInMinutes: Number(value.graceInMinutes),
      isNightShift: value.isNightShift
    };
    if (this.isEdit()) {
      body['isActive'] = value.isActive;
    }
    const request$ = this.isEdit() ? this.api.updateShift(this.id!, body) : this.api.createShift(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/shifts']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save shift.'));
        this.saving.set(false);
      }
    });
  }
}
