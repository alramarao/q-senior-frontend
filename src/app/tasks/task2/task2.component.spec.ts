import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Task2Component} from './task2.component';

describe('Task2Component', () => {
  let fixture: ComponentFixture<Task2Component>;
  let component: Task2Component;

  const checkboxes = (): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('input[type="checkbox"]'));
  const button = (label: string): HTMLButtonElement => {
    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    return buttons.find(candidate => candidate.textContent?.trim() === label)!;
  };
  const render = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const expectAllSelected = (): void => {
    expect(component.selectionModel.selected.length).toBe(50000);
    expect(component.rows().every(row => component.selectionModel.isSelected(row.id))).toBeTrue();
    expect(checkboxes().every(checkbox => checkbox.checked)).toBeTrue();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Task2Component],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(Task2Component);
    component = fixture.componentInstance;
    await render();
  });

  it('starts with 50,000 unselected rows and available bulk actions', async () => {
    expect(component.rows().length).toBe(50000);
    expect(component.selectionModel.isEmpty()).toBeTrue();
    expect(checkboxes().length).toBeGreaterThan(0);
    expect(checkboxes().length).toBeLessThan(50000);
    expect(checkboxes().every(checkbox => !checkbox.checked)).toBeTrue();
    expect(button('Select all').disabled).toBeFalse();
    expect(button('Deselect all').disabled).toBeFalse();
    button('Deselect all').click();
    await render();
    expect(component.selectionModel.isEmpty()).toBeTrue();
  });

  it('gives each rendered checkbox its row title as an accessible name', () => {
    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.row'));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.querySelector('input')?.getAttribute('aria-label'))
        .toBe(row.querySelector('span')?.textContent?.trim());
    }
  });

  it('handles repeated bulk actions on empty data', async () => {
    component.rows.set([]);
    await render();
    for (let cycle = 0; cycle < 2; cycle++) {
      button('Select all').click();
      await render();
      expect(component.selectionModel.isEmpty()).toBeTrue();
      button('Deselect all').click();
      await render();
      expect(component.selectionModel.isEmpty()).toBeTrue();
    }
    expect(checkboxes().length).toBe(0);
  });

  it('keeps selection tied to stable IDs when recreated rows change position', async () => {
    component.rows.set([{id: 123, title: 'First'}, {id: 456, title: 'Second'}]);
    await render();
    checkboxes()[0].click();
    await render();
    component.rows.set([{id: 456, title: 'Second recreated'}, {id: 123, title: 'First recreated'}]);
    await render();
    expect(component.selectionModel.selected).toEqual([123]);
    expect(checkboxes()[0].checked).toBeFalse();
    expect(checkboxes()[1].checked).toBeTrue();
    checkboxes()[1].click();
    await render();
    expect(component.selectionModel.isEmpty()).toBeTrue();
  });

  it('selects and deselects an individual row through its checkbox using its ID', async () => {
    checkboxes()[0].click();
    await render();
    expect(component.selectionModel.selected).toEqual([component.rows()[0].id]);
    expect(checkboxes()[0].checked).toBeTrue();
    checkboxes()[0].click();
    await render();
    expect(component.selectionModel.isEmpty()).toBeTrue();
    expect(checkboxes()[0].checked).toBeFalse();
  });

  it('selects and clears all 50,000 IDs repeatedly without stale checkbox state', async () => {
    for (let cycle = 0; cycle < 2; cycle++) {
      button('Select all').click();
      await render();
      expectAllSelected();
      button('Select all').click();
      await render();
      expectAllSelected();
      button('Deselect all').click();
      await render();
      expect(component.selectionModel.isEmpty()).toBeTrue();
      expect(checkboxes().every(checkbox => !checkbox.checked)).toBeTrue();
    }
  });

  it('preserves partial selection across new row objects and can toggle and clear it', async () => {
    const previousRows = component.rows();
    for (const index of [1, 2, 3]) checkboxes()[index].click();
    await render();
    button('Recreate data').click();
    await render();
    expect(component.rows()).not.toBe(previousRows);
    for (const index of [1, 2, 3]) {
      expect(component.rows()[index]).not.toBe(previousRows[index]);
      expect(component.selectionModel.isSelected(component.rows()[index].id)).toBeTrue();
      expect(checkboxes()[index].checked).toBeTrue();
    }
    expect(component.selectionModel.selected).toEqual([1, 2, 3]);
    expect(checkboxes()[0].checked).toBeFalse();
    checkboxes()[2].click();
    await render();
    expect(component.selectionModel.isSelected(2)).toBeFalse();
    button('Deselect all').click();
    await render();
    expect(component.selectionModel.isEmpty()).toBeTrue();
    expect(checkboxes().every(checkbox => !checkbox.checked)).toBeTrue();
  });

  it('preserves full selection after recreation', async () => {
    button('Select all').click();
    await render();
    const previousRow = component.rows()[0];
    button('Recreate data').click();
    await render();
    expect(component.rows()[0]).not.toBe(previousRow);
    expectAllSelected();
    checkboxes()[0].click();
    await render();
    expect(component.selectionModel.selected.length).toBe(49999);
    expect(component.selectionModel.isSelected(0)).toBeFalse();
  });

  it('preserves empty selection after recreation', async () => {
    button('Recreate data').click();
    await render();
    expect(component.selectionModel.isEmpty()).toBeTrue();
    expect(checkboxes().every(checkbox => !checkbox.checked)).toBeTrue();
  });

  it('renders selected IDs when the virtual viewport moves to another range', async () => {
    button('Select all').click();
    await render();
    const viewport = fixture.debugElement.query(By.directive(CdkVirtualScrollViewport))
      .componentInstance as CdkVirtualScrollViewport;
    viewport.setRenderedRange({start: 1000, end: 1010});
    await render();
    expect(fixture.nativeElement.textContent).toContain('Item 1000');
    expect(checkboxes().length).toBeGreaterThan(0);
    expect(checkboxes().length).toBeLessThan(50000);
    expect(checkboxes().every(checkbox => checkbox.checked)).toBeTrue();
    checkboxes()[0].click();
    await render();
    expect(component.selectionModel.isSelected(1000)).toBeFalse();
  });
});
