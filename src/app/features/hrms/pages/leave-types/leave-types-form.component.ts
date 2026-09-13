import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';

@Component({
  selector: 'app-leave-types-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './leave-types-form.component.html',
  styleUrl: './leave-types-form.component.scss'
})
export class LeaveTypeFormComponent implements OnInit {
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
    leaveCode: ['', Validators.required],
    leaveName: ['', Validators.required],
    paidLeave: [true],
    annualQuota: [0, [Validators.required, Validators.min(0)]],
    carryForwardAllowed: [false],
    maxCarryForward: [0, [Validators.required, Validators.min(0)]],
    requiresApproval: [true],
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
    this.api.getLeaveTypes().subscribe({
      next: (rows) => {
        const row = rows.find((item) => item.leaveTypeId === this.id);
        if (!row) {
          this.errorMessage.set('Leave type not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          leaveCode: row.leaveCode,
          leaveName: row.leaveName,
          paidLeave: row.paidLeave,
          annualQuota: row.annualQuota,
          carryForwardAllowed: row.carryForwardAllowed,
          maxCarryForward: row.maxCarryForward,
          requiresApproval: row.requiresApproval,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load leave type.'));
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
      leaveCode: value.leaveCode.trim(),
      leaveName: value.leaveName.trim(),
      paidLeave: value.paidLeave,
      annualQuota: Number(value.annualQuota),
      carryForwardAllowed: value.carryForwardAllowed,
      maxCarryForward: Number(value.maxCarryForward),
      requiresApproval: value.requiresApproval
    };
    if (this.isEdit()) {
      body['isActive'] = value.isActive;
    }
    const request$ = this.isEdit()
      ? this.api.updateLeaveType(this.id!, body)
      : this.api.createLeaveType(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/leave/types']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save leave type.'));
        this.saving.set(false);
      }
    });
  }
}
