"use client";

import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/shared/currency-select";
import { PageHeader } from "@/components/shared/page-header";
import { fetchTimeSeries } from "@/lib/frankfurter";
import { monthRange } from "@/lib/date-utils";
import { computeStats, convert } from "@/lib/fx-math";
import { formatNumber, cn } from "@/lib/utils";
import { Plus, X, Printer, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { PLATFORM_PRESETS, getPreset, averageMarkup } from "@/lib/platform-presets";

type Entry = {
  id: string;
  source: string;
  amount: string;
  currency: string;
  platformId?: string;
};

const DEFAULT_ENTRIES: Entry[] = [
  { id: "1", source: "Amazon 美国", amount: "8500", currency: "USD", platformId: "amazon-us" },
  { id: "2", source: "Amazon 欧洲", amount: "3200", currency: "EUR", platformId: "amazon-eu-de" },
  { id: "3", source: "TikTok Shop 英国", amount: "2100", currency: "GBP", platformId: "tiktok-shop-uk" },
];

function prevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ReportPage() {
  const today = new Date();
  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );
  const [target, setTarget] = useState("CNY");
  const [entries, setEntries] = useState<Entry[]>(DEFAULT_ENTRIES);

  const currencies = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.currency && e.currency !== target) set.add(e.currency);
    });
    return Array.from(set);
  }, [entries, target]);

  const [compare, setCompare] = useState(false);

  const { start, end } = monthRange(month);
  const { start: prevStart, end: prevEnd } = monthRange(prevMonth(month));

  const queries = useQueries({
    queries: currencies.map((c) => ({
      queryKey: ["timeseries", start, end, c, target],
      queryFn: () => fetchTimeSeries(start, end, c, [target]),
      staleTime: Infinity,
      enabled: !!c && !!target,
    })),
  });

  const prevQueries = useQueries({
    queries: currencies.map((c) => ({
      queryKey: ["timeseries", prevStart, prevEnd, c, target],
      queryFn: () => fetchTimeSeries(prevStart, prevEnd, c, [target]),
      staleTime: Infinity,
      enabled: !!c && !!target && compare,
    })),
  });

  const allLoaded = queries.every((q) => q.data || q.isError);

  const rateStatsByCurrency = useMemo(() => {
    const out: Record<
      string,
      ReturnType<typeof computeStats> & { byDate: Record<string, number> }
    > = {};
    queries.forEach((q, i) => {
      const currency = currencies[i];
      if (!q.data) return;
      const series: Record<string, number> = {};
      for (const [d, r] of Object.entries(q.data.rates)) {
        if (r[target] !== undefined) series[d] = r[target];
      }
      out[currency] = { ...computeStats(series), byDate: series };
    });
    return out;
  }, [queries, currencies, target]);

  const prevRateStatsByCurrency = useMemo(() => {
    const out: Record<string, ReturnType<typeof computeStats>> = {};
    prevQueries.forEach((q, i) => {
      const currency = currencies[i];
      if (!q.data) return;
      const series: Record<string, number> = {};
      for (const [d, r] of Object.entries(q.data.rates)) {
        if (r[target] !== undefined) series[d] = r[target];
      }
      out[currency] = computeStats(series);
    });
    return out;
  }, [prevQueries, currencies, target]);

  const rows = entries
    .filter((e) => e.source && e.amount && e.currency)
    .map((e) => {
      const amt = Number(e.amount);
      if (!Number.isFinite(amt)) return null;
      const preset = e.platformId ? getPreset(e.platformId) : undefined;
      const markup = preset ? averageMarkup(preset) : 0;
      if (e.currency === target) {
        return {
          ...e,
          byAvg: amt,
          byClosing: amt,
          byOpening: amt,
          effective: amt,
          platformLoss: 0,
          rateAvg: 1,
          rateClosing: 1,
          rateOpening: 1,
          markup,
          presetName: preset?.name,
        };
      }
      const stats = rateStatsByCurrency[e.currency];
      if (!stats || stats.count === 0) return null;
      const byAvg = convert(amt, stats.average, 2);
      const effective = convert(amt, stats.average * (1 - markup), 2);
      return {
        ...e,
        byAvg,
        byClosing: convert(amt, stats.closing, 2),
        byOpening: convert(amt, stats.opening, 2),
        effective,
        platformLoss: byAvg - effective,
        rateAvg: stats.average,
        rateClosing: stats.closing,
        rateOpening: stats.opening,
        markup,
        presetName: preset?.name,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    source: string;
    amount: string;
    currency: string;
    platformId?: string;
    byAvg: number;
    byClosing: number;
    byOpening: number;
    effective: number;
    platformLoss: number;
    rateAvg: number;
    rateClosing: number;
    rateOpening: number;
    markup: number;
    presetName?: string;
  }>;

  const totals = {
    byAvg: rows.reduce((s, r) => s + r.byAvg, 0),
    byClosing: rows.reduce((s, r) => s + r.byClosing, 0),
    byOpening: rows.reduce((s, r) => s + r.byOpening, 0),
    effective: rows.reduce((s, r) => s + r.effective, 0),
    platformLoss: rows.reduce((s, r) => s + r.platformLoss, 0),
  };

  const prevRows = entries
    .filter((e) => e.source && e.amount && e.currency)
    .map((e) => {
      const amt = Number(e.amount);
      if (!Number.isFinite(amt)) return null;
      if (e.currency === target) return { ...e, byAvg: amt };
      const stats = prevRateStatsByCurrency[e.currency];
      if (!stats || stats.count === 0) return null;
      return { ...e, byAvg: convert(amt, stats.average, 2) };
    })
    .filter(Boolean) as Array<{ id: string; byAvg: number }>;

  const prevTotal = prevRows.reduce((s, r) => s + r.byAvg, 0);
  const momDiff = totals.byAvg - prevTotal;
  const momPct = prevTotal === 0 ? 0 : (momDiff / prevTotal) * 100;
  const anyPlatformLoss = totals.platformLoss > 0;

  const addEntry = () =>
    setEntries([
      ...entries,
      { id: String(Date.now()), source: "", amount: "", currency: "USD" },
    ]);
  const removeEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));
  const updateEntry = (id: string, patch: Partial<Entry>) =>
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const print = () => window.print();

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="月度对账报表"
          subtitle="多平台多币种合并 · 三种汇率口径 · 平台汇差扣减 · 上月对比"
          scenario="月末老板要『这个月总共赚了多少人民币』,你有美欧日 3 个平台多币种收入"
          value="一次合并出完整对账单 · 扣掉平台汇差 · 对比上月涨跌 · 一键打印 PDF 发给会计"
        />
      </div>

      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>报表参数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>月份</Label>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>目标币种</Label>
                <CurrencySelect value={target} onChange={setTarget} />
              </div>
              <div className="space-y-2">
                <Label>对比上月</Label>
                <button
                  type="button"
                  onClick={() => setCompare(!compare)}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                    compare
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-muted)]",
                  )}
                >
                  {compare ? `✓ 已启用(对比 ${prevMonth(month)})` : "点击启用上月对比"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>收入明细</CardTitle>
            <CardDescription>
              按来源分别填入原币种金额,系统会用该月汇率自动换算
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((e) => (
              <div
                key={e.id}
                className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1.2fr_auto]"
              >
                <Input
                  placeholder="来源(如 Amazon 美国)"
                  value={e.source}
                  onChange={(ev) =>
                    updateEntry(e.id, { source: ev.target.value })
                  }
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder="金额"
                  value={e.amount}
                  onChange={(ev) =>
                    updateEntry(e.id, { amount: ev.target.value })
                  }
                />
                <CurrencySelect
                  value={e.currency}
                  onChange={(c) => updateEntry(e.id, { currency: c })}
                />
                <select
                  value={e.platformId ?? ""}
                  onChange={(ev) =>
                    updateEntry(e.id, {
                      platformId: ev.target.value || undefined,
                    })
                  }
                  className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm"
                >
                  <option value="">未指定平台(按 ECB 中间价)</option>
                  {PLATFORM_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name} ({(averageMarkup(p) * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(e.id)}
                  aria-label="删除"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addEntry}>
              <Plus className="h-4 w-4" /> 添加来源
            </Button>
          </CardContent>
        </Card>
      </div>

      <div id="report-body" className="print:pt-0">
        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="print:pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {month} 跨境收入汇率对账单
                </CardTitle>
                <CardDescription>
                  目标币种: {target} · 数据源: European Central Bank (ECB) via
                  frankfurter.dev · 周期 {start} 至 {end}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={print}
                className="print:hidden"
              >
                <Printer className="h-4 w-4" /> 打印 / 保存 PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!allLoaded && (
              <div className="text-sm text-[var(--color-muted-foreground)]">
                加载汇率中...
              </div>
            )}

            {allLoaded && rows.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted-foreground)]">
                请填写至少一条有效的收入记录
              </div>
            )}

            {rows.length > 0 && (
              <div className="space-y-6">
                {compare && prevTotal > 0 && (
                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      momDiff >= 0
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-[var(--color-muted-foreground)]">
                          本月 vs 上月({prevMonth(month)})
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-2xl font-bold font-mono">
                          {momDiff >= 0 ? (
                            <ArrowUp className="h-6 w-6 text-green-700" />
                          ) : (
                            <ArrowDown className="h-6 w-6 text-red-700" />
                          )}
                          {momDiff >= 0 ? "+" : ""}
                          {formatNumber(momDiff)} {target}
                        </div>
                        <div className="mt-1 text-sm">
                          本月 {formatNumber(totals.byAvg)} · 上月{" "}
                          {formatNumber(prevTotal)} · 变化{" "}
                          <span className="font-semibold font-mono">
                            {momPct >= 0 ? "+" : ""}
                            {momPct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[var(--color-foreground)] text-left">
                        <th className="px-2 py-2">来源</th>
                        <th className="px-2 py-2 text-right">原币</th>
                        <th className="px-2 py-2 text-right">月初 → {target}</th>
                        <th className="px-2 py-2 text-right">月均 → {target}</th>
                        <th className="px-2 py-2 text-right">月末 → {target}</th>
                        {anyPlatformLoss && (
                          <>
                            <th className="px-2 py-2 text-right">平台实到</th>
                            <th className="px-2 py-2 text-right">汇差损失</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-[var(--color-border)]"
                        >
                          <td className="px-2 py-2">
                            {r.source}
                            {r.presetName && (
                              <span className="ml-1 text-xs text-[var(--color-muted-foreground)]">
                                · {(r.markup * 100).toFixed(1)}% 汇差
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right font-mono">
                            {formatNumber(Number(r.amount))} {r.currency}
                          </td>
                          <td className="px-2 py-2 text-right font-mono">
                            {formatNumber(r.byOpening)}
                          </td>
                          <td className="px-2 py-2 text-right font-mono">
                            {formatNumber(r.byAvg)}
                          </td>
                          <td className="px-2 py-2 text-right font-mono">
                            {formatNumber(r.byClosing)}
                          </td>
                          {anyPlatformLoss && (
                            <>
                              <td className="px-2 py-2 text-right font-mono">
                                {formatNumber(r.effective)}
                              </td>
                              <td className="px-2 py-2 text-right font-mono text-red-700">
                                {r.platformLoss > 0
                                  ? `-${formatNumber(r.platformLoss)}`
                                  : "—"}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      <tr className="border-b-2 border-[var(--color-foreground)] font-semibold">
                        <td className="px-2 py-3">合计</td>
                        <td></td>
                        <td className="px-2 py-3 text-right font-mono">
                          {formatNumber(totals.byOpening)} {target}
                        </td>
                        <td className="px-2 py-3 text-right font-mono">
                          {formatNumber(totals.byAvg)} {target}
                        </td>
                        <td className="px-2 py-3 text-right font-mono">
                          {formatNumber(totals.byClosing)} {target}
                        </td>
                        {anyPlatformLoss && (
                          <>
                            <td className="px-2 py-3 text-right font-mono">
                              {formatNumber(totals.effective)} {target}
                            </td>
                            <td className="px-2 py-3 text-right font-mono text-red-700">
                              -{formatNumber(totals.platformLoss)} {target}
                            </td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {anyPlatformLoss && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold">
                      <Minus className="h-4 w-4" />
                      本月共被平台扣掉汇差{" "}
                      <span className="font-mono text-lg">
                        {formatNumber(totals.platformLoss)} {target}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-amber-900">
                      占月均口径收入的{" "}
                      {((totals.platformLoss / totals.byAvg) * 100).toFixed(2)}
                      %。改用 Wise / Payoneer 等透明费率渠道,典型可降到 0.35%-1%。
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-sm">
                  <div className="font-semibold mb-2">口径说明</div>
                  <ul className="space-y-1 text-[var(--color-muted-foreground)]">
                    <li>
                      • <b>月初汇率</b>:取本月首个交易日 ECB 参考中间价
                    </li>
                    <li>
                      • <b>月末汇率</b>:取本月最后一个交易日 ECB 参考中间价
                    </li>
                    <li>
                      • <b>月内平均</b>:本月所有交易日 ECB 中间价算术平均(简单均值)
                    </li>
                    <li>
                      • <b>汇率波动对比</b>:月初到月末差额{" "}
                      <span className="font-mono">
                        {formatNumber(totals.byClosing - totals.byOpening)}{" "}
                        {target}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  ⚠️ 本报表基于欧洲央行(ECB)参考中间价,仅供内部核算 / 管理报表参考,<b>不构成法定税务凭证</b>。
                  中国境内税务核算应以中国人民银行公布的人民币汇率中间价为准。
                </div>

                <div className="text-xs text-[var(--color-muted-foreground)]">
                  生成时间: {new Date().toLocaleString("zh-CN")} · 生成工具:
                  FXHistory
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          footer {
            display: none !important;
          }
          main {
            max-width: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
