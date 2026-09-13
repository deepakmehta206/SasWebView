import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { EmployeeTypeDto, LeaveTypeDto } from '../../models/hrms.models';

@Component({
  selector: 'app-leave-policies-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './leave-policies-form.component.html',
  styleUrl: './leave-policies-form.component.scss'
})
export class LeavePolicyFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly leaveTypes = signal<LeaveTypeDto[]>([]);
  readonly employeeTypes = signal<EmployeeTypeDto[]>([]);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    leaveTypeId: [0 as number, [Validators.required, Validators.min(1)]],
    policyName: ['', Validators.required],
    accrualType: ['MONTHLY', Validators.required],
    accrualValue: [0, [Validators.required, Validators.min(0)]],
    carryForwardAllowed: [false],
    maxCarryForward: [0, [Validators.required, Validators.min(0)]],
    applicableToEmployeeTypeId: [null as number | null],
    isActive: [true]
  });

  ngOnInit(): void {
    this.api.getLeaveTypes().subscribe({
      next: (data) => this.leaveTypes.set(data),
      error: () => this.leaveTypes.set([])
    });
    this.api.getEmployeeTypes().subscribe({
      next: (data) => this.employeeTypes.set(data),
      error: () => this.employeeTypes.set([])
    });

    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      return;
    }
    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getLeavePolicies().subscribe({
      next: (rows) => {
        const row = rows.find((item) => item.leavePolicyId === this.id);
        if (!row) {
          this.errorMessage.set('Leave policy not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          leaveTypeId: row.leaveTypeId,
          policyName: row.policyName,
          accrualType: row.accrualType,
          accrualValue: row.accrualValue,
          carryForwardAllowed: row.carryForwardAllowed,
          maxCarryForward: row.maxCarryForward,
          applicableToEmployeeTypeId: row.applicableToEmployeeTypeId,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load leave policy.'));
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
      leavePolicyId: this.isEdit() ? this.id : null,
      leaveTypeId: Number(value.leaveTypeId),
      policyName: value.policyName.trim(),
      accrualType: value.accrualType.trim(),
      accrualValue: Number(value.accrualValue),
      carryForwardAllowed: value.carryForwardAllowed,
      maxCarryForward: Number(value.maxCarryForward),
      applicableToEmployeeTypeId: value.applicableToEmployeeTypeId
        ? Number(value.applicableToEmployeeTypeId)
        : null,
      isActive: value.isActive
    };
    this.api.saveLeavePolicy(body).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/leave/policies']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save leave policy.'));
        this.saving.set(false);
      }
    });
  }
}
