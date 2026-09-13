import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { EmployeeDto } from '../../models/hrms.models';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './employees-list.component.html',
  styleUrl: './employees-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<EmployeeDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly branches = this.branchContext.branches;

  readonly filters = this.fb.nonNullable.group({
    branchId: [null as number | null],
    isActive: [null as boolean | null]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    const params: Record<string, string | number | boolean> = {};
    if (value.branchId) {
      params['branchId'] = Number(value.branchId);
    }
    if (value.isActive !== null && value.isActive !== undefined) {
      params['isActive'] = value.isActive;
    }
    this.api.getEmployees(params).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load employees.'));
        this.loading.set(false);
      }
    });
  }
}
