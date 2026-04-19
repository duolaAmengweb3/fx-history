import { z } from "zod";
import { FRANKFURTER_BASE_URL } from "./constants";

const RatesResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
});

const TimeSeriesResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  rates: z.record(z.string(), z.record(z.string(), z.number())),
});

export type RatesResponse = z.infer<typeof RatesResponseSchema>;
export type TimeSeriesResponse = z.infer<typeof TimeSeriesResponseSchema>;

function buildUrl(path: string, params: Record<string, string | undefined>) {
  const url = new URL(`${FRANKFURTER_BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  return url.toString();
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Frankfurter ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchLatestRate(
  base: string,
  symbols: string[],
): Promise<RatesResponse> {
  const url = buildUrl("/latest", {
    base,
    symbols: symbols.length ? symbols.join(",") : undefined,
  });
  return RatesResponseSchema.parse(await fetchJson(url));
}

export async function fetchHistoricalRate(
  date: string,
  base: string,
  symbols: string[],
): Promise<RatesResponse> {
  const url = buildUrl(`/${date}`, {
    base,
    symbols: symbols.length ? symbols.join(",") : undefined,
  });
  return RatesResponseSchema.parse(await fetchJson(url));
}

export async function fetchTimeSeries(
  startDate: string,
  endDate: string,
  base: string,
  symbols: string[],
): Promise<TimeSeriesResponse> {
  const url = buildUrl(`/${startDate}..${endDate}`, {
    base,
    symbols: symbols.length ? symbols.join(",") : undefined,
  });
  return TimeSeriesResponseSchema.parse(await fetchJson(url));
}

export async function fetchCurrencies(): Promise<Record<string, string>> {
  const res = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  return res.json();
}
