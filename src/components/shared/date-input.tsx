"use client";

import { Input } from "@/components/ui/input";
import { EARLIEST_DATE } from "@/lib/constants";
import { toISODate } from "@/lib/date-utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
}

export function DateInput({ value, onChange, className, min, max }: Props) {
  const today = toISODate(new Date());
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min ?? EARLIEST_DATE}
      max={max ?? today}
      className={className}
    />
  );
}
