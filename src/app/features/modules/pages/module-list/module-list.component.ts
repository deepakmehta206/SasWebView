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
import { ModuleDto } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-list',
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
  templateUrl: './module-list.component.html',
  styleUrl: './module-list.component.scss'
})
export class ModuleListComponent implements OnInit {
  private readonly moduleService = inject(ModuleService);
  readonly permissionCodes = PermissionCodes;

  readonly loading = signal(true);
  readonly modules = signal<ModuleDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly includeInactive = new FormControl(false, { nonNullable: true });
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: ''
  });
  private readonly inactiveFlag = toSignal(this.includeInactive.valueChanges.pipe(startWith(false)), {
    initialValue: false
  });

  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.modules().filter((module) => {
      if (!term) return true;
      return [module.moduleCode, module.moduleName, module.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

  ngOnInit(): void {
    this.includeInactive.valueChanges.subscribe(() => this.load());
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.moduleService.getList(this.includeInactive.value).subscribe({
      next: (response) => {
        this.modules.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.modules.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load modules.'));
        this.loading.set(false);
      }
    });
  }
}
