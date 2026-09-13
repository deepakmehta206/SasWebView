import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-salary-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './salary-hub.component.html',
  styleUrl: './salary-hub.component.scss'
})
export class SalaryHubComponent {
  readonly links = [
  {
    "title": "Salary components",
    "description": "Earnings and deductions.",
    "route": "/hrms/salary/components"
  },
  {
    "title": "Salary structures",
    "description": "Structure and component mapping.",
    "route": "/hrms/salary/structures"
  },
  {
    "title": "Employee salaries",
    "description": "Assign structures to employees.",
    "route": "/hrms/salary/employee-salaries"
  }
] as const;
}
