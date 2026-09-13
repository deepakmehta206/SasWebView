import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { MASTER_DEFINITIONS } from '../../models/master.definitions';

@Component({
  selector: 'app-masters-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './masters-hub.component.html',
  styleUrl: './masters-hub.component.scss'
})
export class MastersHubComponent {
  readonly links = Object.values(MASTER_DEFINITIONS).map((def) => ({
    title: def.title,
    description:
      def.scope === 'global'
        ? 'System/global master data.'
        : 'Tenant-specific master data for this workspace.',
    route: `/masters/${def.key}`
  }));
}
