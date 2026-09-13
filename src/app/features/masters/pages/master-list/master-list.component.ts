import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import {
  MasterDefinition,
  MasterSelectOption,
  getMasterDefinition
} from '../../models/master.definitions';
import { MasterApiService } from '../../services/master-api.service';

@Component({
  selector: 'app-master-list',
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
  templateUrl: './master-list.component.html',
  styleUrl: './master-list.component.scss'
})
export class MasterListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MasterApiService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<Record<string, unknown>[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly definition = signal<MasterDefinition | null>(null);
  readonly filterOptions = signal<Record<string, MasterSelectOption[]>>({});

  readonly filterForm = this.fb.nonNullable.group({
    isActive: ['' as string],
    filterValue: ['' as string]
  });

  ngOnInit(): void {
    const key = this.route.snapshot.data['masterKey'] as string;
    const def = getMasterDefinition(key);
    this.definition.set(def);
    if (!def) {
      this.errorMessage.set('Unknown master resource.');
      this.loading.set(false);
      return;
    }

    const filter = def.listFilters?.[0];
    if (filter?.optionsFrom) {
      this.api.loadSelectOptions(filter.optionsFrom).subscribe({
        next: (options) =>
          this.filterOptions.update((current) => ({ ...current, [filter.key]: options })),
        error: () => undefined
      });
    }

    this.load();
  }

  load(): void {
    const def = this.definition();
    if (!def) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const params: Record<string, string | number | boolean> = {};
    const isActive = this.filterForm.controls.isActive.value;
    if (isActive === 'true') {
      params['isActive'] = true;
    } else if (isActive === 'false') {
      params['isActive'] = false;
    }

    const filter = def.listFilters?.[0];
    const filterValue = this.filterForm.controls.filterValue.value;
    if (filter && filterValue) {
      params[filter.key] = Number(filterValue);
    }

    this.api.getList<Record<string, unknown>>(def.endpoint, params).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, `Unable to load ${def.title}.`));
        this.loading.set(false);
      }
    });
  }

  displayValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value == null || value === '') {
      return '—';
    }
    return String(value);
  }

  rowId(row: Record<string, unknown>): number {
    const def = this.definition();
    return Number(row[def?.idField ?? ''] ?? 0);
  }
}
