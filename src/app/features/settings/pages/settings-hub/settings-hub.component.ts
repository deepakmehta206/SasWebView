import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';

interface SettingsLink {
  title: string;
  description: string;
  route: string;
  anyPermissions?: readonly string[];
}

@Component({
  selector: 'app-settings-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './settings-hub.component.html',
  styleUrl: './settings-hub.component.scss'
})
export class SettingsHubComponent {
  private readonly permissions = inject(PermissionService);

  private readonly allLinks: SettingsLink[] = [
    {
      title: 'Tenant profile',
      description: 'View and edit tenant details and status.',
      route: '/settings/tenant',
      anyPermissions: [PermissionCodes.TenantView]
    },
    {
      title: 'Branches',
      description: 'List, create, and manage branches.',
      route: '/settings/branches',
      anyPermissions: [PermissionCodes.TenantView, PermissionCodes.SettingsView]
    },
    {
      title: 'Tenant settings',
      description: 'Simple key/value settings for the tenant.',
      route: '/settings/tenant-settings',
      anyPermissions: [PermissionCodes.SettingsView, PermissionCodes.SettingsEdit]
    },
    {
      title: 'Tenant modules',
      description: 'Enable or disable product modules for the tenant.',
      route: '/settings/modules',
      anyPermissions: [PermissionCodes.ModuleView, PermissionCodes.TenantModuleEdit]
    },
    {
      title: 'Tenant features',
      description: 'Enable or disable features within modules.',
      route: '/settings/features',
      anyPermissions: [PermissionCodes.FeatureView, PermissionCodes.TenantFeatureEdit]
    },
    {
      title: 'Notification templates',
      description: 'View and manage in-app, email, SMS, and WhatsApp message templates.',
      route: '/settings/notification-templates',
      anyPermissions: [PermissionCodes.NotificationTemplateView]
    },
    {
      title: 'Files',
      description: 'Upload, download, and soft-delete tenant files.',
      route: '/settings/files',
      anyPermissions: [PermissionCodes.FileView]
    }
  ];

  get links(): SettingsLink[] {
    return this.allLinks.filter((link) => {
      if (!link.anyPermissions?.length) {
        return true;
      }
      return this.permissions.hasAnyPermission(link.anyPermissions);
    });
  }
}
