"use client";

import { useMemo, useState } from "react";
import { CURRENCY_META, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (code: string) => void;
  exclude?: string[];
  className?: string;
}

export function CurrencySelect({ value, onChange, exclude = [], className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SUPPORTED_CURRENCIES.filter((c) => !exclude.includes(c)).filter(
      (c) => {
        if (!q) return true;
        const meta = CURRENCY_META[c];
        return (
          c.toLowerCase().includes(q) ||
          meta.nameZh.includes(q) ||
          meta.name.toLowerCase().includes(q)
        );
      },
    );
  }, [search, exclude]);

  const meta = CURRENCY_META[value];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm hover:bg-[var(--color-muted)]"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{meta?.flag ?? "🏳️"}</span>
          <span className="font-medium">{value}</span>
          {meta && (
            <span className="text-[var(--color-muted-foreground)]">
              {meta.nameZh}
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute z-20 mt-1 max-h-80 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-2">
              <Search className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索货币 (CNY / 人民币 / USD)"
                className="h-8 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map((code) => {
                const m = CURRENCY_META[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]",
                      value === code && "bg-[var(--color-muted)] font-medium",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{m.flag}</span>
                      <span className="font-medium">{code}</span>
                      <span className="text-[var(--color-muted-foreground)]">
                        {m.nameZh}
                      </span>
                    </span>
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {m.region}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                  没有匹配的货币
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
