import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { MasterApiService } from '../../../masters/services/master-api.service';

@Component({
  selector: 'app-employee-types-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent, HasPermissionDirective],
  templateUrl: './employee-types-list.component.html',
  styleUrl: './employee-types-list.component.scss'
})
export class EmployeeTypeListComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<any[]>([]);
  readonly errorMessage = signal<string | null>(null);
  ngOnInit(){ this.load(); }
  load(){
    this.loading.set(true); this.errorMessage.set(null);
    this.api.getEmployeeTypes().subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: e => { this.rows.set([]); this.errorMessage.set(extractApiErrorMessage(e,'Unable to load.')); this.loading.set(false); }
    });
  }
}
