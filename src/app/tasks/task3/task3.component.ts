import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DashboardCardComponent} from './components/dashboard-card/dashboard-card.component';
import {ASSET, HISTORY, TRANSACTIONS} from './task3.data';
import {createValuationChart, ValuationAnalytics} from './task3.chart';
import {summarizeValuations} from './task3.analytics';
import {AssetHeaderComponent} from './components/asset-header/asset-header.component';
import {AssetMetricsComponent} from './components/asset-metrics/asset-metrics.component';
import {AssetDetailsComponent} from './components/asset-details/asset-details.component';
import {PerformanceAnalyticsComponent} from './components/performance-analytics/performance-analytics.component';
import {TransactionHistoryComponent} from './components/transaction-history/transaction-history.component';
@Component({
  selector: 'app-task3',
  standalone: true,
  imports: [
    DashboardCardComponent,
    AssetHeaderComponent,
    AssetMetricsComponent,
    AssetDetailsComponent,
    PerformanceAnalyticsComponent,
    TransactionHistoryComponent,
  ],
  templateUrl: './task3.component.html',
  styleUrl: './task3.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Task3Component {
  readonly asset = ASSET;
  readonly transactions = TRANSACTIONS;
  readonly analytics: ValuationAnalytics = {
    summary: summarizeValuations(HISTORY),
    chart: createValuationChart(HISTORY),
  };
  readonly summary = this.analytics.summary;
}
