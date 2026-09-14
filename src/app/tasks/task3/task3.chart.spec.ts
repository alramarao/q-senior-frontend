import {createValuationChart, VALUATION_CHART_LAYOUT} from './task3.chart';
import {HISTORY} from './task3.data';

describe('Valuation chart', () => {
  it('preserves the observed decline and places irregular years proportionally', () => {
    const chart = createValuationChart(HISTORY);
    expect(chart.points.length).toBe(HISTORY.length);
    expect(chart.points[3].y).toBeGreaterThan(chart.points[2].y);
    const irregular = createValuationChart([
      {year: 2020, value: 100},
      {year: 2021, value: 110},
      {year: 2024, value: 150},
    ]);
    const [first, middle, last] = irregular.points;
    expect((middle.x - first.x) / (last.x - first.x)).toBeCloseTo(0.25);
  });

  for (const value of [0.01, 100, 1_000_000_000]) {
    it(`encloses a value range starting at ${value} with finite ascending ticks`, () => {
      const chart = createValuationChart([
        {year: 2020, value},
        {year: 2026, value: value * 1.5},
      ]);
      expect(chart.ticks[0].value).toBeLessThanOrEqual(value);
      expect(chart.ticks[chart.ticks.length - 1].value).toBeGreaterThanOrEqual(value * 1.5);
      chart.ticks.forEach((tick, index) => {
        expect(Number.isFinite(tick.y)).toBeTrue();
        if (index > 0) expect(tick.value).toBeGreaterThan(chart.ticks[index - 1].value);
      });
      chart.points.forEach((point) => {
        expect(Number.isFinite(point.x)).toBeTrue();
        expect(point.y).toBeGreaterThanOrEqual(chart.bounds.top);
        expect(point.y).toBeLessThanOrEqual(chart.bounds.bottom);
      });
    });
  }

  it('gives a flat history a usable scale', () => {
    const chart = createValuationChart([
      {year: 2020, value: 100},
      {year: 2026, value: 100},
    ]);
    expect(chart.points[0].y).toBe(chart.points[1].y);
    expect(Number.isFinite(chart.points[0].y)).toBeTrue();
    expect(chart.ticks.length).toBeGreaterThan(1);
  });

  it('renders a single baseline with finite geometry', () => {
    const chart = createValuationChart([{year: 2020, value: 100}]);
    expect(chart.points.length).toBe(1);
    expect(Number.isFinite(chart.points[0].x)).toBeTrue();
    expect(Number.isFinite(chart.points[0].y)).toBeTrue();
  });

  it('derives all geometry from the supplied layout', () => {
    const layout = {
      ...VALUATION_CHART_LAYOUT,
      width: 900,
      height: 400,
      margin: {left: 70, right: 60, top: 40, bottom: 50},
    };
    const chart = createValuationChart(HISTORY, layout);
    expect(chart.viewBox).toBe(`0 0 ${layout.width} ${layout.height}`);
    expect(chart.bounds.right).toBe(layout.width - layout.margin.right);
    expect(chart.bounds.bottom).toBe(layout.height - layout.margin.bottom);
    expect(chart.points[0].x).toBe(chart.bounds.left);
    expect(chart.points[chart.points.length - 1].x).toBe(chart.bounds.right);
    expect(chart.tickLabelX).toBe(chart.bounds.left - layout.tickLabelGap);
    expect(chart.yearLabelY).toBe(chart.bounds.bottom + layout.yearLabelGap);
    const areaCoordinates = chart.area.split(' ').map((pair) => pair.split(',').map(Number));
    expect(areaCoordinates[0][1]).toBe(chart.bounds.bottom);
    expect(areaCoordinates[areaCoordinates.length - 1][1]).toBe(chart.bounds.bottom);
    chart.ticks.forEach((tick) =>
      expect(tick.labelY - tick.y).toBeCloseTo(layout.tickBaselineOffset),
    );
  });

  it('rejects unsupported input at the chart boundary', () => {
    expect(() => createValuationChart([{year: 2020, value: 0}])).toThrowError(/finite positive/);
  });
});
