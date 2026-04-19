import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeftRight,
  Coins,
  Target,
  Building2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  LineChart,
  CheckCircle2,
  Lock,
  Database,
  Gift,
  FileWarning,
  Calculator,
  ClipboardList,
  Scissors,
  Flame,
} from "lucide-react";

const EXCLUSIVES = [
  {
    icon: Scissors,
    label: "平台汇差对比",
    badge: "业内首创",
    desc: "ECB 中间价 vs Amazon / Shopify / PayPal 实到",
    href: "/platform",
  },
  {
    icon: TrendingUp,
    label: "毛利敏感度",
    badge: "独家",
    desc: "算出汇率跌到哪里 SKU 开始翻车",
    href: "/margin",
  },
  {
    icon: FileText,
    label: "多平台月度合并",
    badge: "独家",
    desc: "美欧日多币种收入一键合并 + 汇差扣减",
    href: "/report",
  },
  {
    icon: Clock,
    label: "最佳结算窗口",
    badge: "独家",
    desc: "本周期高低点 · 该等还是该提,直接告诉你",
    href: "/window",
  },
  {
    icon: LineChart,
    label: "历史分位锁汇参考",
    badge: "独家",
    desc: "当前汇率在过去 N 年的百分位,用数据代替直觉",
    href: "/trend",
  },
];

const PAIN_POINTS = [
  {
    icon: ClipboardList,
    title: "月末对账人头崩",
    desc: "Amazon 美 + 欧 + 日 + 独立站,多币种收入要一笔笔换算到凌晨",
    cta: "用月度报表一键合并",
    href: "/report",
  },
  {
    icon: FileWarning,
    title: "平台吃汇差不透明",
    desc: "PayPal / Amazon 结算的钱总比外面低,但不知道平台到底从你这儿扒走多少",
    cta: "看看平台扒了你多少",
    href: "/platform",
  },
  {
    icon: Calculator,
    title: "工厂报价算到头大",
    desc: "1688 报完人民币成本,Amazon 要定多少美元才能保毛利?反复套公式累死",
    cta: "试试反向定价",
    href: "/reverse",
  },
  {
    icon: LineChart,
    title: "锁汇时机凭感觉",
    desc: "手里一笔美元,现在结汇还是再等等?靠直觉容易错过好窗口",
    cta: "看当前处于历史几分位",
    href: "/trend",
  },
  {
    icon: TrendingUp,
    title: "毛利暗雷看不见",
    desc: "看起来赚钱的 SKU,汇率一跌就变亏损,定价时不知道安全边际在哪",
    cta: "算出盈亏平衡汇率",
    href: "/margin",
  },
];

const TOOL_GROUPS = [
  {
    title: "日常换算",
    desc: "最基础的 3 个,替代你在浏览器里 Google 汇率的动作",
    tools: [
      {
        href: "/convert",
        icon: ArrowLeftRight,
        label: "单次换算",
        desc: "任意日期 + 任意货币对 · 周末自动回退",
      },
      {
        href: "/multi",
        icon: Coins,
        label: "一币对多币",
        desc: "1 个源币同时换 5 个目标币 · 适合多站定价",
      },
      {
        href: "/reverse",
        icon: Target,
        label: "反向定价",
        desc: "给定期望到手金额 · 反推最低定价",
      },
    ],
  },
  {
    title: "平台分析 · 核心差异化",
    desc: "跨境卖家独家刚需,通用汇率工具从不做的",
    tools: [
      {
        href: "/platform",
        icon: Building2,
        label: "平台结算",
        desc: "ECB 中间价 vs 平台实到 · 看清汇差",
        exclusive: true,
      },
      {
        href: "/window",
        icon: Clock,
        label: "结算窗口",
        desc: "本周期高低点 · 判断手动提现时机",
        exclusive: true,
      },
      {
        href: "/margin",
        icon: TrendingUp,
        label: "毛利敏感度",
        desc: "汇率跌到哪里 SKU 开始翻车",
        exclusive: true,
      },
    ],
  },
  {
    title: "批量 · 报表",
    desc: "月末和季度对账的效率工具",
    tools: [
      {
        href: "/batch",
        icon: FileSpreadsheet,
        label: "CSV 批量",
        desc: "上传对账单 · 一次性按每行日期换算",
      },
      {
        href: "/report",
        icon: FileText,
        label: "月度报表",
        desc: "多平台合并 + 三口径 + 上月对比 + 打印 PDF",
        exclusive: true,
      },
      {
        href: "/trend",
        icon: LineChart,
        label: "历史趋势",
        desc: "长期曲线 + 当前处于历史几分位",
      },
    ],
  },
];

