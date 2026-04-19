# FXHistory · 技术设计文档

> **配套 PRD**: [PRD.md](./PRD.md)
> **版本**: v1.0 · **编写日期**: 2026-04-19
> **架构方针**: 纯前端 / 无后端 / 无数据库 / 部署即上线

---

## 一、架构总览

```
┌────────────────────────────────────────────────────────────┐
│                       浏览器(客户端)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router + React 19 + TypeScript       │  │
│  │                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │ UI Layer   │  │ State (Zus-│  │ Data Fetching  │  │  │
│  │  │ shadcn/ui  │  │  tand)     │  │ (TanStack Qry) │  │  │
│  │  └────────────┘  └────────────┘  └────────────────┘  │  │
│  │                                                      │  │
│  │  ┌────────────────────────┐  ┌────────────────────┐  │  │
│  │  │ localStorage 缓存层     │  │ Web Worker(CSV)   │  │  │
│  │  │ - 24h 汇率缓存          │  │ - 批量处理,不卡 UI │  │  │
│  │  │ - 最近查询历史          │  └────────────────────┘  │  │
│  │  │ - 用户预设              │                          │  │
│  │  └────────────────────────┘                          │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS (CORS: *)
                           ▼
           ┌───────────────────────────────────┐
           │  api.frankfurter.dev/v1/          │
           │  (Cloudflare CDN, 24h cache)      │
           └───────────────────────────────────┘
                           ▲
                           │ 每日同步
           ┌───────────────────────────────────┐
           │  European Central Bank (ECB)      │
           └───────────────────────────────────┘
```

**关键设计决策**:

1. **纯前端**:无需服务器,无后端代码,无数据库。用户的所有数据(上传的 CSV、设置)只存在自己浏览器 localStorage,**隐私零风险**
2. **三级缓存**:Frankfurter CDN(24h)+ 浏览器 HTTP 缓存(24h)+ localStorage(可配置,默认 24h),典型用户 99% 请求走本地
3. **可移植性**:只靠一个 API,若 Frankfurter 未来出问题,替换为 exchangerate.host / 直接 ECB XML 的成本极低

---

## 二、技术栈清单

### 核心框架

| 层 | 选型 | 版本 | 理由 |
|---|---|---|---|
| 框架 | Next.js | 15.x(App Router) | SSG 出静态站,SEO 友好,Vercel 零配置 |
| 语言 | TypeScript | 5.x | 强类型,汇率精度处理需要 |
| 样式 | Tailwind CSS | 4.x | 迭代快 + shadcn/ui 官方搭配 |
| 组件库 | shadcn/ui | latest | 可复制组件,不锁 npm 依赖 |
| 运行时 | React | 19.x | Server Components 不用,但 RSC 做静态页 |

### 数据和状态

| 用途 | 选型 | 理由 |
|---|---|---|
| 服务端数据获取 / 缓存 | TanStack Query v5 | 去重 / 缓存 / 过期管理一把梭 |
| 全局状态 | Zustand | 比 Redux 轻,比 Context 灵活 |
| 表单 | React Hook Form + Zod | 校验和类型同源 |
| 路由查询参数 | `nuqs` | URL 参数化分享的刚需 |

### 可视化

| 用途 | 选型 | 理由 |
|---|---|---|
| 图表 | Recharts | 上手快,常规汇率曲线够用 |
| PDF 导出 | `@react-pdf/renderer` | 服务端 / 客户端都能用,中文字体通过子集加载 |
| CSV 解析 | Papa Parse | 浏览器端最稳,支持流式 |

### 辅助库

| 用途 | 选型 |
|---|---|
| 日期 | `date-fns`(tree-shakable,按需引入)|
| 高精度小数 | `decimal.js` 或 `big.js`(避免浮点误差)|
| 国际化 | `next-intl` |
| 图标 | `lucide-react` |
| 分享链接拷贝 | 原生 Clipboard API,不装库 |

### 构建和部署

| 环节 | 工具 |
|---|---|
| 包管理 | `pnpm` |
| Lint / Format | `biome`(取代 ESLint + Prettier)|
| 测试 | `vitest` + `@testing-library/react` |
| 部署 | Vercel(`vercel.json` 零配置)|
| 监控 | Vercel Analytics + Sentry(免费档)|

