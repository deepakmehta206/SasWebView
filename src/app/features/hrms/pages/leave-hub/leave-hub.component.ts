import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-leave-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './leave-hub.component.html',
  styleUrl: './leave-hub.component.scss'
})
export class LeaveHubComponent {
  readonly links = [
  {
    "title": "Leave types",
    "description": "Configure leave categories.",
    "route": "/hrms/leave/types"
  },
  {
    "title": "Leave policies",
    "description": "Accrual and applicability rules.",
    "route": "/hrms/leave/policies"
  },
  {
    "title": "Leave requests",
    "description": "Apply and track leave requests.",
    "route": "/hrms/leave/requests"
  }
] as const;
}
