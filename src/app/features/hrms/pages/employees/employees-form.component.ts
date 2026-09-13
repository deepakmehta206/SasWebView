import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import {
  CreateEmployeeRequest,
  DepartmentDto,
  DesignationDto,
  EmployeeTypeDto,
  UpdateEmployeeRequest
} from '../../models/hrms.models';

@Component({
  selector: 'app-employees-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './employees-form.component.html',
  styleUrl: './employees-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly branches = this.branchContext.branches;
  readonly departments = signal<DepartmentDto[]>([]);
  readonly designations = signal<DesignationDto[]>([]);
  readonly employeeTypes = signal<EmployeeTypeDto[]>([]);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    employeeCode: ['', Validators.required],
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    email: [''],
    phone: [''],
    dateOfBirth: [''],
    dateOfJoining: ['', Validators.required],
    dateOfLeaving: [''],
    gender: [''],
    departmentId: [null as number | null],
    designationId: [null as number | null],
    employeeTypeId: [null as number | null],
    reportingManagerId: [null as number | null],
    userId: [null as number | null],
    status: ['ACTIVE'],
    isActive: [true]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.api.getDepartments().subscribe({ next: (d) => this.departments.set(d), error: () => this.departments.set([]) });
    this.api.getDesignations().subscribe({ next: (d) => this.designations.set(d), error: () => this.designations.set([]) });
    this.api.getEmployeeTypes().subscribe({ next: (d) => this.employeeTypes.set(d), error: () => this.employeeTypes.set([]) });

    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      const selected = this.branchContext.selectedBranchId();
      if (selected) {
        this.form.patchValue({ branchId: selected });
      }
      return;
    }
    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getEmployee(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          branchId: row.branchId,
          employeeCode: row.employeeCode,
          firstName: row.firstName,
          middleName: row.middleName ?? '',
          lastName: row.lastName,
          email: row.email ?? '',
          phone: row.phone ?? '',
          dateOfBirth: row.dateOfBirth?.slice(0, 10) ?? '',
          dateOfJoining: row.dateOfJoining?.slice(0, 10) ?? '',
          dateOfLeaving: row.dateOfLeaving?.slice(0, 10) ?? '',
          gender: row.gender ?? '',
          departmentId: row.departmentId,
          designationId: row.designationId,
          employeeTypeId: row.employeeTypeId,
          reportingManagerId: row.reportingManagerId,
          userId: row.userId,
          status: row.status,
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load employee.'));
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
    const body: CreateEmployeeRequest | UpdateEmployeeRequest = {
      branchId: Number(value.branchId),
      employeeCode: value.employeeCode.trim(),
      firstName: value.firstName.trim(),
      middleName: value.middleName.trim() || null,
      lastName: value.lastName.trim(),
      email: value.email.trim() || null,
      phone: value.phone.trim() || null,
      dateOfBirth: value.dateOfBirth || null,
      dateOfJoining: value.dateOfJoining,
      dateOfLeaving: value.dateOfLeaving || null,
      gender: value.gender.trim() || null,
      departmentId: value.departmentId ? Number(value.departmentId) : null,
      designationId: value.designationId ? Number(value.designationId) : null,
      employeeTypeId: value.employeeTypeId ? Number(value.employeeTypeId) : null,
      reportingManagerId: value.reportingManagerId ? Number(value.reportingManagerId) : null,
      userId: value.userId ? Number(value.userId) : null,
      status: value.status,
      ...(this.isEdit() ? { isActive: value.isActive } : {})
    };
    const request$ = this.isEdit()
      ? this.api.updateEmployee(this.id!, body as UpdateEmployeeRequest)
      : this.api.createEmployee(body);
    request$.subscribe({
      next: (saved) => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/employees', saved.employeeId]);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save employee.'));
        this.saving.set(false);
      }
    });
  }
}