---

## 三、目录结构

```
fx-history/
├── PRD.md
├── TECH.md
├── README.md                       # 简述 / 跑起来命令
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── biome.json
├── .env.example                    # 理论无需 env,保留占位
├── public/
│   ├── fonts/                      # 思源宋体子集,给 PDF 用
│   └── og.png
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局,挂主题和 i18n
│   │   ├── page.tsx                # 首页(A1 单次换算 + 入口)
│   │   ├── multi/page.tsx          # A2 一币兑多币
│   │   ├── reverse/page.tsx        # A3 反向换算
│   │   ├── platform/page.tsx       # B 模块 · 平台结算
│   │   ├── batch/page.tsx          # C1 CSV 批量
│   │   ├── report/page.tsx         # C2 月度对账
│   │   ├── trend/page.tsx          # D 模块 · 趋势图
│   │   ├── help/page.tsx           # G1 帮助
│   │   └── api/                    # 不写 API route,保持纯静态
│   ├── components/
│   │   ├── ui/                     # shadcn 组件
│   │   ├── converter/              # A 模块组件
│   │   ├── platform/               # B 模块组件
│   │   ├── batch/                  # C 模块组件
│   │   ├── trend/                  # D 模块组件
│   │   ├── shared/                 # 共用组件(CurrencyPicker / DatePicker 等)
│   │   └── layout/                 # Header / Footer / Shell
│   ├── lib/
│   │   ├── frankfurter.ts          # API 封装
│   │   ├── cache.ts                # localStorage 缓存层
│   │   ├── csv.ts                  # CSV 解析 / 生成(Web Worker 入口)
│   │   ├── pdf/
│   │   │   ├── monthly-report.tsx  # PDF 模板
│   │   │   └── fonts.ts
│   │   ├── platform-presets.ts     # 平台预设数据(见 §5)
│   │   ├── fx-math.ts              # 换算 / 均价 / 分位数计算
│   │   ├── date-utils.ts           # 节假日 / 最近交易日 fallback
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-latest-rates.ts
│   │   ├── use-historical-rate.ts
│   │   ├── use-time-series.ts
│   │   ├── use-preferences.ts
│   │   └── use-query-history.ts
│   ├── store/
│   │   ├── preferences.ts          # Zustand store
│   │   └── query-history.ts
│   ├── workers/
│   │   └── csv-processor.ts        # Web Worker
│   ├── locales/
│   │   ├── zh.json
│   │   └── en.json
│   └── types/
│       ├── api.ts                  # Frankfurter 响应类型
│       ├── currency.ts
│       └── report.ts
└── tests/
    ├── fx-math.test.ts
    ├── date-utils.test.ts
    └── platform-presets.test.ts
```

---

## 四、API 封装(`src/lib/frankfurter.ts`)

### Frankfurter API 完整接口清单

| 端点 | 用途 | 示例 |
|---|---|---|
| `/v1/currencies` | 货币列表 | `{ "USD": "US Dollar", ... }` |
| `/v1/latest` | 最新汇率 | `?base=USD&symbols=CNY,EUR` |
| `/v1/{YYYY-MM-DD}` | 历史日汇率 | `/v1/2025-03-15?base=USD` |
| `/v1/{DATE}..{DATE}` | 时间序列 | `/v1/2025-01-01..2025-01-31?base=USD&symbols=CNY` |

### 封装代码骨架

```ts
// src/lib/frankfurter.ts
import { z } from "zod";

const BASE_URL = "https://api.frankfurter.dev/v1";

const RatesResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
});

const TimeSeriesResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  rates: z.record(z.string(), z.record(z.string(), z.number())),
});

export async function fetchLatestRate(base: string, symbols: string[]) {
  const url = new URL(`${BASE_URL}/latest`);
  url.searchParams.set("base", base);
  if (symbols.length) url.searchParams.set("symbols", symbols.join(","));
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  return RatesResponseSchema.parse(await res.json());
}

export async function fetchHistoricalRate(
  date: string,
  base: string,
  symbols: string[],
) {
  const url = new URL(`${BASE_URL}/${date}`);
  url.searchParams.set("base", base);
  if (symbols.length) url.searchParams.set("symbols", symbols.join(","));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  return RatesResponseSchema.parse(await res.json());
}

export async function fetchTimeSeries(
  startDate: string,
  endDate: string,
  base: string,
  symbols: string[],
) {
  const url = new URL(`${BASE_URL}/${startDate}..${endDate}`);
  url.searchParams.set("base", base);
  if (symbols.length) url.searchParams.set("symbols", symbols.join(","));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  return TimeSeriesResponseSchema.parse(await res.json());
}
```

