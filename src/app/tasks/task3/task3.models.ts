export interface ValuationPoint {
  readonly year: number;
  readonly value: number;
}

/** The first point is the acquisition baseline; subsequent years strictly increase. */
export type ValuationHistory = readonly [ValuationPoint, ...ValuationPoint[]];

export interface Transaction {
  readonly id: string;
  readonly work: string;
  readonly date: string;
  readonly event: string;
  readonly value: number;
  readonly venue: string;
}

export interface AssetDetail {
  readonly label: string;
  readonly value: string;
}

/** Asset information and display-ready descriptive metadata for this dashboard. */
export interface Asset {
  readonly title: string;
  readonly artist: string;
  readonly category: string;
  readonly period: string;
  readonly medium: string;
  readonly image: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly imageAlt: string;
  readonly acquired: string;
  readonly condition: string;
  readonly details: readonly AssetDetail[];
}

export interface ValuationSummary {
  readonly acquisitionValue: number;
  readonly current: number;
  readonly gain: number;
  readonly growth: number;
  readonly cagr: number;
  readonly years: number;
  readonly startYear: number;
  readonly endYear: number;
}
