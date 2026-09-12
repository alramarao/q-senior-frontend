import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
} from '@angular/material/table';
import { BehaviorSubject, catchError, defer, map, of, startWith, switchMap } from 'rxjs';
import { SecuritiesFilter } from '../../models/securities-filter';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { FilterDefinition } from '../../models/filter-definition';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { FilterableTableComponent } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';

type Criteria = Omit<SecuritiesFilter, 'skip' | 'limit'>;
interface SecuritiesQuery { criteria: Criteria; skip: number; limit: number }
interface RequestState { rows: Security[]; isLoading: boolean; hasError: boolean; hasNext: boolean }

@Component({
  selector: 'securities-list',
  standalone: true,
  imports: [
    FilterableTableComponent,
    FilterBarComponent,
    MatButtonModule,
    MatSelectModule,
    AsyncPipe,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatNoDataRow,
    MatRowDef,
    MatRow,
  ],
  templateUrl: './securities-list.component.html',
  styleUrl: './securities-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// The list owns domain-specific requests and paging; the filter and table remain generic.
export class SecuritiesListComponent {
  protected readonly displayedColumns = ['name', 'type', 'currency'];
  private readonly securityService = inject(SecurityService);
  protected readonly fields: readonly FilterDefinition<Criteria>[] = [
    { key: 'name', kind: 'text', label: 'Name' },
    { key: 'types', kind: 'multi-select', label: 'Types', options: this.securityService.getTypesOptions().map(value => ({ value, label: value })) },
    { key: 'currencies', kind: 'multi-select', label: 'Currencies', options: this.securityService.getCurrenciesOptions().map(value => ({ value, label: value })) },
    { key: 'isPrivate', kind: 'boolean', label: 'Privacy', trueLabel: 'Private', falseLabel: 'Public' },
  ];
  protected readonly securitiesQuerySubject = new BehaviorSubject<SecuritiesQuery>({ criteria: {}, skip: 0, limit: 10 });
  protected readonly securitiesState$ = this.securitiesQuerySubject.pipe(
    // The API has no total count; one extra row tells us whether Next is available.
    switchMap(({ criteria, skip, limit }) => defer(() => this.securityService.getSecurities({
      ...criteria, skip, limit: limit + 1,
    })).pipe(
      map((rows): RequestState => ({ rows: rows.slice(0, limit), hasNext: rows.length > limit, isLoading: false, hasError: false })),
      // Catch failures per request so later filter changes and retries still work.
      catchError(() => of<RequestState>({ rows: [], hasNext: false, isLoading: false, hasError: true })),
      startWith<RequestState>({ rows: [], hasNext: false, isLoading: true, hasError: false }),
    )),
  );

  protected onFilterChange(criteria: Criteria): void {
    this.securitiesQuerySubject.next({ ...this.securitiesQuerySubject.value, criteria, skip: 0 });
  }

  protected onPageSizeChange(limit: number): void {
    this.securitiesQuerySubject.next({ ...this.securitiesQuerySubject.value, limit, skip: 0 });
  }

  protected onPageChange(direction: number): void {
    const currentQuery = this.securitiesQuerySubject.value;
    // Clamp backward navigation at the first page to prevent a negative offset.
    this.securitiesQuerySubject.next({ ...currentQuery, skip: Math.max(0, currentQuery.skip + direction * currentQuery.limit) });
  }

  protected onRetry(): void {
    this.securitiesQuerySubject.next(this.securitiesQuerySubject.value);
  }
}