### 节假日与回退策略(`src/lib/date-utils.ts`)

```ts
export async function fetchRateWithFallback(
  requestedDate: Date,
  base: string,
  symbols: string[],
): Promise<{ actualDate: string; fallbackUsed: boolean; rates: ... }> {
  const iso = formatISO(requestedDate, { representation: "date" });
  try {
    const data = await fetchHistoricalRate(iso, base, symbols);
    return { actualDate: data.date, fallbackUsed: data.date !== iso, rates: data.rates };
  } catch (e) {
    // 如果返回 404(极罕见),回退到请求日期前 7 天区间取最后一个
    const fallbackStart = subDays(requestedDate, 7);
    const series = await fetchTimeSeries(
      formatISO(fallbackStart, { representation: "date" }),
      iso,
      base,
      symbols,
    );
    const lastDate = Object.keys(series.rates).sort().pop()!;
    return { actualDate: lastDate, fallbackUsed: true, rates: series.rates[lastDate] };
  }
}
```

---

## 五、平台预设数据(`src/lib/platform-presets.ts`)

```ts
export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "amazon-us",
    name: "Amazon 美国 · FBA 卖家",
    platform: "amazon",
    settlementCurrency: "USD",
    settlementCycleDays: 14,
    settlementMethod: "average", // Amazon 取结算周期内平均
    platformFxMarkupRange: [0.0075, 0.015], // Amazon ACCS 0.75%-1.5%
    payoutDelayDays: 7, // 结算日到实际到账
    notes: "Amazon Currency Converter for Sellers(ACCS)在 ECB 中间价上加 ~1%,若用第三方收款(Payoneer)则避开这个差价",
  },
  {
    id: "amazon-eu-de",
    name: "Amazon 欧洲 · 德国站",
    platform: "amazon",
    settlementCurrency: "EUR",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 5,
  },
  {
    id: "amazon-jp",
    name: "Amazon 日本",
    platform: "amazon",
    settlementCurrency: "JPY",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 5,
  },
  {
    id: "shopify-payments-us",
    name: "Shopify Payments · 美国",
    platform: "shopify",
    settlementCurrency: "USD",
    settlementCycleDays: 2,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.015, 0.02], // Shopify 兑换 1.5-2%
    payoutDelayDays: 2,
  },
  {
    id: "stripe-us",
    name: "Stripe · 美国商户",
    platform: "stripe",
    settlementCurrency: "USD",
    settlementCycleDays: 2,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.01, 0.02],
    payoutDelayDays: 2,
  },
  {
    id: "paypal",
    name: "PayPal · 手动提现",
    platform: "paypal",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.025, 0.04], // PayPal 是最贵的
    payoutDelayDays: 3,
    notes: "PayPal 的汇率差是全行业最高,建议提现时选美元提到 Payoneer / Wise,避开 PayPal 汇兑",
  },
  {
    id: "wise-business",
    name: "Wise Business",
    platform: "wise",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.0035, 0.006], // Wise 透明费率
    payoutDelayDays: 0,
    notes: "Wise 直接使用市场中间价 + 透明手续费,是汇率最友好的方案",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    platform: "payoneer",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.02, 0.03],
    payoutDelayDays: 1,
    notes: "Payoneer 提现到中国账户时约 2-3% 汇损",
  },
  {
    id: "tiktok-shop-us",
    name: "TikTok Shop 美国",
    platform: "tiktok",
    settlementCurrency: "USD",
    settlementCycleDays: 7,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.01, 0.02],
    payoutDelayDays: 10,
  },
  // ... 其他平台(Etsy / eBay / 独立站 WooCommerce 等)
];
```

