import { Injectable, computed, inject, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/utils/api-error.util';
import { TenantContextService } from '../../tenant/services/tenant-context.service';
import { BranchDto } from '../models/branch.model';
import { BranchService } from './branch.service';

const SELECTED_BRANCH_STORAGE_KEY = 'saas.selectedBranchId';

/**
 * Application-wide selected branch state for UI convenience.
 * Not a security boundary — backend remains authoritative for branch access.
 */
@Injectable({ providedIn: 'root' })
export class BranchContextService {
  private readonly branchService = inject(BranchService);
  private readonly tenantContext = inject(TenantContextService);

  private readonly branchesSignal = signal<BranchDto[]>([]);
  private readonly selectedBranchIdSignal = signal<number | null>(this.readStoredBranchId());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly branches = this.branchesSignal.asReadonly();
  readonly selectedBranchId = this.selectedBranchIdSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly selectedBranch = computed(() => {
    const branchId = this.selectedBranchIdSignal();
    if (branchId == null) {
      return null;
    }

    return this.branchesSignal().find((branch) => branch.branchId === branchId) ?? null;
  });

  readonly activeBranches = computed(() =>
    this.branchesSignal().filter((branch) => branch.isActive && branch.status === 'Active')
  );

  loadBranches(): void {
    const tenantId = this.tenantContext.tenantId();
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.branchService.getList(tenantId).subscribe({
      next: (response) => {
        const branches = response.data ?? [];
        this.branchesSignal.set(branches);
        this.ensureValidSelection(branches);
        this.loadingSignal.set(false);
      },
      error: (error: unknown) => {
        this.branchesSignal.set([]);
        this.errorSignal.set(
          extractApiErrorMessage(error, 'Unable to load branches for branch selection.')
        );
        this.loadingSignal.set(false);
      }
    });
  }

  selectBranch(branchId: number | null): void {
    this.selectedBranchIdSignal.set(branchId);

    if (branchId == null) {
      sessionStorage.removeItem(SELECTED_BRANCH_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(SELECTED_BRANCH_STORAGE_KEY, String(branchId));
  }

  /**
   * Clear branch list/selection on logout. Does not change TenantId.
   */
  clearSession(): void {
    this.branchesSignal.set([]);
    this.selectedBranchIdSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
    sessionStorage.removeItem(SELECTED_BRANCH_STORAGE_KEY);
  }

  /**
   * Replace the in-memory branch list (e.g. after a full list reload).
   */
  setBranches(branches: BranchDto[]): void {
    this.branchesSignal.set(branches);
    this.ensureValidSelection(branches);
  }

  /**
   * Refresh context after create/update/status changes on the branches page.
   */
  upsertBranch(branch: BranchDto): void {
    const next = [...this.branchesSignal()];
    const index = next.findIndex((item) => item.branchId === branch.branchId);
    if (index >= 0) {
      next[index] = branch;
    } else {
      next.push(branch);
    }

    this.branchesSignal.set(next);
    this.ensureValidSelection(next);
  }

  private ensureValidSelection(branches: BranchDto[]): void {
    const currentId = this.selectedBranchIdSignal();
    if (currentId != null && branches.some((branch) => branch.branchId === currentId)) {
      return;
    }

    const preferred =
      branches.find((branch) => branch.isActive && branch.status === 'Active') ??
      branches[0] ??
      null;

    this.selectBranch(preferred?.branchId ?? null);
  }

  private readStoredBranchId(): number | null {
    const raw = sessionStorage.getItem(SELECTED_BRANCH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