const PAID_ALTERNATIVES = [
  {
    category: "汇率 API + 历史",
    solutions: "XE Data · OpenExchangeRates · Fixer · CurrencyLayer",
    price: "$12 - $297 / 月",
    priceYear: "约 ¥1,000 - ¥25,000 / 年",
  },
  {
    category: "跨境多平台对账 ERP",
    solutions: "马帮 ERP · 店小秘 · 易仓 · 旺店通跨境",
    price: "¥300 - ¥3,600 / 月",
    priceYear: "¥3,600 - ¥43,200 / 年",
  },
  {
    category: "Amazon 平台分析套件",
    solutions: "Helium 10 · Jungle Scout · SellerApp",
    price: "$39 - $399 / 月",
    priceYear: "约 ¥3,500 - ¥35,000 / 年",
  },
  {
    category: "类目情报",
    solutions: "SmartScout · Sellegr8",
    price: "$187 - $499 / 月",
    priceYear: "约 ¥16,000 - ¥43,000 / 年",
  },
  {
    category: "平台汇差识别",
    solutions: "无现成工具 · 只能人工逐笔核对",
    price: "人工 · 几小时 / 月",
    priceYear: "时间成本不可量化",
  },
  {
    category: "毛利汇率敏感度",
    solutions: "Excel 自建模型",
    price: "学习 + 维护",
    priceYear: "时间成本 + 模型过时",
  },
  {
    category: "金融级汇率分析",
    solutions: "Bloomberg · Reuters Eikon",
    price: "$1,500+ / 月",
    priceYear: "约 ¥130,000+ / 年",
  },
];

const TRUST_ITEMS = [
  {
    icon: Database,
    title: "欧洲央行官方数据",
    desc: "每工作日欧洲中部时间 16:00 更新,已稳定运行 25+ 年",
  },
  {
    icon: Lock,
    title: "纯浏览器运算",
    desc: "你上传的 CSV、金额、商品数据全部在本地处理,不上传服务器",
  },
  {
    icon: Gift,
    title: "永久免费",
    desc: "数据源免费 + Vercel 免费托管 · 无订阅、无广告、无账号",
  },
  {
    icon: CheckCircle2,
    title: "30 种主流货币",
    desc: "覆盖美 / 欧 / 英 / 日 / 港 / 新加坡 / 东南亚主流等跨境市场",
  },
];

