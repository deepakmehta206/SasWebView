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
import { AttendanceDto, AttendanceSummaryDto, EmployeeDto, ShiftDto } from '../../models/hrms.models';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.scss'
})
export class AttendancePageComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<AttendanceDto[]>([]);
  readonly summary = signal<AttendanceSummaryDto[]>([]);
  readonly employees = signal<EmployeeDto[]>([]);
  readonly shifts = signal<ShiftDto[]>([]);
  readonly branches = this.branchContext.branches;

  readonly filters = this.fb.nonNullable.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    branchId: [null as number | null]
  });

  readonly createForm = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    employeeId: [0 as number, [Validators.required, Validators.min(1)]],
    attendanceDate: ['', Validators.required],
    shiftId: [null as number | null],
    checkInTime: [''],
    checkOutTime: [''],
    status: ['PRESENT', Validators.required],
    workedMinutes: [0, [Validators.required, Validators.min(0)]],
    overtimeMinutes: [0, [Validators.required, Validators.min(0)]],
    source: ['MANUAL']
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    const selected = this.branchContext.selectedBranchId();
    if (selected) {
      this.createForm.patchValue({ branchId: selected });
      this.filters.patchValue({ branchId: selected });
    }
    this.api.getEmployees().subscribe({ next: (d) => this.employees.set(d), error: () => this.employees.set([]) });
    this.api.getShifts().subscribe({ next: (d) => this.shifts.set(d), error: () => this.shifts.set([]) });
  }

  load(): void {
    if (this.filters.invalid) {
      this.filters.markAllAsTouched();
      this.errorMessage.set('From date and to date are required.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    const params: Record<string, string | number | boolean> = {
      fromDate: value.fromDate,
      toDate: value.toDate
    };
    if (value.branchId) {
      params['branchId'] = Number(value.branchId);
    }
    this.api.getAttendance(params).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load attendance.'));
        this.loading.set(false);
      }
    });
    this.api.getAttendanceSummary(params).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.summary.set([])
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
      attendanceDate: value.attendanceDate,
      shiftId: value.shiftId ? Number(value.shiftId) : null,
      checkInTime: value.checkInTime || null,
      checkOutTime: value.checkOutTime || null,
      status: value.status,
      workedMinutes: Number(value.workedMinutes),
      overtimeMinutes: Number(value.overtimeMinutes),
      source: value.source.trim() || null
    };
    this.api.saveAttendance(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save attendance.'));
        this.saving.set(false);
      }
    });
  }
}
