import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { EmployeeDto, OvertimeDto } from '../../models/hrms.models';

@Component({
  selector: 'app-overtime-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './overtime-page.component.html',
  styleUrl: './overtime-page.component.scss'
})
export class OvertimePageComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly approvingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<OvertimeDto[]>([]);
  readonly employees = signal<EmployeeDto[]>([]);
  readonly branches = this.branchContext.branches;

  readonly createForm = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    employeeId: [0 as number, [Validators.required, Validators.min(1)]],
    attendanceId: [null as number | null],
    overtimeDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    minutes: [0, [Validators.required, Validators.min(1)]],
    rate: [0, [Validators.required, Validators.min(0)]],
    amount: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    const selected = this.branchContext.selectedBranchId();
    if (selected) {
      this.createForm.patchValue({ branchId: selected });
    }
    this.api.getEmployees().subscribe({ next: (d) => this.employees.set(d), error: () => this.employees.set([]) });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getOvertime().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load overtime.'));
        this.loading.set(false);
      }
    });
  }

  save(): void {
    if (this.createForm.invalid || this.saving()) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.createForm.getRawValue();
    const body = {
      branchId: Number(value.branchId),
      employeeId: Number(value.employeeId),
      attendanceId: value.attendanceId ? Number(value.attendanceId) : null,
      overtimeDate: value.overtimeDate,
      startTime: value.startTime,
      endTime: value.endTime,
      minutes: Number(value.minutes),
      rate: Number(value.rate),
      amount: Number(value.amount)
    };
    this.api.createOvertime(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create overtime.'));
        this.saving.set(false);
      }
    });
  }

  approve(row: OvertimeDto): void {
    if (this.approvingId() != null) {
      return;
    }
    this.approvingId.set(row.overtimeId);
    this.errorMessage.set(null);
    this.api.approveOvertime(row.overtimeId).subscribe({
      next: () => {
        this.approvingId.set(null);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to approve overtime.'));
        this.approvingId.set(null);
      }
    });
  }
}