const FAQS = [
  {
    q: "这个工具能代替我的会计报表吗?",
    a: "不能。中国境内税务申报必须以中国人民银行中间价为准。本工具适合做内部管理报表、对账参考、卖家视角核算。",
  },
  {
    q: "数据只有到 1999 年?更早的需要咋办?",
    a: "欧洲央行从 1999 年欧元启用当天开始发布参考汇率。1999 年以前建议用各国央行官方历史档案,不是免费可 API 调用的形式。",
  },
  {
    q: "为什么没有离岸人民币 CNH?",
    a: "ECB 只发布 CNY 在岸价。CNY 与 CNH 差异通常在 0.1-0.5% 之内,管理报表参考足够。需要精确 CNH 请用券商或银行渠道。",
  },
  {
    q: "和 XE / OANDA 有啥不一样?",
    a: "XE / OANDA 是通用汇率工具。我们专门为跨境电商卖家设计:平台结算周期预设、毛利敏感度、月度对账 PDF、平台汇差对比 —— 这些 XE 都不做。",
  },
  {
    q: "平台汇差数值是怎么来的?",
    a: "基于各平台公开文档(如 Amazon ACCS 0.75-1.5%)+ 业内实测共识。UI 明确标注『参考』,实际以你账户收到为准。数值会持续更新维护。",
  },
  {
    q: "工具做得这么多,到底选哪个?",
    a: "月末核账 → 月度报表;想看平台扒多少 → 平台结算;新品定价 → 毛利分析 + 反向定价;决定锁汇 → 历史趋势 + 结算窗口。不确定就从单次换算开始。",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-4 md:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-xs font-medium">
          🇨🇳 跨境卖家专用 · 基于欧洲央行数据 · 永久免费
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          跨境电商卖家的免费汇率工具箱
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted-foreground)]">
          <span className="font-semibold text-[var(--color-foreground)]">9 个工具</span>{" "}
          覆盖:换算 / 月度对账 / 平台汇差 / 毛利分析 / 锁汇参考。同行要组合{" "}
          <span className="font-semibold text-[var(--color-foreground)]">
            2-3 家付费订阅 · ¥25,000 - ¥170,000/年
          </span>{" "}
          才能凑齐,这里
          <span className="font-semibold text-[var(--color-foreground)]">
            永久免费
          </span>
          。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/convert">
            <Button size="lg">
              立即换算 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/platform">
            <Button size="lg" variant="outline">
              看看 Amazon 扒了你多少
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:grid-cols-4">
          <Stat label="支持货币" value="30 种" />
          <Stat label="历史数据" value="1999 至今" />
          <Stat label="工具数量" value="9 个" />
          <Stat label="费用" value="永久免费" />
        </div>
      </section>

      {/* Exclusive capabilities strip */}
      <section>
        <SectionTitle
          eyebrow="🔥 业内独家"
          title="别的免费工具都不做的 5 件事"
          desc="XE / OANDA / Wise / Google 汇率 / Amazon Currency Converter 都不做 —— 这是我们存在的理由"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXCLUSIVES.map((e) => {
            const Icon = e.icon;
            return (
              <Link
                key={e.label}
                href={e.href}
                className="group rounded-xl border-2 border-[var(--color-accent)]/30 bg-gradient-to-br from-amber-50 to-white p-4 transition-all hover:border-[var(--color-accent)] hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-[var(--color-accent)] p-2 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    <Flame className="mr-0.5 inline h-3 w-3" />
                    {e.badge}
                  </span>
                </div>
                <div className="mt-3 font-semibold text-gray-900">
                  {e.label}
                </div>
                <p className="mt-1 text-sm text-gray-600">{e.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]">
                  立即体验 <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Paid alternative comparison */}
      <section>
        <SectionTitle
          eyebrow="💸 市场行情"
          title="别人同类工具卖多少钱"
          desc="如果要买齐我们这些功能,你至少得订阅这些付费服务"
        />
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-left">
                <th className="px-3 py-3">能力</th>
                <th className="px-3 py-3">市场付费方案</th>
                <th className="px-3 py-3 text-right">月费</th>
                <th className="px-3 py-3 text-right">年费</th>
                <th className="px-3 py-3 text-center font-semibold bg-green-600 text-white">
                  FXHistory
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-[var(--color-border)]">
              {PAID_ALTERNATIVES.map((p) => (
                <tr key={p.category}>
                  <td className="px-3 py-3 font-medium">{p.category}</td>
                  <td className="px-3 py-3 text-[var(--color-muted-foreground)]">
                    {p.solutions}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-red-500">
                    {p.price}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-xs text-[var(--color-muted-foreground)]">
                    {p.priceYear}
                  </td>
                  <td className="px-3 py-3 text-center bg-green-600/10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      免费
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-semibold">
                <td className="px-3 py-4 text-[var(--color-foreground)]">
                  买齐全套 · 保守估算
                </td>
                <td className="px-3 py-4 text-[var(--color-muted-foreground)] text-xs">
                  以上多工具组合订阅
                </td>
                <td className="px-3 py-4 text-right font-mono text-red-500">
                  $300 - $2,000+ / 月
                </td>
                <td className="px-3 py-4 text-right font-mono text-red-500">
                  约 ¥25,000 - ¥170,000 / 年
                </td>
                <td className="px-3 py-4 text-center bg-green-600/20">
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                    永久 ¥0
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-[var(--color-muted-foreground)] sm:grid-cols-2">
          <div className="flex items-start gap-1">
            <span className="text-amber-600">⚠️</span>
            <span>
              价格区间来自各厂商公开定价 2026-Q1 数据 · 订阅档位不同价差较大
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-amber-600">⚠️</span>
            <span>
              并非每家工具与我们完全 1:1 对标,跨境卖家通常要组合 2-3 家订阅才能凑齐功能
            </span>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section>
        <SectionTitle
          eyebrow="你是不是遇到过这些?"
          title="跨境卖家的 5 大汇率痛点"
          desc="如果有一条戳中你,这个工具就是为你做的"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="transition-colors hover:border-[var(--color-accent)]">
                <CardContent className="p-5">
                  <Icon className="h-8 w-8 text-[var(--color-accent)]" />
                  <div className="mt-3 font-semibold">{p.title}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {p.desc}
                  </p>
                  <Link
                    href={p.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tools */}
      <section>
        <SectionTitle
          eyebrow="工具清单"
          title="9 个专项工具,分三组"
          desc="按使用场景拆开,不是 Dashboard 堆砌"
        />
        <div className="space-y-8">
          {TOOL_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-3">
                <div className="font-semibold">{group.title}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {group.desc}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {group.tools.map((t) => {
                  const Icon = t.icon;
                  const isExclusive = "exclusive" in t && t.exclusive;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className={`group relative rounded-xl border bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-muted)] ${
                        isExclusive
                          ? "border-[var(--color-accent)]/40"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {isExclusive && (
                        <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          <Flame className="h-2.5 w-2.5" />
                          独家
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[var(--color-muted)] p-2 group-hover:bg-[var(--color-card)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold">
                            {t.label}
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                            {t.desc}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section>
        <SectionTitle
          eyebrow="对比同类工具"
          title="为什么选我们"
          desc="同价位(免费)下,功能最完整的跨境卖家专用版"
        />
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                <th className="px-3 py-3 text-left">功能</th>
                <th className="px-3 py-3 text-center">XE / OANDA</th>
                <th className="px-3 py-3 text-center">Wise Calculator</th>
                <th className="px-3 py-3 text-center">Amazon Converter</th>
                <th className="px-3 py-3 text-center font-semibold bg-green-600 text-white">
                  🔥 FXHistory
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-[var(--color-border)]">
              <CompareRow label="历史汇率(1999 起)" us />
              <CompareRow label="30 种主流货币" xe wise us />
              <CompareRow label="平台汇差对比" us />
              <CompareRow label="CSV 批量换算" us />
              <CompareRow label="月度多平台合并 PDF" us />
              <CompareRow label="毛利汇率敏感度" us />
              <CompareRow label="历史分位 / 锁汇参考" us />
              <CompareRow label="中文 + 移动端优先" us />
              <CompareRow label="永久免费无订阅" wise amazon us />
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust */}
      <section>
        <SectionTitle
          eyebrow="你可以放心用"
          title="数据和隐私"
          desc="我们只做一件事:把官方数据做成你能用的样子"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.title}>
                <CardContent className="p-5">
                  <Icon className="h-7 w-7 text-[var(--color-accent)]" />
                  <div className="mt-3 font-semibold">{t.title}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {t.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <SectionTitle
          eyebrow="常见问题"
          title="你可能想问"
          desc="用之前心里先有个底"
        />
        <div className="space-y-2">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 open:border-[var(--color-accent)]"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-muted)] text-xs group-open:bg-[var(--color-accent)] group-open:text-white">
                  Q
                </span>
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-muted)] to-[var(--color-card)] p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            准备好用数据代替猜测了吗?
          </h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            不用注册、不用装软件、不用掏钱。打开浏览器就能用。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/convert">
              <Button size="lg">开始换算</Button>
            </Link>
            <Link href="/report">
              <Button size="lg" variant="outline">
                生成月度报表
              </Button>
            </Link>
            <Link href="/platform">
              <Button size="lg" variant="outline">
                对比平台汇差
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-2xl font-bold md:text-3xl">{title}</h2>
      {desc && (
        <p className="mt-1 text-[var(--color-muted-foreground)]">{desc}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-xs text-[var(--color-muted-foreground)]">
        {label}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  xe,
  wise,
  amazon,
  us,
}: {
  label: string;
  xe?: boolean;
  wise?: boolean;
  amazon?: boolean;
  us?: boolean;
}) {
  return (
    <tr>
      <td className="px-3 py-2.5">{label}</td>
      <Cell filled={xe} />
      <Cell filled={wise} />
      <Cell filled={amazon} />
      <Cell filled={us} highlight />
    </tr>
  );
}

function Cell({ filled, highlight }: { filled?: boolean; highlight?: boolean }) {
  return (
    <td
      className={`px-3 py-2.5 text-center ${
        highlight ? "bg-green-600/10" : ""
      }`}
    >
      {filled ? (
        <CheckCircle2
          className={`inline h-4 w-4 ${
            highlight ? "text-green-500" : "text-green-600"
          }`}
        />
      ) : (
        <span className="text-[var(--color-muted-foreground)]">—</span>
      )}
    </td>
  );
}
