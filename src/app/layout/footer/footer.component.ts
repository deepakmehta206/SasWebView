import { Component } from '@angular/core';
import { APP_NAME } from '../../core/constants/app.constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly appName = APP_NAME;
  readonly year = new Date().getFullYear();
}