**数据来源**:平台公开文档 + 行业实测(数值为"市场共识范围",在 UI 上明确标"参考",支持用户手动覆盖)。

---

## 六、核心算法

### 6.1 高精度换算

```ts
import Decimal from "decimal.js";

export function convert(
  amount: number | string,
  rate: number,
  options?: { precision?: number; roundingMode?: Decimal.Rounding },
): string {
  const a = new Decimal(amount);
  const r = new Decimal(rate);
  return a.times(r).toFixed(options?.precision ?? 4, options?.roundingMode ?? Decimal.ROUND_HALF_EVEN);
}
```

**原因**:JS 原生浮点会让 `0.1 + 0.2 = 0.30000000000000004`。对财务场景必须用 `decimal.js` / `big.js`。

### 6.2 月度三种汇率

```ts
export function computeMonthlyRates(series: Record<string, number>) {
  const dates = Object.keys(series).sort();
  const values = dates.map(d => series[d]);

  return {
    opening: values[0],                                         // 月初
    closing: values[values.length - 1],                         // 月末
    average: values.reduce((a, b) => a + b, 0) / values.length, // 平均(算术)
    min: Math.min(...values),
    max: Math.max(...values),
    volatility: standardDeviation(values) / average(values),    // 变异系数
  };
}
```

### 6.3 历史分位计算(D3)

```ts
export function computePercentile(
  currentRate: number,
  series: Record<string, number>,
): { percentile: number; context: string } {
  const values = Object.values(series).sort((a, b) => a - b);
  const belowCount = values.filter(v => v < currentRate).length;
  const percentile = (belowCount / values.length) * 100;

  let context: string;
  if (percentile >= 80) context = "处于历史偏高位置(> 80 分位)";
  else if (percentile >= 60) context = "偏高";
  else if (percentile >= 40) context = "中位";
  else if (percentile >= 20) context = "偏低";
  else context = "处于历史偏低位置(< 20 分位)";

  return { percentile, context };
}
```

### 6.4 结算周期取数

```ts
export async function getSettlementRate(
  preset: PlatformPreset,
  settlementDate: Date,
  targetCurrency: string,
): Promise<{ officialRate: number; effectiveRate: number; spread: number }> {
  const endDate = settlementDate;
  const startDate = subDays(settlementDate, preset.settlementCycleDays);

  const series = await fetchTimeSeries(
    formatISO(startDate, { representation: "date" }),
    formatISO(endDate, { representation: "date" }),
    preset.settlementCurrency,
    [targetCurrency],
  );

  const rates = Object.values(series.rates).map(r => r[targetCurrency]);

  let officialRate: number;
  switch (preset.settlementMethod) {
    case "average": officialRate = average(rates); break;
    case "closing": officialRate = rates[rates.length - 1]; break;
    case "daily": officialRate = rates[rates.length - 1]; break; // 占位,实际按日汇率逐日换算
  }

  const markup = preset.platformFxMarkupRange
    ? (preset.platformFxMarkupRange[0] + preset.platformFxMarkupRange[1]) / 2
    : 0;
  const effectiveRate = officialRate * (1 - markup);

  return {
    officialRate,
    effectiveRate,
    spread: officialRate - effectiveRate,
  };
}
```

---

## 七、缓存策略

### 三层缓存

| 层 | 位置 | TTL | 用途 |
|---|---|---|---|
| L1 | TanStack Query 内存 | 5 分钟 staleTime | 页面内去重 |
| L2 | localStorage | 24 小时 | 跨 session 复用 |
| L3 | Frankfurter CDN | 24 小时 | 兜底,全网共享 |

### L2 实现(`src/lib/cache.ts`)

```ts
const CACHE_PREFIX = "fxh:v1:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return value as T;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ value, expiry: Date.now() + ttlMs }),
    );
  } catch (e) {
    // localStorage 满时自动清理最旧的
    cleanupOldEntries();
  }
}
```

**历史日汇率**(1999-至今)一旦取到永不过期(历史数据不变);**最新汇率**24h 过期。

---

## 八、CSV 处理(Web Worker)

避免大文件阻塞主线程。

