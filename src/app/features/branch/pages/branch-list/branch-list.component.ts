import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { TenantContextService } from '../../../tenant/services/tenant-context.service';
import { BranchDto } from '../../models/branch.model';
import { BranchContextService } from '../../services/branch-context.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly branchContext = inject(BranchContextService);
  private readonly tenantContext = inject(TenantContextService);

  readonly loading = signal(true);
  readonly statusUpdatingId = signal<number | null>(null);
  readonly branches = signal<BranchDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl('all', { nonNullable: true });

  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: ''
  });
  private readonly statusFilter = toSignal(this.statusControl.valueChanges.pipe(startWith('all')), {
    initialValue: 'all'
  });

  readonly filteredBranches = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.branches().filter((branch) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && branch.isActive) ||
        (status === 'inactive' && !branch.isActive) ||
        branch.status.toLowerCase() === status;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        branch.branchCode,
        branch.branchName,
        branch.city,
        branch.state,
        branch.country,
        branch.email
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  });

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    const tenantId = this.tenantContext.tenantId();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.branchService.getList(tenantId).subscribe({
      next: (response) => {
        const items = response.data ?? [];
        this.branches.set(items);
        this.branchContext.setBranches(items);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.branches.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load branches.'));
        this.loading.set(false);
      }
    });
  }

  toggleStatus(branch: BranchDto): void {
    const nextActive = !branch.isActive;
    const nextStatus = nextActive ? 'Active' : 'Inactive';
    this.statusUpdatingId.set(branch.branchId);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.branchService
      .setStatus(this.tenantContext.tenantId(), branch.branchId, {
        status: nextStatus,
        isActive: nextActive
      })
      .subscribe({
        next: (response) => {
          const updated: BranchDto = { ...branch, status: nextStatus, isActive: nextActive };
          this.branches.set(
            this.branches().map((item) => (item.branchId === branch.branchId ? updated : item))
          );
          this.branchContext.upsertBranch(updated);
          this.successMessage.set(response.message || 'Branch status updated.');
          this.statusUpdatingId.set(null);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update branch status.'));
          this.statusUpdatingId.set(null);
        }
      });
  }
}
