import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { HrmsApiService } from '../../services/hrms-api.service';
import { DepartmentDto } from '../../models/hrms.models';

@Component({
  selector: 'app-departments-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './departments-form.component.html',
  styleUrl: './departments-form.component.scss'
})
export class DepartmentFormComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly parents = signal<DepartmentDto[]>([]);
  readonly branches = this.branchContext.branches;
  readonly editId = signal<number | null>(null);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    branchId: [0 as number, [Validators.required, Validators.min(1)]],
    departmentCode: ['', Validators.required],
    departmentName: ['', Validators.required],
    parentDepartmentId: [null as number | null],
    description: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.api.getDepartments().subscribe({
      next: (data) => this.parents.set(data),
      error: () => this.parents.set([])
    });

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
    this.editId.set(this.id);
    this.loading.set(true);
    this.api.getDepartment(this.id).subscribe({
      next: (row) => {
        this.form.patchValue({
          branchId: row.branchId,
          departmentCode: row.departmentCode,
          departmentName: row.departmentName,
          parentDepartmentId: row.parentDepartmentId,
          description: row.description ?? '',
          isActive: row.isActive
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load department.'));
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
      branchId: Number(value.branchId),
      departmentCode: value.departmentCode.trim(),
      departmentName: value.departmentName.trim(),
      parentDepartmentId: value.parentDepartmentId ? Number(value.parentDepartmentId) : null,
      description: value.description.trim() || null
    };
    if (this.isEdit()) {
      body['isActive'] = value.isActive;
    }
    const request$ = this.isEdit()
      ? this.api.updateDepartment(this.id!, body)
      : this.api.createDepartment(body);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/hrms/departments']);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save department.'));
        this.saving.set(false);
      }
    });
  }
}
