import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { FeatureDto } from '../../models/feature.model';
import { FeatureCatalogService } from '../../services/feature-catalog.service';
import { ModuleDto } from '../../../modules/models/module.model';
import { ModuleService } from '../../../modules/services/module.service';

@Component({
  selector: 'app-feature-list',
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
  templateUrl: './feature-list.component.html',
  styleUrl: './feature-list.component.scss'
})
export class FeatureListComponent implements OnInit {
  private readonly featureService = inject(FeatureCatalogService);
  private readonly moduleService = inject(ModuleService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly features = signal<FeatureDto[]>([]);
  readonly modules = signal<ModuleDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly moduleFilter = new FormControl('', { nonNullable: true });
  readonly includeInactive = new FormControl(false, { nonNullable: true });

  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), { initialValue: '' });
  private readonly moduleIdFilter = toSignal(this.moduleFilter.valueChanges.pipe(startWith('')), { initialValue: '' });

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const moduleId = this.moduleIdFilter();
    return this.features().filter((feature) => {
      if (moduleId && String(feature.moduleId) !== moduleId) return false;
      if (!term) return true;
      return [feature.featureCode, feature.featureName, feature.moduleCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

  ngOnInit(): void {
    this.moduleService.getList(true).subscribe({
      next: (response) => this.modules.set(response.data ?? []),
      error: () => this.modules.set([])
    });
    this.includeInactive.valueChanges.subscribe(() => this.load());
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.featureService.getList(this.includeInactive.value).subscribe({
      next: (response) => {
        this.features.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.features.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load features.'));
        this.loading.set(false);
      }
    });
  }
}
