import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Subject, distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';
import { FilterDefinition } from '../../models/filter-definition';

type ControlValue = string | string[] | boolean | null;

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent<T extends object> implements OnChanges {
  @Input({ required: true }) fields: readonly FilterDefinition<T>[] = [];
  @Output() readonly filterChange = new EventEmitter<Partial<T>>();

  protected controls: Record<string, FormControl<ControlValue>> = {};
  private readonly filterChangeSubject = new Subject<boolean>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.filterChangeSubject.pipe(
      // A selection or reset also applies pending text immediately.
      switchMap(shouldDebounce => shouldDebounce ? timer(300) : of(0)),
      map(() => this.filterValue()),
      distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(value => this.filterChange.emit(value));
  }

  ngOnChanges(): void {
    this.controls = Object.fromEntries(this.fields.map(field => [
      field.key, new FormControl<ControlValue>(field.kind === 'multi-select' ? [] : null),
    ]));
  }

  protected onFilterChange(shouldDebounce = false): void {
    this.filterChangeSubject.next(shouldDebounce);
  }

  protected onClear(): void {
    this.fields.forEach(field => this.controls[field.key].setValue(field.kind === 'multi-select' ? [] : null));
    this.onFilterChange();
  }

  protected selectedValueLabel(field: Extract<FilterDefinition<T>, { kind: 'multi-select' }>): string {
    const values = this.controls[field.key].value;
    if (!Array.isArray(values) || values.length === 0) return '';
    // Match Material's default selection order: configured option order, not click order.
    const first = field.options.find(option => values.includes(option.value));
    return `${first?.label ?? ''}${values.length > 1 ? ` + ${values.length - 1}` : ''}`;
  }

  private filterValue(): Partial<T> {
    // Omit cleared criteria, but retain false because it represents an explicit boolean choice.
    const entries = this.fields.map(field => {
      const value = this.controls[field.key].value;
      return [field.key, typeof value === 'string' ? value.trim() : value] as const;
    }).filter(([, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0));
    // Field definitions constrain each key to the value kind rendered by its control.
    return Object.fromEntries(entries) as Partial<T>;
  }
}
