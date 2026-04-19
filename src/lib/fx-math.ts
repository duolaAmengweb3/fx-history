import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

export function convert(
  amount: number | string,
  rate: number,
  precision = 4,
): number {
  return new Decimal(amount).times(rate).toDecimalPlaces(precision).toNumber();
}

export function reverseConvert(
  targetAmount: number | string,
  rate: number,
  precision = 4,
): number {
  return new Decimal(targetAmount)
    .dividedBy(rate)
    .toDecimalPlaces(precision)
    .toNumber();
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(average(squaredDiffs));
}

export interface SeriesStats {
  opening: number;
  closing: number;
  average: number;
  min: number;
  max: number;
  stddev: number;
  volatility: number;
  count: number;
}

export function computeStats(series: Record<string, number>): SeriesStats {
  const dates = Object.keys(series).sort();
  const values = dates.map((d) => series[d]);
  if (!values.length) {
    return {
      opening: 0,
      closing: 0,
      average: 0,
      min: 0,
      max: 0,
      stddev: 0,
      volatility: 0,
      count: 0,
    };
  }
  const avg = average(values);
  const sd = stddev(values);
  return {
    opening: values[0],
    closing: values[values.length - 1],
    average: avg,
    min: Math.min(...values),
    max: Math.max(...values),
    stddev: sd,
    volatility: avg === 0 ? 0 : sd / avg,
    count: values.length,
  };
}

export function computePercentile(
  currentRate: number,
  series: Record<string, number>,
): { percentile: number; label: string; tone: "low" | "mid" | "high" } {
  const values = Object.values(series);
  if (!values.length)
    return { percentile: 50, label: "无历史数据", tone: "mid" };
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < currentRate).length;
  const percentile = Math.round((below / sorted.length) * 100);

  let label: string;
  let tone: "low" | "mid" | "high";
  if (percentile >= 80) {
    label = "历史高位";
    tone = "high";
  } else if (percentile >= 60) {
    label = "偏高";
    tone = "high";
  } else if (percentile >= 40) {
    label = "中位";
    tone = "mid";
  } else if (percentile >= 20) {
    label = "偏低";
    tone = "low";
  } else {
    label = "历史低位";
    tone = "low";
  }
  return { percentile, label, tone };
}

export function extractSingleCurrencySeries(
  timeSeries: Record<string, Record<string, number>>,
  currency: string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [date, rates] of Object.entries(timeSeries)) {
    if (rates[currency] !== undefined) {
      out[date] = rates[currency];
    }
  }
  return out;
}
