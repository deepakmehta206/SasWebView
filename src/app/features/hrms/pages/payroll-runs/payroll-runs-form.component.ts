import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';

@Component({
  selector: 'app-payroll-runs-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent],
  templateUrl: './payroll-runs-form.component.html',
  styleUrl: './payroll-runs-form.component.scss'
})
export class PayrollRunFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly branches = this.branchContext.branches;

  readonly form = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    payrollMonth: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    payrollYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    const selected = this.branchContext.selectedBranchId();
    if (selected) {
      this.form.patchValue({ branchId: selected });
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    this.api
      .createPayrollRun({
        branchId: Number(value.branchId),
        payrollMonth: Number(value.payrollMonth),
        payrollYear: Number(value.payrollYear)
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          void this.router.navigate(['/hrms/payroll/runs', created.payrollRunId]);
        },
        error: (error) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create payroll run.'));
          this.saving.set(false);
        }
      });
  }
}
