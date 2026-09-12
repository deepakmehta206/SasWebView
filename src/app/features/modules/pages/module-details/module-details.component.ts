import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { ModuleDto } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';
import { FeatureDto } from '../../../features/models/feature.model';

@Component({
  selector: 'app-module-details',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent, EmptyStateComponent, HasPermissionDirective],
  templateUrl: './module-details.component.html',
  styleUrl: './module-details.component.scss'
})
export class ModuleDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly moduleService = inject(ModuleService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly module = signal<ModuleDto | null>(null);
  readonly features = signal<FeatureDto[]>([]);

  ngOnInit(): void {
    const moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      this.errorMessage.set('Invalid module id.');
      this.loading.set(false);
      return;
    }
    this.load(moduleId);
  }

  load(moduleId: number): void {
    this.loading.set(true);
    this.moduleService.getById(moduleId).subscribe({
      next: (response) => {
        this.module.set(response.data);
        this.moduleService.getFeatures(moduleId, true).subscribe({
          next: (featuresResponse) => {
            this.features.set(featuresResponse.data ?? []);
            this.loading.set(false);
          },
          error: (error: unknown) => {
            this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load module features.'));
            this.loading.set(false);
          }
        });
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load module.'));
        this.loading.set(false);
      }
    });
  }
}
