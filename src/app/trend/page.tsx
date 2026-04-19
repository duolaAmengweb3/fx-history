"use client";

import { useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/shared/currency-select";
import { PageHeader } from "@/components/shared/page-header";
import { useTimeSeries } from "@/hooks/use-rates";
import { rangePresetToDates } from "@/lib/date-utils";
import { computeStats, computePercentile } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "3m", label: "3 月" },
  { id: "6m", label: "6 月" },
  { id: "1y", label: "1 年" },
  { id: "3y", label: "3 年" },
  { id: "5y", label: "5 年" },
  { id: "10y", label: "10 年" },
  { id: "all", label: "全部" },
];

export default function TrendPage() {
  const [base, setBase] = useQueryState(
    "base",
    parseAsString.withDefault("USD"),
  );
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault("CNY"),
  );
  const [rangeId, setRangeId] = useQueryState(
    "range",
    parseAsString.withDefault("1y"),
  );

  const { start, end } = rangePresetToDates(rangeId);
  const { data, isLoading } = useTimeSeries(start, end, base, [quote]);

  const { chartData, stats, currentRate, percentile } = useMemo(() => {
    if (!data)
      return {
        chartData: [],
        stats: null,
        currentRate: 0,
        percentile: null,
      };
    const series: Record<string, number> = {};
    for (const [d, r] of Object.entries(data.rates)) {
      if (r[quote] !== undefined) series[d] = r[quote];
    }
    const sorted = Object.keys(series).sort();
    const chart = sorted.map((d) => ({ date: d, rate: series[d] }));
    const stats = computeStats(series);
    const current = chart.length ? chart[chart.length - 1].rate : 0;
    const pct = computePercentile(current, series);
    return { chartData: chart, stats, currentRate: current, percentile: pct };
  }, [data, quote]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="历史趋势"
        subtitle="长期汇率曲线 + 当前位于历史几分位"
        scenario="手里一笔美元,犹豫现在结汇还是再等等 · 想看看人民币这几年是高是低"
        value="当前汇率在过去 1-10 年处于多少分位一目了然,用数据代替凭感觉判断"
      />

      <Card>
        <CardHeader>
          <CardTitle>选择货币对和时间段</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label>基准币</Label>
              <CurrencySelect
                value={base}
                onChange={setBase}
                exclude={[quote]}
              />
            </div>
            <div className="space-y-2">
              <Label>报价币</Label>
              <CurrencySelect
                value={quote}
                onChange={setQuote}
                exclude={[base]}
              />
            </div>
            <div className="flex items-end gap-1 flex-wrap">
              {RANGES.map((r) => (
                <Button
                  key={r.id}
                  size="sm"
                  variant={rangeId === r.id ? "default" : "outline"}
                  onClick={() => setRangeId(r.id)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && stats.count > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="当前"
              value={currentRate}
              precision={6}
              unit={`${base}/${quote}`}
            />
            <StatCard title="最高" value={stats.max} precision={6} />
            <StatCard title="最低" value={stats.min} precision={6} />
            <StatCard
              title="平均"
              value={stats.average}
              precision={6}
            />
          </div>

          {percentile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  历史分位
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                      percentile.tone === "high" &&
                        "bg-red-100 text-red-800",
                      percentile.tone === "low" &&
                        "bg-green-100 text-green-800",
                      percentile.tone === "mid" &&
                        "bg-[var(--color-muted)] text-[var(--color-foreground)]",
                    )}
                  >
                    {percentile.percentile} 分位 · {percentile.label}
                  </span>
                </CardTitle>
                <CardDescription>
                  当前 {base}/{quote} ={" "}
                  {formatNumber(currentRate, { maximumFractionDigits: 6 })},
                  在过去{" "}
                  {RANGES.find((r) => r.id === rangeId)?.label ?? rangeId}{" "}
                  共 {stats.count} 个交易日中,超过了{" "}
                  {percentile.percentile}% 的数据点。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-xs text-[var(--color-muted-foreground)]">
                  💡 高位(&gt;80):有结汇收入的卖家占优,适合结汇。 · 低位(&lt;20):有购汇成本的场景(进口付款)占优。 ·
                  分位仅为历史事实描述,不构成金融预测。
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {base}/{quote} 走势图
              </CardTitle>
              <CardDescription>
                {start} 至 {end} · {stats.count} 个交易日
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="chart-grid"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                      minTickGap={40}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        formatNumber(v, { maximumFractionDigits: 4 })
                      }
                    />
                    <Tooltip
                      formatter={(v: number) =>
                        formatNumber(v, { maximumFractionDigits: 6 })
                      }
                      labelClassName="font-semibold"
                    />
                    <ReferenceLine
                      y={stats.average}
                      stroke="#999"
                      strokeDasharray="3 3"
                      label={{
                        value: `均 ${formatNumber(stats.average, { maximumFractionDigits: 4 })}`,
                        fontSize: 11,
                        position: "insideLeft",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && !stats && (
        <Card>
          <CardContent className="py-12 text-center text-[var(--color-muted-foreground)]">
            加载汇率历史数据中...
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  precision,
  unit,
}: {
  title: string;
  value: number;
  precision: number;
  unit?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-[var(--color-muted-foreground)]">
          {title}
        </div>
        <div className="mt-1 text-2xl font-bold font-mono">
          {formatNumber(value, { maximumFractionDigits: precision })}
        </div>
        {unit && (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {unit}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
