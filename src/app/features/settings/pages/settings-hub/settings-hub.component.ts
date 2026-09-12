import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

interface SettingsLink {
  title: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-settings-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './settings-hub.component.html',
  styleUrl: './settings-hub.component.scss'
})
export class SettingsHubComponent {
  readonly links: SettingsLink[] = [
    {
      title: 'Tenant profile',
      description: 'View and edit tenant details and status.',
      route: '/settings/tenant'
    },
    {
      title: 'Branches',
      description: 'List, create, and manage branches.',
      route: '/settings/branches'
    },
    {
      title: 'Tenant settings',
      description: 'Simple key/value settings for the tenant.',
      route: '/settings/tenant-settings'
    },
    {
      title: 'Tenant modules',
      description: 'Enable or disable product modules for this tenant.',
      route: '/settings/modules'
    },
    {
      title: 'Tenant features',
      description: 'Enable or disable features within modules.',
      route: '/settings/features'
    }
  ];
}
