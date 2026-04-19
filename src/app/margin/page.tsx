"use client";

import { useMemo } from "react";
import { useQueryState, parseAsString, parseAsFloat } from "nuqs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/shared/currency-select";
import { useTimeSeries } from "@/hooks/use-rates";
import { PageHeader } from "@/components/shared/page-header";
import { rangePresetToDates } from "@/lib/date-utils";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const RANGES = [
  { id: "6m", label: "6 月" },
  { id: "1y", label: "1 年" },
  { id: "3y", label: "3 年" },
  { id: "5y", label: "5 年" },
];

export default function MarginPage() {
  const [cost, setCost] = useQueryState(
    "cost",
    parseAsFloat.withDefault(85),
  );
  const [price, setPrice] = useQueryState(
    "price",
    parseAsFloat.withDefault(19.99),
  );
  const [fees, setFees] = useQueryState("fees", parseAsFloat.withDefault(4.5));
  const [commission, setCommission] = useQueryState(
    "c",
    parseAsFloat.withDefault(15),
  );
  const [currency, setCurrency] = useQueryState(
    "cur",
    parseAsString.withDefault("USD"),
  );
  const [rangeId, setRangeId] = useQueryState(
    "range",
    parseAsString.withDefault("1y"),
  );

  const { start, end } = rangePresetToDates(rangeId);
  const { data, isLoading } = useTimeSeries(start, end, currency, ["CNY"]);

  const analysis = useMemo(() => {
    if (!data) return null;
    const dates = Object.keys(data.rates).sort();
    if (!dates.length) return null;

    const points = dates.map((date) => {
      const rate = data.rates[date]?.CNY ?? 0;
      const revenueRMB = price * rate;
      const commissionRMB = (price * commission) / 100 * rate;
      const feesRMB = fees * rate;
      const profit = revenueRMB - cost - commissionRMB - feesRMB;
      const margin = revenueRMB > 0 ? (profit / revenueRMB) * 100 : 0;
      return { date, rate, profit, margin, revenueRMB };
    });

    const rates = points.map((p) => p.rate);
    const margins = points.map((p) => p.margin);
    const profits = points.map((p) => p.profit);
    const currentRate = rates[rates.length - 1];
    const currentPoint = points[points.length - 1];

    const effectivePrice = 1 - commission / 100;
    const marginalPerUnit = price * effectivePrice - fees;
    const breakevenRate =
      marginalPerUnit > 0 ? cost / marginalPerUnit : null;

    return {
      points,
      currentRate,
      currentMargin: currentPoint.margin,
      currentProfit: currentPoint.profit,
      maxMargin: Math.max(...margins),
      minMargin: Math.min(...margins),
      maxProfit: Math.max(...profits),
      minProfit: Math.min(...profits),
      avgMargin: margins.reduce((a, b) => a + b, 0) / margins.length,
      minRate: Math.min(...rates),
      maxRate: Math.max(...rates),
      breakevenRate,
      marginalPerUnit,
      sensitivityTable: [7.5, 7.2, 7.0, 6.8, 6.5, 6.2, 6.0].map((r) => {
        const rev = price * r;
        const com = (price * commission) / 100 * r;
        const f = fees * r;
        const p = rev - cost - com - f;
        return {
          rate: r,
          profit: p,
          margin: rev > 0 ? (p / rev) * 100 : 0,
        };
      }),
    };
  }, [data, cost, price, fees, commission]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="毛利汇率敏感度"
        subtitle="输入成本 + 售价 + 佣金 + 物流,算出汇率跌到哪里开始翻车"
        scenario="给新品定价 · 盘点哪些老 SKU『看着赚钱其实会亏』 · 判断是否要锁汇"
        value="算出盈亏平衡汇率,看到汇率跌到 6.5 / 6.0 时各 SKU 的真实盈亏,定价留足缓冲"
      />

      <Card>
        <CardHeader>
          <CardTitle>输入参数</CardTitle>
          <CardDescription>单件商品的成本结构</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>采购成本(RMB)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value) || 0)}
              />
              <div className="text-xs text-[var(--color-muted-foreground)]">
                1688 / 工厂采购价
              </div>
            </div>
            <div className="space-y-2">
              <Label>售价(外币 / 件)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
              />
              <div className="text-xs text-[var(--color-muted-foreground)]">
                Amazon / 独立站 上架价
              </div>
            </div>
            <div className="space-y-2">
              <Label>售价币种</Label>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
            <div className="space-y-2">
              <Label>FBA / 运费(外币 / 件)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value) || 0)}
              />
              <div className="text-xs text-[var(--color-muted-foreground)]">
                与售价同币种
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>平台佣金比例(%)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={commission}
                onChange={(e) =>
                  setCommission(Number(e.target.value) || 0)
                }
              />
              <div className="text-xs text-[var(--color-muted-foreground)]">
                Amazon 通常 8-15%,Etsy 6.5%,Shopify 0%
              </div>
            </div>
            <div className="space-y-2">
              <Label>汇率历史区间</Label>
              <div className="flex gap-1 flex-wrap">
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
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  当前单件毛利
                </div>
                <div
                  className={cn(
                    "mt-1 text-3xl font-bold font-mono",
                    analysis.currentProfit < 0
                      ? "text-red-600"
                      : "text-green-700",
                  )}
                >
                  {analysis.currentProfit >= 0 ? "+" : ""}
                  {formatNumber(analysis.currentProfit, {
                    maximumFractionDigits: 2,
                  })}
                  <span className="text-lg"> RMB</span>
                </div>
                <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  按 1 {currency} = {formatNumber(analysis.currentRate, { maximumFractionDigits: 4 })}{" "}
                  CNY
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  当前毛利率
                </div>
                <div
                  className={cn(
                    "mt-1 text-3xl font-bold font-mono",
                    analysis.currentMargin < 10
                      ? "text-amber-600"
                      : analysis.currentMargin < 0
                        ? "text-red-600"
                        : "text-green-700",
                  )}
                >
                  {analysis.currentMargin.toFixed(2)}%
                </div>
                <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  周期均值 {analysis.avgMargin.toFixed(2)}%
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                analysis.breakevenRate === null ||
                  (analysis.breakevenRate !== null &&
                    analysis.breakevenRate > analysis.currentRate * 0.95)
                  ? "border-amber-300"
                  : undefined,
              )}
            >
              <CardContent className="p-4">
                <div className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  盈亏平衡汇率
                </div>
                {analysis.breakevenRate === null ? (
                  <>
                    <div className="mt-1 text-2xl font-bold text-red-600">
                      结构性亏损
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                      扣除佣金和 FBA 后单件净收入(
                      {formatNumber(analysis.marginalPerUnit, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currency})≤ 0,无论汇率涨到多少都亏损。需要提价、降采购或换类目。
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-1 text-3xl font-bold font-mono">
                      {formatNumber(analysis.breakevenRate, {
                        maximumFractionDigits: 4,
                      })}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                      {analysis.breakevenRate <= analysis.minRate
                        ? "✅ 历史区间内未穿透"
                        : analysis.breakevenRate >= analysis.currentRate
                          ? "🚨 当前已亏损!"
                          : `距当前还有 ${(
                              ((analysis.currentRate -
                                analysis.breakevenRate) /
                                analysis.currentRate) *
                              100
                            ).toFixed(1)}% 缓冲`}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>毛利随汇率变化曲线</CardTitle>
              <CardDescription>
                {start} 至 {end} · 汇率对毛利的影响 ·{" "}
                {analysis.points.length} 个交易日
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysis.points}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="chart-grid"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      minTickGap={40}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "毛利 RMB",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 11 },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "汇率",
                        angle: 90,
                        position: "insideRight",
                        style: { fontSize: 11 },
                      }}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => {
                        if (name === "profit") return [v.toFixed(2), "毛利"];
                        if (name === "rate") return [v.toFixed(4), "汇率"];
                        return [v, name];
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={0}
                      stroke="#dc2626"
                      strokeDasharray="5 5"
                      label={{ value: "盈亏线", fontSize: 11 }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="profit"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rate"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>汇率敏感度表</CardTitle>
              <CardDescription>
                假设汇率变动到以下位置,你的单件毛利将变为
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                      <th className="px-2 py-2">汇率 {currency}/CNY</th>
                      <th className="px-2 py-2 text-right">单件毛利(RMB)</th>
                      <th className="px-2 py-2 text-right">毛利率</th>
                      <th className="px-2 py-2">相比当前变化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.sensitivityTable.map((row) => {
                      const diff = row.profit - analysis.currentProfit;
                      const isCurrent =
                        Math.abs(row.rate - analysis.currentRate) < 0.05;
                      return (
                        <tr
                          key={row.rate}
                          className={cn(
                            "border-b border-[var(--color-border)] font-mono",
                            isCurrent && "bg-[var(--color-muted)]",
                            row.profit < 0 && "text-red-600",
                          )}
                        >
                          <td className="px-2 py-2">
                            {row.rate.toFixed(2)}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                                (当前附近)
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {row.profit >= 0 ? "+" : ""}
                            {row.profit.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {row.margin.toFixed(2)}%
                          </td>
                          <td
                            className={cn(
                              "px-2 py-2",
                              diff < 0 ? "text-red-600" : "text-green-700",
                            )}
                          >
                            {diff >= 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />+
                                {diff.toFixed(2)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                {diff.toFixed(2)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-[var(--color-muted-foreground)]">
                {analysis.breakevenRate !== null ? (
                  <>
                    💡 当汇率跌破{" "}
                    <span className="font-mono font-semibold">
                      {analysis.breakevenRate.toFixed(4)}
                    </span>{" "}
                    {currency}/CNY 时,本 SKU 开始亏损。定价时应预留至少 3-5% 汇率波动缓冲。
                  </>
                ) : (
                  <>
                    💡 单件定价结构下本 SKU 结构性亏损(无论汇率多少)。优先提价或换更低佣金类目。
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && !analysis && (
        <Card>
          <CardContent className="py-12 text-center text-[var(--color-muted-foreground)]">
            加载中...
          </CardContent>
        </Card>
      )}
    </div>
  );
}
