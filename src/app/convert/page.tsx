"use client";

import { useQueryState, parseAsString, parseAsFloat } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurrencySelect } from "@/components/shared/currency-select";
import { DateInput } from "@/components/shared/date-input";
import { PageHeader } from "@/components/shared/page-header";
import { useHistoricalRate } from "@/hooks/use-rates";
import { toISODate } from "@/lib/date-utils";
import { convert } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";
import { ArrowLeftRight, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export default function ConvertPage() {
  const [amount, setAmount] = useQueryState(
    "amount",
    parseAsFloat.withDefault(100),
  );
  const [from, setFrom] = useQueryState(
    "from",
    parseAsString.withDefault("USD"),
  );
  const [to, setTo] = useQueryState("to", parseAsString.withDefault("CNY"));
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(toISODate(new Date())),
  );
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error } = useHistoricalRate(date, from, [
    to,
  ]);

  const rate = data?.rates[to];
  const actualDate = data?.date;
  const fallbackUsed = actualDate && actualDate !== date;
  const result = rate !== undefined ? convert(amount, rate, 2) : null;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="单次换算"
        subtitle="输入金额 + 币种 + 日期,立刻换算"
        scenario="月末核账 / 报价定价 / 随手查某一天的汇率"
        value="免注册免 API,历史任意一天汇率秒出,周末节假日自动回退到最近交易日"
      />

      <Card>
        <CardHeader>
          <CardTitle>汇率换算</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-2">
              <Label>源币种</Label>
              <CurrencySelect value={from} onChange={setFrom} exclude={[to]} />
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="金额"
                className="text-lg"
              />
            </div>

            <div className="flex items-end justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swap}
                aria-label="交换"
                className="mb-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>目标币种</Label>
              <CurrencySelect value={to} onChange={setTo} exclude={[from]} />
              <div className="flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-3 text-lg font-semibold">
                {isLoading && (
                  <span className="text-[var(--color-muted-foreground)]">
                    计算中...
                  </span>
                )}
                {isError && (
                  <span className="text-[var(--color-danger)] text-sm">
                    {error instanceof Error ? error.message : "加载失败"}
                  </span>
                )}
                {!isLoading && result !== null && (
                  <span>
                    {formatNumber(result)} {to}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>日期</Label>
              <DateInput value={date} onChange={setDate} />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDate(toISODate(new Date()))}
              >
                今天
              </Button>
              <Button
                variant="outline"
                onClick={share}
                className="flex-1 justify-center"
              >
                {copied ? (
                  <>
                    <Copy className="h-4 w-4" /> 已复制链接
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" /> 复制分享链接
                  </>
                )}
              </Button>
            </div>
          </div>

          {rate !== undefined && (
            <div className="space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">
                  基准汇率
                </span>
                <span className="font-mono font-medium">
                  1 {from} = {formatNumber(rate, { maximumFractionDigits: 6 })}{" "}
                  {to}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">
                  反向
                </span>
                <span className="font-mono">
                  1 {to} ={" "}
                  {formatNumber(1 / rate, { maximumFractionDigits: 6 })}{" "}
                  {from}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">
                  实际使用日期
                </span>
                <span className="font-mono">
                  {actualDate}
                  {fallbackUsed && (
                    <Badge variant="warning" className="ml-2">
                      原日期为非交易日,已回退
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          )}

          {to !== "CNY" && from !== "CNY" && (
            <div className="text-xs text-[var(--color-muted-foreground)]">
              💡 提示: 跨境卖家可以用人民币作为中间币,快速做三角换算
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
