import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-hrms-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './hrms-hub.component.html',
  styleUrl: './hrms-hub.component.scss'
})
export class HrmsHubComponent {
  readonly links = [
  {
    "title": "Employees",
    "description": "Employee records and employment data.",
    "route": "/hrms/employees"
  },
  {
    "title": "Departments",
    "description": "Reusable org departments.",
    "route": "/hrms/departments"
  },
  {
    "title": "Designations",
    "description": "Reusable designations.",
    "route": "/hrms/designations"
  },
  {
    "title": "Employee types",
    "description": "Employment type masters.",
    "route": "/hrms/employee-types"
  },
  {
    "title": "Shifts",
    "description": "Work shift definitions.",
    "route": "/hrms/shifts"
  },
  {
    "title": "Holidays",
    "description": "Holiday calendar.",
    "route": "/hrms/holidays"
  },
  {
    "title": "Attendance",
    "description": "Attendance records and summary.",
    "route": "/hrms/attendance"
  },
  {
    "title": "Overtime",
    "description": "Overtime requests and approval.",
    "route": "/hrms/overtime"
  },
  {
    "title": "Leave",
    "description": "Leave types, policies, and requests.",
    "route": "/hrms/leave"
  },
  {
    "title": "Salary",
    "description": "Components, structures, and assignments.",
    "route": "/hrms/salary"
  },
  {
    "title": "Payroll",
    "description": "Payroll runs and payslips.",
    "route": "/hrms/payroll"
  }
] as const;
}
