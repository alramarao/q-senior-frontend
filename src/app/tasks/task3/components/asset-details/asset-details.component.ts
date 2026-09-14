import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Asset} from '../../task3.models';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailsComponent {
  @Input({required: true}) asset!: Asset;
  @Input({required: true}) acquisition!: number;
}
