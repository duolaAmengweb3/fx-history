"use client";

import { useQueryState, parseAsString, parseAsFloat } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/shared/currency-select";
import { PageHeader } from "@/components/shared/page-header";
import { DateInput } from "@/components/shared/date-input";
import { useTimeSeries } from "@/hooks/use-rates";
import {
  PLATFORM_PRESETS,
  getPreset,
  averageMarkup,
} from "@/lib/platform-presets";
import {
  subDays as subtractDays,
  toISODate,
  parseISO,
} from "@/lib/date-utils";
import { convert, computeStats } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Info } from "lucide-react";
import { useMemo } from "react";

export default function PlatformPage() {
  const [presetId, setPresetId] = useQueryState(
    "preset",
    parseAsString.withDefault("amazon-us"),
  );
  const [amount, setAmount] = useQueryState(
    "amount",
    parseAsFloat.withDefault(10000),
  );
  const [target, setTarget] = useQueryState(
    "target",
    parseAsString.withDefault("CNY"),
  );
  const [settlementDate, setSettlementDate] = useQueryState(
    "date",
    parseAsString.withDefault(toISODate(new Date())),
  );

  const preset = getPreset(presetId);

  const { startDate, endDate } = useMemo(() => {
    const end = parseISO(settlementDate);
    const start = subtractDays(end, preset?.settlementCycleDays ?? 14);
    return { startDate: toISODate(start), endDate: toISODate(end) };
  }, [settlementDate, preset]);

  const { data, isLoading } = useTimeSeries(
    startDate,
    endDate,
    preset?.settlementCurrency ?? "USD",
    [target],
  );

  const analysis = useMemo(() => {
    if (!preset || !data) return null;
    const series: Record<string, number> = {};
    for (const [date, rates] of Object.entries(data.rates)) {
      if (rates[target] !== undefined) series[date] = rates[target];
    }
    const stats = computeStats(series);
    if (stats.count === 0) return null;

    const markup = averageMarkup(preset);
    let officialRate: number;
    switch (preset.settlementMethod) {
      case "closing":
        officialRate = stats.closing;
        break;
      case "daily":
        officialRate = stats.closing;
        break;
      case "average":
      default:
        officialRate = stats.average;
    }
    const effectiveRate = officialRate * (1 - markup);
    const officialAmount = convert(amount, officialRate, 2);
    const effectiveAmount = convert(amount, effectiveRate, 2);
    const lostAmount = officialAmount - effectiveAmount;

    return {
      stats,
      officialRate,
      effectiveRate,
      officialAmount,
      effectiveAmount,
      lostAmount,
      markup,
    };
  }, [preset, data, target, amount]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="平台结算周期"
        subtitle="Amazon / Shopify / PayPal / Wise 等结算:市价 vs 实际到账的真实差额"
        scenario="每月到账总比 Google 查的汇率低,但不知道被平台扒走了多少"
        value="一眼看清平台汇差金额 · 对比用 Wise / Payoneer 能省多少 · 判断要不要换收款渠道"
      />

      <Card>
        <CardHeader>
          <CardTitle>选择平台</CardTitle>
          <CardDescription>
            汇差数值基于平台公开文档和行业实测,仅供参考。实际以你账户收到为准。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetId(p.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border bg-[var(--color-card)] p-3 text-left transition-colors hover:bg-[var(--color-muted)]",
                  presetId === p.id
                    ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                    : "border-[var(--color-border)]",
                )}
              >
                <div className="text-2xl">{p.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {p.settlementCurrency} · {p.settlementCycleDays} 天
                    {p.settlementMethod === "average"
                      ? "均价"
                      : p.settlementMethod === "closing"
                        ? "结算日"
                        : "每日"}{" "}
                    · 汇差 {Math.round(p.platformFxMarkupRange[0] * 1000) / 10}
                    %-
                    {Math.round(p.platformFxMarkupRange[1] * 1000) / 10}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>结算参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>结算金额({preset?.settlementCurrency})</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>目标币种(到手)</Label>
              <CurrencySelect value={target} onChange={setTarget} />
            </div>
            <div className="space-y-2">
              <Label>结算日期</Label>
              <DateInput value={settlementDate} onChange={setSettlementDate} />
            </div>
          </div>
          {preset?.notes && (
            <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>{preset.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                ECB 中间价(理论值)
              </CardTitle>
              <CardDescription>市场公允汇率下应该到账</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                {formatNumber(analysis.officialAmount)} {target}
              </div>
              <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                汇率: 1 {preset?.settlementCurrency} ={" "}
                {formatNumber(analysis.officialRate, {
                  maximumFractionDigits: 6,
                })}{" "}
                {target}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                平台实际到账(估算)
              </CardTitle>
              <CardDescription>平台扣除汇差后的实际金额</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-red-700">
                {formatNumber(analysis.effectiveAmount)} {target}
              </div>
              <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                实际汇率: 1 {preset?.settlementCurrency} ={" "}
                {formatNumber(analysis.effectiveRate, {
                  maximumFractionDigits: 6,
                })}{" "}
                {target}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">
                平台赚走的汇差 ✂️
              </CardTitle>
              <CardDescription className="text-amber-800">
                按 {(analysis.markup * 100).toFixed(2)}% 汇差估算
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono text-amber-900">
                - {formatNumber(analysis.lostAmount)} {target}
              </div>
              <div className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2">
                <div>
                  • 占比{" "}
                  <span className="font-mono font-semibold">
                    {(analysis.markup * 100).toFixed(2)}%
                  </span>
                </div>
                {(() => {
                  const wiseMarkup = 0.005;
                  if (analysis.markup <= wiseMarkup + 0.002) {
                    return (
                      <div>
                        • ✅ 当前已是低汇差方案,没有更便宜的渠道了
                      </div>
                    );
                  }
                  const wiseSaving =
                    analysis.lostAmount -
                    convert(amount, analysis.officialRate, 4) * wiseMarkup;
                  return (
                    <div>
                      • 若改用 Wise(约 0.5%),可节省{" "}
                      <span className="font-mono font-semibold">
                        {formatNumber(wiseSaving)} {target}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>结算周期内汇率详情</CardTitle>
            <CardDescription>
              {startDate} 至 {endDate} 共{" "}
              {analysis.stats.count} 个交易日
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <Stat label="平均" value={analysis.stats.average} />
              <Stat label="最高" value={analysis.stats.max} />
              <Stat label="最低" value={analysis.stats.min} />
              <Stat
                label="波动率"
                value={analysis.stats.volatility * 100}
                suffix="%"
              />
            </div>
            {!isLoading && analysis.stats.max - analysis.stats.min > 0 && (
              <div className="mt-4 text-xs text-[var(--color-muted-foreground)]">
                💡 周期内最高与最低汇率相差{" "}
                {formatNumber(analysis.stats.max - analysis.stats.min, {
                  maximumFractionDigits: 6,
                })}
                ,按本次金额算波动区间为{" "}
                {formatNumber(
                  convert(
                    amount,
                    analysis.stats.max - analysis.stats.min,
                    2,
                  ),
                )}{" "}
                {target}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
      <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
      <div className="mt-1 text-lg font-semibold font-mono">
        {formatNumber(value, { maximumFractionDigits: 6 })}
        {suffix}
      </div>
    </div>
  );
}
