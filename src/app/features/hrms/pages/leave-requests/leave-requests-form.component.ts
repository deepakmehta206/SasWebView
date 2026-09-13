import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { EmployeeDto, LeaveTypeDto } from '../../models/hrms.models';

@Component({
  selector: 'app-leave-requests-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent],
  templateUrl: './leave-requests-form.component.html',
  styleUrl: './leave-requests-form.component.scss'
})
export class LeaveRequestFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly employees = signal<EmployeeDto[]>([]);
  readonly leaveTypes = signal<LeaveTypeDto[]>([]);
  readonly branches = this.branchContext.branches;

  readonly form = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    employeeId: [0 as number, [Validators.required, Validators.min(1)]],
    leaveTypeId: [0 as number, [Validators.required, Validators.min(1)]],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    totalDays: [1, [Validators.required, Validators.min(0.5)]],
    reason: ['']
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    const selected = this.branchContext.selectedBranchId();
    if (selected) {
      this.form.patchValue({ branchId: selected });
    }
    this.api.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.employees.set([])
    });
    this.api.getLeaveTypes().subscribe({
      next: (data) => this.leaveTypes.set(data),
      error: () => this.leaveTypes.set([])
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
      branchId: Number(value.branchId),
      employeeId: Number(value.employeeId),
      leaveTypeId: Number(value.leaveTypeId),
      fromDate: value.fromDate,
      toDate: value.toDate,
      totalDays: Number(value.totalDays),
      reason: value.reason.trim() || null
    };
    this.api.createLeaveRequest(body).subscribe({
      next: (created) => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/leave/requests', created.leaveRequestId]);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create leave request.'));
        this.saving.set(false);
      }
    });
  }
}
