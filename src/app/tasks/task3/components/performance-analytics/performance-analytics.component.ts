import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ValuationAnalytics} from '../../task3.chart';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './performance-analytics.component.html',
  styleUrl: './performance-analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceAnalyticsComponent {
  @Input({required: true}) analytics!: ValuationAnalytics;
}
