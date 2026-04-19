import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { EARLIEST_DATE } from "./constants";

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

export function isDateInRange(date: Date): boolean {
  const earliest = parseISO(EARLIEST_DATE);
  const today = new Date();
  return !isBefore(date, earliest) && !isAfter(date, today);
}

export function clampDate(date: Date): Date {
  const earliest = parseISO(EARLIEST_DATE);
  const today = new Date();
  if (isBefore(date, earliest)) return earliest;
  if (isAfter(date, today)) return today;
  return date;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function rangePresetToDates(preset: string): {
  start: string;
  end: string;
} {
  const end = new Date();
  let start: Date;
  switch (preset) {
    case "1m":
      start = subMonths(end, 1);
      break;
    case "3m":
      start = subMonths(end, 3);
      break;
    case "6m":
      start = subMonths(end, 6);
      break;
    case "1y":
      start = subYears(end, 1);
      break;
    case "3y":
      start = subYears(end, 3);
      break;
    case "5y":
      start = subYears(end, 5);
      break;
    case "10y":
      start = subYears(end, 10);
      break;
    case "all":
      start = parseISO(EARLIEST_DATE);
      break;
    default:
      start = subYears(end, 1);
  }
  return { start: toISODate(start), end: toISODate(end) };
}

export function monthRange(month: string): { start: string; end: string } {
  const d = parseISO(`${month}-01`);
  return {
    start: toISODate(startOfMonth(d)),
    end: toISODate(endOfMonth(d)),
  };
}

export function rollbackDays(date: Date, days: number): string {
  return toISODate(subDays(date, days));
}

export function daysBetween(start: string, end: string): number {
  return Math.abs(differenceInDays(parseISO(end), parseISO(start)));
}

export { format, parseISO, addDays, subDays, subMonths, subYears };
