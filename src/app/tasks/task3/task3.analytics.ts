import {ValuationHistory, ValuationPoint, ValuationSummary} from './task3.models';

/** Fail fast for invalid developer data rather than rendering misleading valuations. */
export function validateValuationHistory(
  history: readonly ValuationPoint[],
): asserts history is ValuationHistory {
  if (history.length === 0) {
    throw new Error('Valuation history must contain an acquisition baseline.');
  }

  history.forEach((point, index) => {
    if (!Number.isInteger(point.year) || !Number.isFinite(point.value) || point.value <= 0) {
      throw new Error('Valuations require integer years and finite positive values.');
    }
    if (index > 0 && point.year <= history[index - 1].year) {
      throw new Error('Valuation years must be strictly increasing.');
    }
  });
}

export function summarizeValuations(history: ValuationHistory): ValuationSummary {
  validateValuationHistory(history);
  const first = history[0];
  const last = history[history.length - 1];
  const years = last.year - first.year;
  const valueRatio = last.value / first.value;

  return {
    acquisitionValue: first.value,
    current: last.value,
    gain: last.value - first.value,
    growth: valueRatio - 1,
    // A baseline alone has no observed growth; display zero until a later appraisal exists.
    cagr: years === 0 ? 0 : Math.pow(valueRatio, 1 / years) - 1,
    years,
    startYear: first.year,
    endYear: last.year,
  };
}
