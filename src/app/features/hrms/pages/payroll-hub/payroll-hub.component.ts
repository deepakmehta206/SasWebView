import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-payroll-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './payroll-hub.component.html',
  styleUrl: './payroll-hub.component.scss'
})
export class PayrollHubComponent {
  readonly links = [
  {
    "title": "Payroll runs",
    "description": "Create, process, approve, and lock runs.",
    "route": "/hrms/payroll/runs"
  },
  {
    "title": "Payslips",
    "description": "View generated payslips.",
    "route": "/hrms/payroll/payslips"
  }
] as const;
}
