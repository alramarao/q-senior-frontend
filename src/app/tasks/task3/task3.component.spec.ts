import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TRANSACTIONS} from './task3.data';
import {Task3Component} from './task3.component';

describe('Task3Component', () => {
  let fixture: ComponentFixture<Task3Component>;
  let root: HTMLElement;
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [Task3Component]}).compileComponents();
    fixture = TestBed.createComponent(Task3Component);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });
  it('presents the collectible identity, current value and accessible local artwork', () => {
    expect(root.querySelector('h1')?.textContent).toBe('Undergrowth');
    expect(root.textContent).toContain('Camille Roche');
    expect(root.querySelector('[data-testid="current-value"]')?.textContent).toContain('€185,000');
    const image = root.querySelector('img')!;
    expect(image.getAttribute('src')).toBe('Camille_Roche.webp');
    expect(image.alt).toContain('Undergrowth');
    expect(image.alt).toContain('black and gold frame');
  });
  it('composes five metric cards and the required sections, with transactions last', () => {
    expect(root.querySelectorAll('app-asset-metrics app-dashboard-card').length).toBe(5);
    for (const section of ['app-asset-details', 'app-performance-analytics', 'app-transaction-history']) {
      expect(root.querySelector(`app-dashboard-card ${section}`)).not.toBeNull();
    }
    expect(Array.from(root.querySelectorAll('h2')).map((x) => x.textContent?.trim())).toEqual([
      'Asset Details',
      'Value Appreciation History',
      'Comparable Transaction History',
    ]);
    expect(root.querySelector('main')?.lastElementChild?.querySelector('app-transaction-history')).not.toBeNull();
    expect(root.querySelector('.period')?.querySelector('button, a, [tabindex]')).toBeNull();
    expect(root.querySelector('app-asset-metrics')?.textContent).toContain('+€54,500');
    expect(root.querySelector('app-asset-metrics')?.textContent).toContain('41.8%');
  });
  it('renders semantic metadata including acquisition, frame and authentication', () => {
    const details = root.querySelector('app-asset-details dl')!;
    for (const value of [
      '12 Mar 2020',
      '€130,500',
      '48 × 64 cm',
      '65 × 81 cm',
      'CR-2020-014',
      'Excellent',
      'reverse',
    ]) {
      expect(details.textContent).toContain(value);
    }
    details.querySelectorAll('dd').forEach((x) => expect(x.textContent?.trim()).toBeTruthy());
  });
  it('renders comparable transactions with dates, values, venues and table semantics', () => {
    expect(root.querySelector('caption')?.textContent).toContain(
      'not transactions of this artwork',
    );
    expect(root.querySelectorAll('thead th[scope="col"]').length).toBe(5);
    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(TRANSACTIONS.length);
    expect(rows[0].textContent).toContain('10 Nov 2024');
    expect(rows[0].textContent).toContain('€210,000');
    rows.forEach((row, i) => {
      expect(row.querySelector('th[scope="row"]')).not.toBeNull();
      expect(row.textContent).toContain(TRANSACTIONS[i].work);
      expect(row.textContent).toContain(TRANSACTIONS[i].venue);
      const cells = row.querySelectorAll('td');
      expect(cells[0].textContent?.trim()).toBeTruthy();
      expect(cells[2].textContent).toContain('€');
    });
  });
  it('describes the chart accessibly and matches its final point to the hero value', () => {
    const chart = root.querySelector('svg[role="img"]')!;
    const labels = chart
      .getAttribute('aria-labelledby')!
      .split(' ')
      .map((id) => root.querySelector('#' + id)?.textContent);
    expect(labels[0]).toContain('Estimated value over time');
    expect(labels[1]).toContain('€130,500');
    expect(labels[1]).toContain('2026');
    const points = chart.querySelectorAll('circle title');
    expect(points.length).toBe(7);
    const current = root.querySelector('[data-testid="current-value"]')!.textContent!.trim();
    expect(points[points.length - 1].textContent).toContain(current);
    expect(root.querySelector('.trend-summary')?.textContent).toContain(current);
  });
});
