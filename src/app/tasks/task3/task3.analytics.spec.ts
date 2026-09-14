import {summarizeValuations, validateValuationHistory} from './task3.analytics';
import {ValuationPoint} from './task3.models';

describe('Valuation analytics', () => {
  it('calculates appreciation and CAGR from the acquisition baseline', () => {
    const summary = summarizeValuations([
      {year: 2020, value: 100},
      {year: 2022, value: 121},
    ]);
    expect(summary.acquisitionValue).toBe(100);
    expect(summary.current).toBe(121);
    expect(summary.gain).toBe(21);
    expect(summary.growth).toBeCloseTo(0.21);
    expect(summary.cagr).toBeCloseTo(0.1);
    expect(summary.years).toBe(2);
    expect(summary.startYear).toBe(2020);
    expect(summary.endYear).toBe(2022);
  });

  it('calculates an overall decline', () => {
    const summary = summarizeValuations([
      {year: 2020, value: 100},
      {year: 2022, value: 81},
    ]);
    expect(summary.gain).toBe(-19);
    expect(summary.growth).toBeCloseTo(-0.19);
    expect(summary.cagr).toBeCloseTo(-0.1);
  });

  it('reports zero growth for a flat positive history', () => {
    const summary = summarizeValuations([
      {year: 2020, value: 100},
      {year: 2026, value: 100},
    ]);
    expect(summary.gain).toBe(0);
    expect(summary.growth).toBe(0);
    expect(summary.cagr).toBe(0);
  });

  it('uses elapsed years rather than the number of observations', () => {
    const summary = summarizeValuations([
      {year: 2020, value: 100},
      {year: 2021, value: 110},
      {year: 2024, value: 146.41},
    ]);
    expect(summary.years).toBe(4);
    expect(summary.cagr).toBeCloseTo(0.1);
  });

  it('deliberately reports zero observed growth for a single baseline', () => {
    const summary = summarizeValuations([{year: 2020, value: 100}]);
    expect(summary.current).toBe(summary.acquisitionValue);
    expect(summary.years).toBe(0);
    expect(summary.growth).toBe(0);
    expect(summary.cagr).toBe(0);
  });

  const invalidHistories: readonly {
    name: string;
    history: readonly ValuationPoint[];
    message: RegExp;
  }[] = [
    {name: 'empty history', history: [], message: /baseline/},
    {
      name: 'duplicate years',
      history: [
        {year: 2020, value: 100},
        {year: 2020, value: 120},
      ],
      message: /strictly increasing/,
    },
    {
      name: 'descending years',
      history: [
        {year: 2021, value: 100},
        {year: 2020, value: 120},
      ],
      message: /strictly increasing/,
    },
    ...[0, -1, NaN, Infinity].map((value) => ({
      name: `invalid value ${value}`,
      history: [{year: 2020, value}],
      message: /finite positive/,
    })),
    ...[2020.5, NaN, Infinity].map((year) => ({
      name: `invalid year ${year}`,
      history: [{year, value: 100}],
      message: /integer years/,
    })),
  ];

  for (const {name, history, message} of invalidHistories) {
    it(`rejects ${name}`, () => {
      expect(() => validateValuationHistory(history)).toThrowError(message);
    });
  }
});
