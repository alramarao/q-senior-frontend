import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Transaction} from '../../task3.models';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryComponent {
  @Input({required: true}) transactions: readonly Transaction[] = [];
}
