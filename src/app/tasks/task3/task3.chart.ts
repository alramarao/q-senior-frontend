import {validateValuationHistory} from './task3.analytics';
import {ValuationHistory, ValuationPoint, ValuationSummary} from './task3.models';

export interface ChartLayout {
  readonly width: number;
  readonly height: number;
  readonly margin: {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
  };
  readonly valueLabelGap: number;
  readonly yearLabelGap: number;
  readonly tickLabelGap: number;
  readonly tickBaselineOffset: number;
}

export const VALUATION_CHART_LAYOUT: ChartLayout = {
  width: 610,
  height: 265,
  margin: {left: 58, right: 50, top: 35, bottom: 40},
  valueLabelGap: 14,
  yearLabelGap: 27,
  tickLabelGap: 10,
  tickBaselineOffset: 4,
};

interface ChartPoint extends ValuationPoint {
  readonly x: number;
  readonly y: number;
  readonly labelY: number;
}

interface ChartTick {
  readonly value: number;
  readonly y: number;
  readonly labelY: number;
}

export interface ValuationChart {
  readonly viewBox: string;
  readonly bounds: {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
  };
  readonly tickLabelX: number;
  readonly yearLabelY: number;
  readonly points: readonly ChartPoint[];
  readonly ticks: readonly ChartTick[];
  readonly min: number;
  readonly line: string;
  readonly area: string;
}

export interface ValuationAnalytics {
  readonly summary: ValuationSummary;
  readonly chart: ValuationChart;
}

function createValueScale(history: ValuationHistory) {
  const values = history.map((point) => point.value);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  // Aim for a few readable intervals; padding also gives flat histories a usable scale.
  const targetIntervals = 3;
  const minimumRangeRatio = 0.1;
  const rawStep = Math.max(highest - lowest, highest * minimumRangeRatio, 1) / targetIntervals;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const min = Math.floor(lowest / step) * step;
  const max = Math.max(min + step, Math.ceil(highest / step) * step);
  return {min, max, step};
}

export function createValuationChart(
  history: ValuationHistory,
  layout: ChartLayout = VALUATION_CHART_LAYOUT,
): ValuationChart {
  validateValuationHistory(history);
  const bounds = {
    left: layout.margin.left,
    right: layout.width - layout.margin.right,
    top: layout.margin.top,
    bottom: layout.height - layout.margin.bottom,
  };
  const scale = createValueScale(history);
  const first = history[0];
  const last = history[history.length - 1];
  const yearSpan = last.year - first.year;
  const scaleY = (value: number) =>
    bounds.bottom - ((value - scale.min) / (scale.max - scale.min)) * (bounds.bottom - bounds.top);

  const points = history.map((point) => {
    const y = scaleY(point.value);
    return {
      ...point,
      x:
        bounds.left +
        (yearSpan === 0 ? 0 : (point.year - first.year) / yearSpan) * (bounds.right - bounds.left),
      y,
      labelY: y - layout.valueLabelGap,
    };
  });
  const ticks = Array.from(
    {length: Math.round((scale.max - scale.min) / scale.step) + 1},
    (_, index) => {
      const value = scale.min + index * scale.step;
      const y = scaleY(value);
      return {value, y, labelY: y + layout.tickBaselineOffset};
    },
  );
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');

  return {
    viewBox: `0 0 ${layout.width} ${layout.height}`,
    bounds,
    tickLabelX: bounds.left - layout.tickLabelGap,
    yearLabelY: bounds.bottom + layout.yearLabelGap,
    points,
    ticks,
    min: scale.min,
    line,
    area: `${points[0].x},${bounds.bottom} ${line} ${points[points.length - 1].x},${bounds.bottom}`,
  };
}
