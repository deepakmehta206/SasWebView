import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchContextService } from '../../services/branch-context.service';

@Component({
  selector: 'app-branch-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './branch-selector.component.html',
  styleUrl: './branch-selector.component.scss'
})
export class BranchSelectorComponent implements OnInit {
  readonly branchContext = inject(BranchContextService);

  ngOnInit(): void {
    if (this.branchContext.branches().length === 0 && !this.branchContext.loading()) {
      this.branchContext.loadBranches();
    }
  }

  onBranchChange(branchId: number | null): void {
    this.branchContext.selectBranch(branchId);
  }
}
