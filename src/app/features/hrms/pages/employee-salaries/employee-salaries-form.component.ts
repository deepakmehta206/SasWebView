import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { EmployeeDto, SalaryStructureDto } from '../../models/hrms.models';

@Component({
  selector: 'app-employee-salaries-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent],
  templateUrl: './employee-salaries-form.component.html',
  styleUrl: './employee-salaries-form.component.scss'
})
export class EmployeeSalaryFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly employees = signal<EmployeeDto[]>([]);
  readonly structures = signal<SalaryStructureDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    employeeId: [0 as number, [Validators.required, Validators.min(1)]],
    salaryStructureId: [0 as number, [Validators.required, Validators.min(1)]],
    effectiveFrom: ['', Validators.required],
    effectiveTo: [''],
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    grossSalary: [0, [Validators.required, Validators.min(0)]],
    ctc: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.api.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.employees.set([])
    });
    this.api.getSalaryStructures().subscribe({
      next: (data) => this.structures.set(data),
      error: () => this.structures.set([])
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
      employeeId: Number(value.employeeId),
      salaryStructureId: Number(value.salaryStructureId),
      effectiveFrom: value.effectiveFrom,
      effectiveTo: value.effectiveTo.trim() || null,
      basicSalary: Number(value.basicSalary),
      grossSalary: Number(value.grossSalary),
      ctc: Number(value.ctc),
      status: value.status
    };
    this.api.saveEmployeeSalary(body).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/salary/employee-salaries']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to assign salary.'));
        this.saving.set(false);
      }
    });
  }
}
