import fs from 'fs';
import path from 'path';

const root = path.resolve('src/app/features/hrms');

function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('wrote', rel);
}

const hubScss = `.hub { display:flex; flex-direction:column; gap:1.25rem; }
.hub__grid { display:grid; gap:1rem; }
.hub__link { text-decoration:none; color:inherit; border-radius:var(--radius-md); }
.hub__link p { margin:0; color:var(--color-text-muted); }
@media (min-width:800px){ .hub__grid { grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); } }
`;

const pageScss = `.page { display:flex; flex-direction:column; gap:1rem; }
.form-actions { display:flex; flex-wrap:wrap; gap:0.75rem; }
.filters { display:grid; gap:0.85rem; align-items:end; }
@media (min-width:700px){ .filters { grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); } }
`;

function hub(name, selector, title, subtitle, links) {
  write(`pages/${name}/${name}.component.scss`, hubScss);
  write(
    `pages/${name}/${name}.component.ts`,
    `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './${name}.component.html',
  styleUrl: './${name}.component.scss'
})
export class ${toPascal(name)}Component {
  readonly links = ${JSON.stringify(links, null, 2)} as const;
}
`
  );
  write(
    `pages/${name}/${name}.component.html`,
    `<section class="hub">
  <app-page-header title="${title}" subtitle="${subtitle}" />
  <div class="hub__grid">
    @for (link of links; track link.route) {
      <a class="hub__link" [routerLink]="link.route">
        <app-ui-card [title]="link.title"><p>{{ link.description }}</p></app-ui-card>
      </a>
    }
  </div>
</section>
`
  );
}

function toPascal(name) {
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

hub('hrms-hub', 'app-hrms-hub', 'HRMS', 'Core human resources module. Industry-specific roles come later.', [
  { title: 'Employees', description: 'Employee records and employment data.', route: '/hrms/employees' },
  { title: 'Departments', description: 'Reusable org departments.', route: '/hrms/departments' },
  { title: 'Designations', description: 'Reusable designations.', route: '/hrms/designations' },
  { title: 'Employee types', description: 'Employment type masters.', route: '/hrms/employee-types' },
  { title: 'Shifts', description: 'Work shift definitions.', route: '/hrms/shifts' },
  { title: 'Holidays', description: 'Holiday calendar.', route: '/hrms/holidays' },
  { title: 'Attendance', description: 'Attendance records and summary.', route: '/hrms/attendance' },
  { title: 'Overtime', description: 'Overtime requests and approval.', route: '/hrms/overtime' },
  { title: 'Leave', description: 'Leave types, policies, and requests.', route: '/hrms/leave' },
  { title: 'Salary', description: 'Components, structures, and assignments.', route: '/hrms/salary' },
  { title: 'Payroll', description: 'Payroll runs and payslips.', route: '/hrms/payroll' }
]);

hub('leave-hub', 'app-leave-hub', 'Leave', 'Leave types, policies, and requests.', [
  { title: 'Leave types', description: 'Configure leave categories.', route: '/hrms/leave/types' },
  { title: 'Leave policies', description: 'Accrual and applicability rules.', route: '/hrms/leave/policies' },
  { title: 'Leave requests', description: 'Apply and track leave requests.', route: '/hrms/leave/requests' }
]);

hub('salary-hub', 'app-salary-hub', 'Salary', 'Salary configuration for the tenant.', [
  { title: 'Salary components', description: 'Earnings and deductions.', route: '/hrms/salary/components' },
  { title: 'Salary structures', description: 'Structure and component mapping.', route: '/hrms/salary/structures' },
  { title: 'Employee salaries', description: 'Assign structures to employees.', route: '/hrms/salary/employee-salaries' }
]);

hub('payroll-hub', 'app-payroll-hub', 'Payroll', 'Payroll runs and payslips. Backend calculations are authoritative.', [
  { title: 'Payroll runs', description: 'Create, process, approve, and lock runs.', route: '/hrms/payroll/runs' },
  { title: 'Payslips', description: 'View generated payslips.', route: '/hrms/payroll/payslips' }
]);

write('pages/_shared.scss', pageScss);
console.log('done hubs');
