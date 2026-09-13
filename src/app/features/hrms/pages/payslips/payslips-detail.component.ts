import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { HrmsApiService } from '../../services/hrms-api.service';
import { PayslipDto } from '../../models/hrms.models';

@Component({
  selector: 'app-payslips-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './payslips-detail.component.html',
  styleUrl: './payslips-detail.component.scss'
})
export class PayslipDetailComponent implements OnInit {
  private readonly api = inject(HrmsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly payslip = signal<PayslipDto | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPayslip(id).subscribe({
      next: (data) => {
        this.payslip.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.payslip.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load payslip.'));
        this.loading.set(false);
      }
    });
  }
}