```ts
// src/workers/csv-processor.ts
import Papa from "papaparse";

self.addEventListener("message", async (e) => {
  const { file, targetCurrency, rateMap } = e.data;

  const rows: ProcessedRow[] = [];
  let processed = 0;

  Papa.parse(file, {
    header: true,
    step: (row) => {
      const { date, amount, from_currency } = row.data;
      const rate = rateMap[`${date}:${from_currency}:${targetCurrency}`];
      if (rate) {
        rows.push({ ...row.data, [`${targetCurrency}_amount`]: amount * rate });
      }
      processed++;
      if (processed % 100 === 0) {
        self.postMessage({ type: "progress", processed });
      }
    },
    complete: () => self.postMessage({ type: "done", rows }),
  });
});
```

**预取策略**:解析第一遍,提取所有独特的 `(date, from_currency, target_currency)` 三元组,批量请求 Frankfurter `time_series` 合并成 `rateMap`,再第二遍做换算。请求次数从 N 降到 ~1-5 次。

---

## 九、PDF 导出(月度报表)

```tsx
// src/lib/pdf/monthly-report.tsx
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Noto Sans SC",
  src: "/fonts/NotoSansSC-Regular-subset.ttf",
});

const styles = StyleSheet.create({ /* ... */ });

export function MonthlyReportPDF({ report }: { report: MonthlyReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{report.month} 跨境收入汇率对账单</Text>
        <Text style={styles.subtitle}>
          数据源:European Central Bank via frankfurter.dev
        </Text>
        <View style={styles.table}>{/* ... */}</View>
        <Text style={styles.disclaimer}>
          ⚠️ 本报表基于 ECB 参考中间价,仅供内部核算参考,不构成法定税务凭证。
          中国境内税务核算应以中国人民银行公布的人民币汇率中间价为准。
        </Text>
      </Page>
    </Document>
  );
}
```

**字体策略**:思源黑体完整版 ~10MB 太大。预先生成「常用 3000 字 + ASCII + 财务符号」子集 ~600KB,懒加载(只在点击"导出 PDF"时 fetch)。

---

## 十、路由参数设计(分享)

| 参数 | 用途 | 示例 |
|---|---|---|
| `from` | 源币种 | `USD` |
| `to` | 目标币种 | `CNY`(逗号分隔多个)|
| `amount` | 金额 | `100` |
| `date` | 日期 | `2025-03-15` |
| `period` | 时间范围(趋势图)| `1y` / `3y` / `5y` / `custom` |
| `start` / `end` | 自定义区间 | `2020-01-01` / `2025-12-31` |
| `platform` | 平台预设 | `amazon-us` |
| `lang` | 语言 | `zh` / `en` |

**实现**:`nuqs` 库做 URL 参数和组件状态的双向绑定,无需手写 router 逻辑。

---

## 十一、SEO 与 meta 策略

### 静态页面(SEO 关键)

- `/` 首页 → "跨境卖家免费汇率工具"
- `/usd-to-cny` → "美元兑人民币汇率查询 · 历史汇率 · 1999 至今"
- `/eur-to-cny`, `/gbp-to-cny`, `/jpy-to-cny`, `/hkd-to-cny` → 各自 SEO 落地页
- `/platform/amazon-currency` → "Amazon 收款汇率 · 实际到账计算器"
- `/report/monthly` → "跨境电商月度对账汇率表"

每个页面独立 metadata + 结构化数据(`schema.org/CurrencyConversionService`)。

### Open Graph

每次查询动态生成分享卡片(用 Vercel OG Image API),`fx-history.com/usd-to-cny?amount=100` 分享到微信 / Twitter 显示"100 美元 = ¥720 @2026-04-17"卡片。

---

## 十二、监控和观测

| 指标 | 工具 | 用途 |
|---|---|---|
| 页面访问 / 停留 | Vercel Analytics(免费) | PV/UV |
| Web Vitals | Vercel Speed Insights | 性能监控 |
| 客户端错误 | Sentry(免费档 5k events/mo) | 线上 bug |
| API 请求失败率 | Sentry + 自定义事件 | Frankfurter 健康度 |
| 核心转化 | 自埋事件(导出 PDF / 生成报表 / 分享链接) | North Star 指标 |

**不做**:Google Analytics(隐私)/ 付费 APM。

---

