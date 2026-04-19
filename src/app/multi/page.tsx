"use client";

import {
  useQueryState,
  parseAsString,
  parseAsFloat,
  parseAsArrayOf,
} from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/shared/currency-select";
import { DateInput } from "@/components/shared/date-input";
import { PageHeader } from "@/components/shared/page-header";
import { useHistoricalRate } from "@/hooks/use-rates";
import { toISODate } from "@/lib/date-utils";
import { CURRENCY_META, DEFAULT_TARGETS } from "@/lib/constants";
import { convert } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";
import { X, Plus } from "lucide-react";
import { useState } from "react";

export default function MultiPage() {
  const [amount, setAmount] = useQueryState(
    "amount",
    parseAsFloat.withDefault(100),
  );
  const [from, setFrom] = useQueryState(
    "from",
    parseAsString.withDefault("USD"),
  );
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(toISODate(new Date())),
  );
  const [targets, setTargets] = useQueryState(
    "to",
    parseAsArrayOf(parseAsString).withDefault(DEFAULT_TARGETS),
  );
  const [newTarget, setNewTarget] = useState("CHF");

  const { data, isLoading } = useHistoricalRate(
    date,
    from,
    targets.filter((t) => t !== from),
  );

  const addTarget = () => {
    if (newTarget && !targets.includes(newTarget) && newTarget !== from) {
      setTargets([...targets, newTarget]);
    }
  };

  const removeTarget = (code: string) => {
    setTargets(targets.filter((t) => t !== code));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="一币兑多币"
        subtitle="一个金额同时换成多个目标币种,一屏看清"
        scenario="同款货要在美 / 欧 / 日 / 英多站同时定价;或想看同一笔收入折算成不同币的样子"
        value="不用反复切换币种重复查,5 个币种一次出结果,适合报价会议和运营同步"
      />

      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>源币种</Label>
              <CurrencySelect value={from} onChange={setFrom} />
            </div>
            <div className="space-y-2">
              <Label>金额</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>日期</Label>
              <DateInput value={date} onChange={setDate} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>换算结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {targets.map((t) => {
            if (t === from) return null;
            const rate = data?.rates[t];
            return (
              <div
                key={t}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {CURRENCY_META[t]?.flag ?? "💱"}
                  </span>
                  <div>
                    <div className="font-semibold">
                      {t}{" "}
                      <span className="text-[var(--color-muted-foreground)] text-sm font-normal">
                        · {CURRENCY_META[t]?.nameZh}
                      </span>
                    </div>
                    {rate !== undefined && (
                      <div className="text-xs text-[var(--color-muted-foreground)] font-mono">
                        1 {from} = {formatNumber(rate, {
                          maximumFractionDigits: 6,
                        })}{" "}
                        {t}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-semibold font-mono">
                      {isLoading && "..."}
                      {rate !== undefined &&
                        formatNumber(convert(amount, rate, 2))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTarget(t)}
                    aria-label={`移除 ${t}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1">
              <CurrencySelect
                value={newTarget}
                onChange={setNewTarget}
                exclude={[from, ...targets]}
              />
            </div>
            <Button onClick={addTarget}>
              <Plus className="h-4 w-4" />
              添加币种
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
