import {TestBed} from '@angular/core/testing';
import {PerformanceAnalyticsComponent} from './performance-analytics.component';
import {summarizeValuations} from '../../task3.analytics';
import {createValuationChart} from '../../task3.chart';
import {ValuationHistory} from '../../task3.models';

describe('PerformanceAnalyticsComponent', () => {
  it('updates the summary and accessible chart together when its input changes', async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceAnalyticsComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(PerformanceAnalyticsComponent);
    const setHistory = (history: ValuationHistory) => {
      fixture.componentRef.setInput('analytics', {
        summary: summarizeValuations(history),
        chart: createValuationChart(history),
      });
      fixture.detectChanges();
    };
    setHistory([{year: 2020, value: 100}]);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('circle').length).toBe(1);
    setHistory([
      {year: 2020, value: 100},
      {year: 2022, value: 150},
    ]);
    expect(root.querySelectorAll('circle').length).toBe(2);
    expect(root.querySelector('desc')?.textContent).toContain('€150');
    expect(root.querySelector('.trend-summary')?.textContent).toContain('€150');
  });
});
