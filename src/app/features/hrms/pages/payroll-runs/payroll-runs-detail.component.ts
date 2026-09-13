import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { PayrollRunDto } from '../../models/hrms.models';

@Component({
  selector: 'app-payroll-runs-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './payroll-runs-detail.component.html',
  styleUrl: './payroll-runs-detail.component.scss'
})
export class PayrollRunDetailComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly run = signal<PayrollRunDto | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getPayrollRun(id).subscribe({
      next: (data) => {
        this.run.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.run.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load payroll run.'));
        this.loading.set(false);
      }
    });
  }

  process(): void {
    const current = this.run();
    if (!current || this.acting() || current.status === 'LOCKED') {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.processPayrollRun(current.payrollRunId).subscribe({
      next: (data) => {
        this.run.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to process payroll run.'));
        this.acting.set(false);
      }
    });
  }

  approve(): void {
    const current = this.run();
    if (!current || this.acting() || current.status === 'LOCKED') {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.approvePayrollRun(current.payrollRunId).subscribe({
      next: (data) => {
        this.run.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to approve payroll run.'));
        this.acting.set(false);
      }
    });
  }

  lock(): void {
    const current = this.run();
    if (!current || this.acting() || current.status === 'LOCKED') {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.lockPayrollRun(current.payrollRunId).subscribe({
      next: (data) => {
        this.run.set(data);
        this.acting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to lock payroll run.'));
        this.acting.set(false);
      }
    });
  }
}
