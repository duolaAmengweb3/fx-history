"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/shared/currency-select";
import { PageHeader } from "@/components/shared/page-header";
import { fetchTimeSeries, fetchHistoricalRate } from "@/lib/frankfurter";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { cacheGet, cacheSet } from "@/lib/cache";
import { HISTORICAL_CACHE_TTL_MS } from "@/lib/constants";
import { convert } from "@/lib/fx-math";
import { formatNumber } from "@/lib/utils";
import { Upload, Download, FileText, CheckCircle2, XCircle } from "lucide-react";

type RowInput = { date: string; amount: string; from_currency: string };
type RowResult = RowInput & {
  actualDate?: string;
  rate?: number;
  converted?: number;
  fallbackUsed?: boolean;
  error?: string;
};

export default function BatchPage() {
  const [target, setTarget] = useState("CNY");
  const [rows, setRows] = useState<RowResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [fileName, setFileName] = useState("");

  const downloadTemplate = () => {
    const csv =
      "date,amount,from_currency\n" +
      "2026-03-01,1000,USD\n" +
      "2026-03-15,800,EUR\n" +
      "2026-03-30,120000,JPY\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fx-history-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (file: File) => {
    setFileName(file.name);
    Papa.parse<RowInput>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map((r) => ({
            date: String(r.date ?? "").trim(),
            amount: String(r.amount ?? "").trim(),
            from_currency: String(r.from_currency ?? "").trim().toUpperCase(),
          }))
          .filter((r) => r.date && r.amount && r.from_currency);
        setRows(parsed);
      },
    });
  };

  const process = async () => {
    if (!rows.length) return;
    setProcessing(true);
    setProgress({ done: 0, total: rows.length });

    const groupedByCurrency: Record<string, string[]> = {};
    for (const r of rows) {
      if (!SUPPORTED_CURRENCIES.includes(r.from_currency)) continue;
      if (r.from_currency === target) continue;
      if (!groupedByCurrency[r.from_currency])
        groupedByCurrency[r.from_currency] = [];
      groupedByCurrency[r.from_currency].push(r.date);
    }

    const rateMap: Record<string, { actualDate: string; rate: number }> = {};

    for (const [currency, dates] of Object.entries(groupedByCurrency)) {
      const sorted = [...new Set(dates)].sort();
      if (!sorted.length) continue;
      const minDate = sorted[0];
      const maxDate = sorted[sorted.length - 1];
      const cacheKey = `batch:${currency}:${target}:${minDate}:${maxDate}`;
      let series = cacheGet<Record<string, number>>(cacheKey);
      if (!series) {
        try {
          const data = await fetchTimeSeries(minDate, maxDate, currency, [
            target,
          ]);
          series = {};
          for (const [date, rates] of Object.entries(data.rates)) {
            series[date] = rates[target];
          }
          cacheSet(cacheKey, series);
        } catch {
          series = {};
        }
      }

      const dateList = Object.keys(series).sort();
      for (const wantDate of sorted) {
        let actualDate = wantDate;
        if (series[wantDate] === undefined) {
          const priorDates = dateList.filter((d) => d <= wantDate);
          if (priorDates.length) {
            actualDate = priorDates[priorDates.length - 1];
          } else {
            try {
              const fallback = await fetchHistoricalRate(wantDate, currency, [
                target,
              ]);
              rateMap[`${currency}:${wantDate}`] = {
                actualDate: fallback.date,
                rate: fallback.rates[target],
              };
              cacheSet(
                `hist:${fallback.date}:${currency}:${target}`,
                fallback,
                HISTORICAL_CACHE_TTL_MS,
              );
              continue;
            } catch {
              continue;
            }
          }
        }
        rateMap[`${currency}:${wantDate}`] = {
          actualDate,
          rate: series[actualDate],
        };
      }
    }

    const processed: RowResult[] = rows.map((r) => {
      if (r.from_currency === target) {
        return {
          ...r,
          actualDate: r.date,
          rate: 1,
          converted: Number(r.amount),
        };
      }
      if (!SUPPORTED_CURRENCIES.includes(r.from_currency)) {
        return { ...r, error: `不支持的币种: ${r.from_currency}` };
      }
      const hit = rateMap[`${r.from_currency}:${r.date}`];
      if (!hit) return { ...r, error: "汇率获取失败" };
      const amt = Number(r.amount);
      if (!Number.isFinite(amt)) return { ...r, error: "金额无效" };
      return {
        ...r,
        actualDate: hit.actualDate,
        rate: hit.rate,
        converted: convert(amt, hit.rate, 2),
        fallbackUsed: hit.actualDate !== r.date,
      };
    });

    setRows(processed);
    setProgress({ done: processed.length, total: processed.length });
    setProcessing(false);
  };

  const downloadResult = () => {
    const header = `date,amount,from_currency,to_currency,actual_date,rate,converted,note\n`;
    const body = rows
      .map((r) =>
        [
          r.date,
          r.amount,
          r.from_currency,
          target,
          r.actualDate ?? "",
          r.rate ?? "",
          r.converted ?? "",
          r.error ?? (r.fallbackUsed ? "使用最近交易日" : ""),
        ]
          .map((v) => String(v).replace(/"/g, '""'))
          .map((v) => (v.includes(",") ? `"${v}"` : v))
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + header + body], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalConverted = rows
    .filter((r) => r.converted !== undefined)
    .reduce((sum, r) => sum + (r.converted ?? 0), 0);

  const successCount = rows.filter((r) => r.converted !== undefined).length;
  const errorCount = rows.filter((r) => r.error).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CSV 批量换算"
        subtitle="上传对账表 · 自动按每行日期和币种批量换算"
        scenario="Amazon / Shopify 月度导出表几百行,要逐笔按当天汇率换人民币做报表"
        value="上传一次性换完 · 周末自动回退最近交易日 · 比一笔笔查快 100 倍,数据只在你浏览器里处理"
      />

      <Card>
        <CardHeader>
          <CardTitle>第一步: 上传 CSV</CardTitle>
          <CardDescription>
            文件需包含三列:{" "}
            <code className="rounded bg-[var(--color-muted)] px-1 font-mono">
              date, amount, from_currency
            </code>
            。日期格式 YYYY-MM-DD,币种为 3 位大写字母(如 USD)。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4" /> 下载模板
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
              <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90">
                <Upload className="h-4 w-4" /> 选择 CSV 文件
              </span>
            </label>
            {fileName && (
              <span className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                <FileText className="h-4 w-4" /> {fileName} · {rows.length} 行
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>目标币种</Label>
              <CurrencySelect value={target} onChange={setTarget} />
            </div>
            <div className="flex items-end">
              <Button
                onClick={process}
                disabled={!rows.length || processing}
                className="w-full"
              >
                {processing
                  ? `处理中 ${progress.done}/${progress.total}`
                  : `开始换算 (${rows.length} 行)`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>结果</CardTitle>
                <CardDescription>
                  成功 {successCount} · 失败 {errorCount}
                  {successCount > 0 && (
                    <>
                      {" · "}
                      合计到手{" "}
                      <span className="font-mono font-semibold">
                        {formatNumber(totalConverted)} {target}
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
              {successCount > 0 && (
                <Button variant="outline" onClick={downloadResult}>
                  <Download className="h-4 w-4" /> 导出 CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                    <th className="px-2 py-2">日期</th>
                    <th className="px-2 py-2">金额</th>
                    <th className="px-2 py-2">源币</th>
                    <th className="px-2 py-2">实际日期</th>
                    <th className="px-2 py-2">汇率</th>
                    <th className="px-2 py-2 text-right">到手 {target}</th>
                    <th className="px-2 py-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 500).map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--color-border)] font-mono"
                    >
                      <td className="px-2 py-2">{r.date}</td>
                      <td className="px-2 py-2">{r.amount}</td>
                      <td className="px-2 py-2">{r.from_currency}</td>
                      <td className="px-2 py-2">{r.actualDate ?? "-"}</td>
                      <td className="px-2 py-2">
                        {r.rate !== undefined
                          ? formatNumber(r.rate, { maximumFractionDigits: 6 })
                          : "-"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {r.converted !== undefined
                          ? formatNumber(r.converted)
                          : "-"}
                      </td>
                      <td className="px-2 py-2">
                        {r.error ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-3 w-3" /> {r.error}
                          </span>
                        ) : r.fallbackUsed ? (
                          <span className="text-amber-700 text-xs">
                            非交易日回退
                          </span>
                        ) : r.converted !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 500 && (
                <div className="mt-2 text-center text-xs text-[var(--color-muted-foreground)]">
                  仅展示前 500 行,完整结果请导出 CSV
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