## 十三、测试策略

### 单元测试(Vitest)

- `fx-math.test.ts`:换算、月度汇率、分位数计算(覆盖边界,特别是闰年 / 单日数据 / 单点数据)
- `date-utils.test.ts`:节假日回退、时区问题
- `platform-presets.test.ts`:各平台结算日期计算

### 组件测试(Testing Library)

- Converter 核心输入输出
- DatePicker 未来日期 / 过早日期禁用
- CurrencyPicker 搜索 / 筛选

### 端到端(Playwright,v1.1 后加)

- 首页 → 单次换算 → 分享链接 → 打开链接能看到同样结果
- CSV 上传 → 报表生成 → PDF 导出

**不做**:完整 E2E 覆盖率(纯前端单体,手动回归即可)。

---

## 十四、部署与发布

### 首发

```bash
pnpm install
pnpm build
vercel deploy --prod
```

- 域名:`fx-history.com`(待注册)/ 中文备用域名 `跨境汇率.com`
- CDN:Vercel 默认边缘网络
- SSL:自动

### 回滚策略

- Vercel 自带 deploy preview,每次部署都有回滚按钮
- 若 Frankfurter API 挂了 → 显示全局 banner "数据源维护中,使用本地 24h 缓存" + fallback 到 `cache.ts` 返回的过期数据

---

## 十五、开发阶段拆分

> 每个阶段结束可以独立跑起来,循序渐进。

### 阶段 0 · 工程初始化(0.5 天)

- 脚手架:`pnpm create next-app`
- 装 shadcn/ui + Tailwind
- biome + tsconfig
- Vercel 连接 + 首次部署成功

### 阶段 1 · API 封装和缓存(1 天)

- `lib/frankfurter.ts` + `lib/cache.ts`
- `hooks/use-latest-rates.ts` + `use-historical-rate.ts`
- 单元测试覆盖

### 阶段 2 · A 模块(单次换算)(1-2 天)

- A1 / A2 / A3
- CurrencyPicker / DatePicker 共用组件
- URL 参数分享

### 阶段 3 · B 模块(平台预设)(2-3 天)

- `platform-presets.ts` 数据完整
- B1 / B2 UI
- 跟卖家访谈核对数值(可发小范围 demo 让朋友用)

### 阶段 4 · C 模块(CSV / 报表)(3-4 天)

- Web Worker 集成
- Papa Parse 测试 1 万 / 10 万行场景
- PDF 模板 + 中文字体子集

### 阶段 5 · D 模块(趋势图)(2 天)

- Recharts 集成
- 历史分位 UI

### 阶段 6 · F 模块 + SEO(2 天)

- 首页 / 落地页 SEO
- OG 动态卡片
- 国际化 zh / en

### 阶段 7 · 内测 + 上线(2-3 天)

- 自己真实场景用一周
- 找 3-5 个跨境卖家朋友试用
- 修 bug
- 上线

**合计约 2-3 周,单人全职工作量。** 可以边做边上线各阶段,不用等全部完成。

---

## 十六、未来路径(v2 预告)

| 功能 | 需要什么 |
|---|---|
| 邮件订阅 | 薄后端 + Resend + Cron |
| 浏览器扩展 | Manifest V3,选中数字换算 |
| 企业账号 / 团队共享 | Supabase 或 Clerk + 后端 API |
| 更多货币(RUB / AED 等)| 引入第二数据源(exchangerate.host 或 OpenExchangeRates) |
| AI 汇率分析问答 | Claude API,接入用户的历史数据做问答 |

以上都需要**突破纯前端架构**,但只要 v1 纯前端版积累了种子用户,后端付费服务可以慢慢加,种子用户已经是最有力的验证。

---

## 十七、TODO / 待定

- [ ] 域名选择与注册
- [ ] Logo / 品牌视觉
- [ ] 是否引入"离岸人民币 CNH"(ECB 只有 CNY 在岸,CNH 需要补数据源)
- [ ] PWA 支持(离线查历史汇率)
- [ ] 是否搞一个简单的 changelog 订阅(RSS / 邮件)

---

**下一步**:看完 PRD 和 TECH 如果没问题,可以直接开始 `阶段 0 · 工程初始化`。
