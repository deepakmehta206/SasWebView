import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';

@Component({
  selector: 'app-subscription-subnav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HasPermissionDirective],
  templateUrl: './subscription-subnav.component.html',
  styleUrl: './subscription-subnav.component.scss'
})
export class SubscriptionSubnavComponent {
  readonly permissionCodes = PermissionCodes;
}
