import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Asset, ValuationSummary} from '../../task3.models';

@Component({
  selector: 'app-asset-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-header.component.html',
  styleUrl: './asset-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetHeaderComponent {
  @Input({required: true}) asset!: Asset;
  @Input({required: true}) summary!: ValuationSummary;
}
