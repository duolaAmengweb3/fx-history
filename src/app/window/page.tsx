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
  ReferenceDot,
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
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/shared/currency-select";
import { DateInput } from "@/components/shared/date-input";
import { PageHeader } from "@/components/shared/page-header";
import { useTimeSeries } from "@/hooks/use-rates";
import {
  PLATFORM_PRESETS,
  getPreset,
  averageMarkup,
} from "@/lib/platform-presets";
import { subDays, toISODate, parseISO, addDays } from "@/lib/date-utils";
import { convert } from "@/lib/fx-math";
import { formatNumber, cn } from "@/lib/utils";
import { TrendingUp, Clock, AlertCircle } from "lucide-react";

export default function WindowPage() {
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
  const [nextSettlement, setNextSettlement] = useQueryState(
    "date",
    parseAsString.withDefault(toISODate(addDays(new Date(), 7))),
  );

  const preset = getPreset(presetId);

  const { startDate, endDate } = useMemo(() => {
    const next = parseISO(nextSettlement);
    const cycleDays = preset?.settlementCycleDays ?? 14;
    const start = subDays(next, cycleDays);
    const today = new Date();
    const end = next > today ? today : next;
    return { startDate: toISODate(start), endDate: toISODate(end) };
  }, [nextSettlement, preset]);

  const { data, isLoading } = useTimeSeries(
    startDate,
    endDate,
    preset?.settlementCurrency ?? "USD",
    [target],
  );

  const analysis = useMemo(() => {
    if (!data || !preset) return null;
    const dates = Object.keys(data.rates).sort();
    if (!dates.length) return null;
    const points = dates.map((d) => ({
      date: d,
      rate: data.rates[d][target],
    }));
    const rates = points.map((p) => p.rate);
    const current = points[points.length - 1];
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const maxPoint = points.find((p) => p.rate === max);
    const minPoint = points.find((p) => p.rate === min);
    const currentRank =
      [...rates].sort((a, b) => a - b).indexOf(current.rate) + 1;
    const percentile = Math.round((currentRank / rates.length) * 100);

    const gapToMax = ((max - current.rate) / current.rate) * 100;
    const gapFromMin = ((current.rate - min) / min) * 100;
    const gapFromAvg = ((current.rate - avg) / avg) * 100;

    const markup = averageMarkup(preset);
    const platformDelivers = current.rate * (1 - markup);
    const withdrawNow = convert(amount, platformDelivers, 2);
    const withdrawAtAvg = convert(amount, avg * (1 - markup), 2);

    let recommendation: {
      tone: "good" | "neutral" | "bad";
      title: string;
      detail: string;
    };
    if (gapFromAvg > 1) {
      recommendation = {
        tone: "good",
        title: "✅ 当前汇率高于周期均值,适合立刻结汇",
        detail: `当前 ${current.rate.toFixed(4)} 比本周期均值高 ${gapFromAvg.toFixed(2)}%。若你有 ${preset.settlementCurrency} 余额可手动结汇,按 ${formatNumber(amount)} ${preset.settlementCurrency} 能比周期均价多拿 ${formatNumber(
          convert(amount, current.rate - avg, 2),
        )} ${target}。`,
      };
    } else if (gapFromAvg < -1) {
      recommendation = {
        tone: "bad",
        title: "🚨 当前汇率低于周期均值,不建议主动结汇",
        detail: `当前 ${current.rate.toFixed(4)} 比本周期均值低 ${Math.abs(
          gapFromAvg,
        ).toFixed(2)}%。如果能推迟,等待平台结算日或未来交易日可能更好。`,
      };
    } else {
      recommendation = {
        tone: "neutral",
        title: "中性:汇率接近周期均值",
        detail: `当前与周期均值相差 ${gapFromAvg.toFixed(2)}%,手动操作和等待差异不大。`,
      };
    }

    return {
      points,
      current,
      avg,
      max,
      min,
      maxPoint,
      minPoint,
      percentile,
      gapToMax,
      gapFromMin,
      gapFromAvg,
      withdrawNow,
      withdrawAtAvg,
      recommendation,
    };
  }, [data, preset, amount, target]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="最佳结算窗口"
        subtitle="本结算周期内的汇率高低点 · 立刻结汇 vs 等平台均价"
        scenario="美元突然涨了一天,纠结要不要现在手动提现锁住这个汇率"
        value="周期最高 / 最低 / 均值 + 当前分位,给出『现在该等还是该提』的明确建议"
      />

      <Card>
        <CardHeader>
          <CardTitle>参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>平台</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PLATFORM_PRESETS.filter((p) => p.settlementCycleDays > 0).map(
                (p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border bg-[var(--color-card)] p-2 text-left text-sm transition-colors hover:bg-[var(--color-muted)]",
                      presetId === p.id
                        ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                        : "border-[var(--color-border)]",
                    )}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        {p.settlementCycleDays} 天周期
                      </div>
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>待结算金额({preset?.settlementCurrency})</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>到手币种</Label>
              <CurrencySelect value={target} onChange={setTarget} />
            </div>
            <div className="space-y-2">
              <Label>下次结算日期</Label>
              <DateInput
                value={nextSettlement}
                onChange={setNextSettlement}
                min={toISODate(new Date())}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card
            className={cn(
              analysis.recommendation.tone === "good" &&
                "border-green-300 bg-green-50",
              analysis.recommendation.tone === "bad" &&
                "border-red-300 bg-red-50",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {analysis.recommendation.title}
              </CardTitle>
              <CardDescription
                className={cn(
                  analysis.recommendation.tone === "good" && "text-green-900",
                  analysis.recommendation.tone === "bad" && "text-red-900",
                )}
              >
                {analysis.recommendation.detail}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="当前"
              value={analysis.current.rate}
              unit={`@ ${analysis.current.date}`}
              highlight
            />
            <StatCard
              label="周期均值"
              value={analysis.avg}
              unit={`${analysis.gapFromAvg >= 0 ? "+" : ""}${analysis.gapFromAvg.toFixed(2)}%`}
            />
            <StatCard
              label="周期最高"
              value={analysis.max}
              unit={`@ ${analysis.maxPoint?.date}`}
            />
            <StatCard
              label="周期最低"
              value={analysis.min}
              unit={`@ ${analysis.minPoint?.date}`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>周期内汇率曲线</CardTitle>
              <CardDescription>
                {startDate} 至 {endDate} ·{" "}
                {analysis.points.length} 个交易日 · 当前位列第{" "}
                {analysis.percentile} 分位
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysis.points}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="chart-grid"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      minTickGap={30}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v: number) => [v.toFixed(6), "汇率"]}
                    />
                    <ReferenceLine
                      y={analysis.avg}
                      stroke="#78716c"
                      strokeDasharray="3 3"
                      label={{
                        value: `均 ${analysis.avg.toFixed(4)}`,
                        fontSize: 11,
                      }}
                    />
                    {analysis.maxPoint && (
                      <ReferenceDot
                        x={analysis.maxPoint.date}
                        y={analysis.maxPoint.rate}
                        r={5}
                        fill="#16a34a"
                        stroke="#16a34a"
                      />
                    )}
                    {analysis.minPoint && (
                      <ReferenceDot
                        x={analysis.minPoint.date}
                        y={analysis.minPoint.rate}
                        r={5}
                        fill="#dc2626"
                        stroke="#dc2626"
                      />
                    )}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                立刻手动结汇 vs 等周期结算
              </CardTitle>
              <CardDescription>
                按当前汇率 + 平台汇差({(averageMarkup(preset!) * 100).toFixed(2)}%)估算
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="text-sm text-[var(--color-muted-foreground)]">
                    立刻结汇(按今日汇率)
                  </div>
                  <div className="mt-2 text-3xl font-bold font-mono">
                    {formatNumber(analysis.withdrawNow)} {target}
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="text-sm text-[var(--color-muted-foreground)]">
                    平台按周期均价结算
                  </div>
                  <div className="mt-2 text-3xl font-bold font-mono">
                    {formatNumber(analysis.withdrawAtAvg)} {target}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "mt-4 rounded-lg p-3 text-sm",
                  analysis.withdrawNow > analysis.withdrawAtAvg
                    ? "border border-green-300 bg-green-50 text-green-900"
                    : "border border-amber-300 bg-amber-50 text-amber-900",
                )}
              >
                <AlertCircle className="inline h-4 w-4 mr-1" />
                {analysis.withdrawNow > analysis.withdrawAtAvg
                  ? `立刻结汇比等待周期均价多 ${formatNumber(
                      analysis.withdrawNow - analysis.withdrawAtAvg,
                    )} ${target}`
                  : `立刻结汇比等待周期均价少 ${formatNumber(
                      analysis.withdrawAtAvg - analysis.withdrawNow,
                    )} ${target},建议等平台结算`}
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

function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-[var(--color-accent)]")}>
      <CardContent className="p-4">
        <div className="text-xs text-[var(--color-muted-foreground)]">
          {label}
        </div>
        <div className="mt-1 text-xl font-bold font-mono">
          {formatNumber(value, { maximumFractionDigits: 6 })}
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
