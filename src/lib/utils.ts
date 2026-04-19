import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 4,
    ...options,
  }).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale = "zh-CN",
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
