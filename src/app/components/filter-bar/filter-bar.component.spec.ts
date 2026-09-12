import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { FilterBarComponent } from './filter-bar.component';

interface ProductFilter { search?: string; categories?: string[]; available?: boolean }

describe('FilterBarComponent with a non-securities interface', () => {
  let fixture: ComponentFixture<FilterBarComponent<ProductFilter>>;
  let emit: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterBarComponent], providers: [provideNoopAnimations()] }).compileComponents();
    fixture = TestBed.createComponent(FilterBarComponent<ProductFilter>);
    fixture.componentRef.setInput('fields', [
      { key: 'search', kind: 'text', label: 'Search products' },
      { key: 'categories', kind: 'multi-select', label: 'Categories', options: [{ value: 'book', label: 'Books' }, { value: 'game', label: 'Games' }, { value: 'music', label: 'Music' }] },
      { key: 'available', kind: 'boolean', label: 'Availability' },
    ]);
    emit = spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.detectChanges();
  });

  it('renders configured labels and debounces trimmed text', fakeAsync(() => {
    expect(fixture.nativeElement.textContent).toContain('Search products');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = ' book ';
    input.dispatchEvent(new Event('input'));
    tick(299);
    expect(emit).not.toHaveBeenCalled();
    tick(1);
    expect(emit).toHaveBeenCalledOnceWith({ search: 'book' });
    input.value = '';
    input.dispatchEvent(new Event('input'));
    tick(300);
    expect(emit).toHaveBeenCalledWith({});
  }));

  it('applies pending text immediately with a selection and suppresses duplicates', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = ' book ';
    input.dispatchEvent(new Event('input'));
    tick(100);
    const select = fixture.debugElement.query(By.directive(MatSelect));
    select.componentInstance.value = ['book'];
    select.componentInstance.ngControl.control.setValue(['book']);
    select.componentInstance.selectionChange.emit({ value: ['book'] });
    expect(emit).toHaveBeenCalledOnceWith({ search: 'book', categories: ['book'] });
    tick(300);
    input.value = 'book';
    input.dispatchEvent(new Event('input'));
    tick(300);
    expect(emit).toHaveBeenCalledTimes(1);
  }));

  it('emits multiple selections immediately and omits cleared arrays', async () => {
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness.with({ selector: '[multiple]' }));
    await select.open();
    await select.clickOptions({ text: /Books|Games/ });
    expect(emit).toHaveBeenCalledWith({ categories: ['book', 'game'] });
    await select.clickOptions({ text: /Books|Games/ });
    expect(emit.calls.mostRecent().args[0]).toEqual({});
  });

  it('shows the first configured selected label and additional count, then clears', async () => {
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness.with({ selector: '[multiple]' }));
    expect(await select.isEmpty()).toBeTrue();
    expect(await select.getValueText()).toBe('');

    await select.open();
    await select.clickOptions({ text: 'Music' });
    expect(await select.getValueText()).toBe('Music');
    await select.clickOptions({ text: 'Games' });
    expect(await select.getValueText()).toBe('Games + 1');
    await select.clickOptions({ text: 'Books' });
    expect(await select.getValueText()).toBe('Books + 2');
    expect(emit.calls.mostRecent().args[0]).toEqual({ categories: ['book', 'game', 'music'] });

    await select.clickOptions({ text: 'Books' });
    expect(await select.getValueText()).toBe('Games + 1');
    await select.close();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(await select.isEmpty()).toBeTrue();
    expect(await select.getValueText()).toBe('');
    expect(emit.calls.mostRecent().args[0]).toEqual({});
  });

  it('distinguishes true, false, and All', async () => {
    const selects = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(MatSelectHarness);
    const select = selects[1];
    for (const [label, expected] of [['Yes', { available: true }], ['No', { available: false }], ['All', {}]] as const) {
      await select.open();
      await select.clickOptions({ text: label });
      expect(emit.calls.mostRecent().args[0]).toEqual(expected);
    }
  });

  it('clears selections and privacy together', async () => {
    const selects = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(MatSelectHarness);
    await selects[0].open();
    await selects[0].clickOptions({ text: 'Books' });
    await selects[0].close();
    await selects[1].open();
    await selects[1].clickOptions({ text: 'No' });
    expect(emit.calls.mostRecent().args[0]).toEqual({ categories: ['book'], available: false });
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(emit.calls.mostRecent().args[0]).toEqual({});
    expect(await selects[0].isEmpty()).toBeTrue();
    expect(await selects[1].isEmpty()).toBeTrue();
  });

  it('clears controls and cancels pending text emissions', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'pending';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('button').click();
    tick(300);
    expect(input.value).toBe('');
    expect(emit).toHaveBeenCalledOnceWith({});
  }));
});
