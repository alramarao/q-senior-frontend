import {ChangeDetectionStrategy, Component} from '@angular/core';
@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {}
