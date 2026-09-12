import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { CreateModuleRequest, UpdateModuleRequest } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent],
  templateUrl: './module-form.component.html',
  styleUrl: './module-form.component.scss'
})
export class ModuleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly moduleService = inject(ModuleService);

  readonly isEdit = signal(false);
  readonly moduleId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);

  readonly form = this.fb.nonNullable.group({
    moduleCode: ['', [Validators.required, Validators.maxLength(50)]],
    moduleName: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(500)]],
    displayOrder: [0, [Validators.required]],
    icon: ['', [Validators.maxLength(100)]],
    route: ['', [Validators.maxLength(200)]],
    isSystemModule: [false],
    isActive: [true]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('moduleId');
    if (!rawId) {
      this.isEdit.set(false);
      return;
    }
    const moduleId = Number(rawId);
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid module id.');
      return;
    }
    this.isEdit.set(true);
    this.moduleId.set(moduleId);
    this.load(moduleId);
  }

  load(moduleId: number): void {
    this.loading.set(true);
    this.moduleService.getById(moduleId).subscribe({
      next: (response) => {
        const module = response.data;
        if (!module) {
          this.loadFailed.set(true);
          this.errorMessage.set('Module not found.');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          moduleCode: module.moduleCode,
          moduleName: module.moduleName,
          description: module.description ?? '',
          displayOrder: module.displayOrder,
          icon: module.icon ?? '',
          route: module.route ?? '',
          isSystemModule: module.isSystemModule,
          isActive: module.isActive
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load module.'));
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set([]);

    if (this.isEdit()) {
      const request: UpdateModuleRequest = {
        moduleCode: value.moduleCode.trim(),
        moduleName: value.moduleName.trim(),
        description: value.description.trim() || null,
        parentModuleId: null,
        displayOrder: Number(value.displayOrder) || 0,
        icon: value.icon.trim() || null,
        route: value.route.trim() || null,
        isSystemModule: value.isSystemModule,
        isActive: value.isActive
      };
      this.moduleService.update(this.moduleId()!, request).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/modules', this.moduleId()]);
        },
        error: (error: unknown) => {
          this.fieldErrors.set(extractApiErrors(error));
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update module.'));
          this.saving.set(false);
        }
      });
      return;
    }

    const request: CreateModuleRequest = {
      moduleCode: value.moduleCode.trim(),
      moduleName: value.moduleName.trim(),
      description: value.description.trim() || null,
      parentModuleId: null,
      displayOrder: Number(value.displayOrder) || 0,
      icon: value.icon.trim() || null,
      route: value.route.trim() || null,
      isSystemModule: value.isSystemModule
    };
    this.moduleService.create(request).subscribe({
      next: (response) => {
        this.saving.set(false);
        const id = response.data?.moduleId;
        void this.router.navigate(id ? ['/modules', id] : ['/modules']);
      },
      error: (error: unknown) => {
        this.fieldErrors.set(extractApiErrors(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create module.'));
        this.saving.set(false);
      }
    });
  }
}
