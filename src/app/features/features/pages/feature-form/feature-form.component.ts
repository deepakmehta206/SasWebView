import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage, extractApiErrors } from '../../../../core/utils/api-error.util';
import { ApiError } from '../../../../core/models/api-response.model';
import { CreateFeatureRequest, FeatureDto, UpdateFeatureRequest } from '../../models/feature.model';
import { FeatureCatalogService } from '../../services/feature-catalog.service';
import { ModuleDto } from '../../../modules/models/module.model';
import { ModuleService } from '../../../modules/services/module.service';

@Component({
  selector: 'app-feature-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent],
  templateUrl: './feature-form.component.html',
  styleUrl: './feature-form.component.scss'
})
export class FeatureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly featureService = inject(FeatureCatalogService);
  private readonly moduleService = inject(ModuleService);

  readonly isEdit = signal(false);
  readonly featureId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<ApiError[]>([]);
  readonly modules = signal<ModuleDto[]>([]);
  readonly existing = signal<FeatureDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    moduleId: ['', [Validators.required]],
    featureCode: ['', [Validators.required, Validators.maxLength(100)]],
    featureName: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(500)]],
    displayOrder: [0, [Validators.required]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.moduleService.getList(true).subscribe({
      next: (response) => this.modules.set(response.data ?? []),
      error: () => this.modules.set([])
    });

    const rawId = this.route.snapshot.paramMap.get('featureId');
    if (!rawId) {
      this.isEdit.set(false);
      return;
    }
    const featureId = Number(rawId);
    if (!Number.isFinite(featureId) || featureId <= 0) {
      this.loadFailed.set(true);
      this.errorMessage.set('Invalid feature id.');
      return;
    }
    this.isEdit.set(true);
    this.featureId.set(featureId);
    this.loadForEdit(featureId);
  }

  /** Backend has no GET /features/{id}; load from list. */
  loadForEdit(featureId: number): void {
    this.loading.set(true);
    this.featureService.getList(true).subscribe({
      next: (response) => {
        const feature = (response.data ?? []).find((item) => item.featureId === featureId) ?? null;
        if (!feature) {
          this.loadFailed.set(true);
          this.errorMessage.set('Feature not found.');
          this.loading.set(false);
          return;
        }
        this.existing.set(feature);
        this.form.patchValue({
          moduleId: String(feature.moduleId),
          featureCode: feature.featureCode,
          featureName: feature.featureName,
          description: feature.description ?? '',
          displayOrder: feature.displayOrder,
          isActive: feature.isActive
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadFailed.set(true);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load feature.'));
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
      const request: UpdateFeatureRequest = {
        moduleId: Number(value.moduleId),
        featureCode: value.featureCode.trim(),
        featureName: value.featureName.trim(),
        description: value.description.trim() || null,
        displayOrder: Number(value.displayOrder) || 0,
        isActive: value.isActive
      };
      this.featureService.update(this.featureId()!, request).subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/features']);
        },
        error: (error: unknown) => {
          this.fieldErrors.set(extractApiErrors(error));
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update feature.'));
          this.saving.set(false);
        }
      });
      return;
    }

    const request: CreateFeatureRequest = {
      moduleId: Number(value.moduleId),
      featureCode: value.featureCode.trim(),
      featureName: value.featureName.trim(),
      description: value.description.trim() || null,
      displayOrder: Number(value.displayOrder) || 0
    };
    this.featureService.create(request).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/features']);
      },
      error: (error: unknown) => {
        this.fieldErrors.set(extractApiErrors(error));
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create feature.'));
        this.saving.set(false);
      }
    });
  }
}
