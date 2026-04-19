"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchHistoricalRate,
  fetchLatestRate,
  fetchTimeSeries,
} from "@/lib/frankfurter";
import { cacheGet, cacheSet } from "@/lib/cache";
import { HISTORICAL_CACHE_TTL_MS } from "@/lib/constants";

export function useLatestRate(base: string, symbols: string[]) {
  const key = ["latest", base, [...symbols].sort().join(",")];
  return useQuery({
    queryKey: key,
    queryFn: () => fetchLatestRate(base, symbols),
    enabled: !!base && symbols.length > 0,
  });
}

export function useHistoricalRate(
  date: string,
  base: string,
  symbols: string[],
) {
  const cacheKey = `hist:${date}:${base}:${[...symbols].sort().join(",")}`;
  return useQuery({
    queryKey: ["historical", date, base, [...symbols].sort().join(",")],
    queryFn: async () => {
      const cached = cacheGet<Awaited<ReturnType<typeof fetchHistoricalRate>>>(
        cacheKey,
      );
      if (cached) return cached;
      const data = await fetchHistoricalRate(date, base, symbols);
      if (data.date === date) {
        cacheSet(cacheKey, data, HISTORICAL_CACHE_TTL_MS);
      } else {
        cacheSet(cacheKey, data);
      }
      return data;
    },
    enabled: !!date && !!base && symbols.length > 0,
    staleTime: Infinity,
  });
}

export function useTimeSeries(
  startDate: string,
  endDate: string,
  base: string,
  symbols: string[],
) {
  const cacheKey = `ts:${startDate}..${endDate}:${base}:${[...symbols]
    .sort()
    .join(",")}`;
  return useQuery({
    queryKey: [
      "timeseries",
      startDate,
      endDate,
      base,
      [...symbols].sort().join(","),
    ],
    queryFn: async () => {
      const cached = cacheGet<Awaited<ReturnType<typeof fetchTimeSeries>>>(
        cacheKey,
      );
      if (cached) return cached;
      const data = await fetchTimeSeries(startDate, endDate, base, symbols);
      cacheSet(cacheKey, data);
      return data;
    },
    enabled: !!startDate && !!endDate && !!base && symbols.length > 0,
    staleTime: Infinity,
  });
}
