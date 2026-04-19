export type SettlementMethod = "average" | "closing" | "daily";

export interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  icon: string;
  settlementCurrency: string;
  settlementCycleDays: number;
  settlementMethod: SettlementMethod;
  platformFxMarkupRange: [number, number];
  payoutDelayDays: number;
  notes?: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "amazon-us",
    name: "Amazon 美国 · FBA",
    platform: "Amazon",
    icon: "🇺🇸",
    settlementCurrency: "USD",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 7,
    notes:
      "Amazon Currency Converter for Sellers(ACCS)在中间价上加 0.75%-1.5%。第三方收款(Payoneer / Wise)可规避。",
  },
  {
    id: "amazon-eu-de",
    name: "Amazon 欧洲 · 德国",
    platform: "Amazon",
    icon: "🇩🇪",
    settlementCurrency: "EUR",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 5,
  },
  {
    id: "amazon-eu-uk",
    name: "Amazon 英国",
    platform: "Amazon",
    icon: "🇬🇧",
    settlementCurrency: "GBP",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 5,
  },
  {
    id: "amazon-jp",
    name: "Amazon 日本",
    platform: "Amazon",
    icon: "🇯🇵",
    settlementCurrency: "JPY",
    settlementCycleDays: 14,
    settlementMethod: "average",
    platformFxMarkupRange: [0.0075, 0.015],
    payoutDelayDays: 5,
  },
  {
    id: "shopify-payments-us",
    name: "Shopify Payments · 美国",
    platform: "Shopify",
    icon: "🛒",
    settlementCurrency: "USD",
    settlementCycleDays: 2,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.015, 0.02],
    payoutDelayDays: 2,
    notes: "Shopify 的货币兑换服务加收 1.5%-2% 汇差。",
  },
  {
    id: "stripe-us",
    name: "Stripe · 美国",
    platform: "Stripe",
    icon: "💳",
    settlementCurrency: "USD",
    settlementCycleDays: 2,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.01, 0.02],
    payoutDelayDays: 2,
  },
  {
    id: "paypal",
    name: "PayPal · 手动提现",
    platform: "PayPal",
    icon: "💙",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.025, 0.04],
    payoutDelayDays: 3,
    notes:
      "PayPal 汇差为行业最高。建议以美元提现到 Wise / Payoneer 后再结汇,可节省 ~3%。",
  },
  {
    id: "wise-business",
    name: "Wise Business",
    platform: "Wise",
    icon: "💚",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.0035, 0.006],
    payoutDelayDays: 0,
    notes: "Wise 使用市场中间价 + 透明手续费,目前汇率最友好。",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    platform: "Payoneer",
    icon: "🧡",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "closing",
    platformFxMarkupRange: [0.02, 0.03],
    payoutDelayDays: 1,
    notes: "Payoneer 提现到中国账户约 2-3% 汇损。",
  },
  {
    id: "tiktok-shop-us",
    name: "TikTok Shop · 美国",
    platform: "TikTok",
    icon: "🎵",
    settlementCurrency: "USD",
    settlementCycleDays: 7,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.01, 0.02],
    payoutDelayDays: 10,
  },
  {
    id: "tiktok-shop-uk",
    name: "TikTok Shop · 英国",
    platform: "TikTok",
    icon: "🎵",
    settlementCurrency: "GBP",
    settlementCycleDays: 7,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.01, 0.02],
    payoutDelayDays: 10,
  },
  {
    id: "etsy",
    name: "Etsy",
    platform: "Etsy",
    icon: "🧶",
    settlementCurrency: "USD",
    settlementCycleDays: 0,
    settlementMethod: "daily",
    platformFxMarkupRange: [0.025, 0.025],
    payoutDelayDays: 3,
    notes: "Etsy 固定收取 2.5% 汇率转换费。",
  },
];

export function getPreset(id: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find((p) => p.id === id);
}

export function averageMarkup(preset: PlatformPreset): number {
  const [lo, hi] = preset.platformFxMarkupRange;
  return (lo + hi) / 2;
}
