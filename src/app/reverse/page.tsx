"use client";

import { useQueryState, parseAsString, parseAsFloat } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/shared/currency-select";
import { DateInput } from "@/components/shared/date-input";
import { PageHeader } from "@/components/shared/page-header";
import { useHistoricalRate } from "@/hooks/use-rates";
import { toISODate } from "@/lib/date-utils";
import { reverseConvert } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";

export default function ReversePage() {
  const [targetAmount, setTargetAmount] = useQueryState(
    "amount",
    parseAsFloat.withDefault(3000),
  );
  const [target, setTarget] = useQueryState(
    "target",
    parseAsString.withDefault("CNY"),
  );
  const [source, setSource] = useQueryState(
    "source",
    parseAsString.withDefault("USD"),
  );
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(toISODate(new Date())),
  );

  const { data, isLoading } = useHistoricalRate(date, source, [target]);
  const rate = data?.rates[target];
  const sourceAmount = rate ? reverseConvert(targetAmount, rate, 2) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="反向定价"
        subtitle="给定期望到手金额,反推源币种的最低定价"
        scenario="工厂报完人民币成本,要在 Amazon / 独立站定多少美元 / 欧元才保毛利"
        value="不用拿计算器反复套公式,输入想收到的人民币金额,直接出建议售价"
      />

      <Card>
        <CardHeader>
          <CardTitle>期望收入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>期望到手金额</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>到手币种</Label>
              <CurrencySelect
                value={target}
                onChange={setTarget}
                exclude={[source]}
              />
            </div>
            <div className="space-y-2">
              <Label>日期</Label>
              <DateInput value={date} onChange={setDate} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>源币种(定价币)</Label>
            <CurrencySelect
              value={source}
              onChange={setSource}
              exclude={[target]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>建议定价</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-6 text-center">
            <div className="text-sm text-[var(--color-muted-foreground)]">
              为了收到 {formatNumber(targetAmount)} {target},你需要售价至少
            </div>
            <div className="mt-2 text-4xl font-bold font-mono">
              {isLoading && "..."}
              {sourceAmount !== null && (
                <>
                  {formatNumber(sourceAmount)} {source}
                </>
              )}
            </div>
            {rate !== undefined && (
              <div className="mt-3 text-xs text-[var(--color-muted-foreground)] font-mono">
                基于 {data?.date} 汇率: 1 {source} ={" "}
                {formatNumber(rate, { maximumFractionDigits: 6 })} {target}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            ⚠️ 这是 ECB 中间价的反推价。若你通过 Amazon / PayPal 收款,实际到手会因平台汇差再少 1-4%,
            定价时应额外加价作为缓冲。参考{" "}
            <a href="/platform" className="underline font-medium">
              平台结算
            </a>
            。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
