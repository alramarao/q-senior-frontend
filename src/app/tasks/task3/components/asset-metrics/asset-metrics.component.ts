import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Asset, ValuationSummary} from '../../task3.models';
import {DashboardCardComponent} from '../dashboard-card/dashboard-card.component';

@Component({
  selector: 'app-asset-metrics',
  standalone: true,
  imports: [MatIconModule, CommonModule, DashboardCardComponent],
  templateUrl: './asset-metrics.component.html',
  styleUrl: './asset-metrics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetMetricsComponent {
  @Input({required: true}) asset!: Asset;
  @Input({required: true}) summary!: ValuationSummary;
}
