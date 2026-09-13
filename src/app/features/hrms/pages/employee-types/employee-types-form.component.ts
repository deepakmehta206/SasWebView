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
  selector: 'app-employee-types-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './employee-types-form.component.html',
  styleUrl: './employee-types-form.component.scss'
})
export class EmployeeTypeFormComponent implements OnInit {
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
    employeeTypeCode: ['', Validators.required],
    employeeTypeName: ['', Validators.required],
    description: [''],
    isActive: [true]
  });
  ngOnInit(){
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return;
    this.isEdit.set(true); this.id = Number(raw); this.loading.set(true);
    this.api.getEmployeeType(this.id).subscribe({
      next: (row: any) => {
        this.form.patchValue({ employeeTypeCode: row.employeeTypeCode, employeeTypeName: row.employeeTypeName, description: row.description ?? '', isActive: row.isActive });
        this.loading.set(false);
      },
      error: e => { this.errorMessage.set(extractApiErrorMessage(e,'Unable to load.')); this.loading.set(false); }
    });
  }
  submit(){
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.errorMessage.set(null);
    const v = this.form.getRawValue();
    const body: any = { employeeTypeCode: v.employeeTypeCode.trim(), employeeTypeName: v.employeeTypeName.trim(), description: v.description.trim() || null };
    if (this.isEdit()) body.isActive = v.isActive;
    const req$ = this.isEdit() ? this.api.updateEmployeeType(this.id!, body) : this.api.createEmployeeType(body);
    req$.subscribe({
      next: () => { this.saving.set(false); void this.router.navigate(['/hrms/employee-types']); },
      error: e => { this.errorMessage.set(extractApiErrorMessage(e,'Unable to save.')); this.saving.set(false); }
    });
  }
}
