# FXHistory · 跨境电商卖家的免费汇率工具箱

> 9 个工具覆盖:换算 / 月度对账 / 平台汇差 / 毛利分析 / 锁汇参考。
> 同行要组合 2-3 家付费订阅(¥25,000 - ¥170,000/年)才能凑齐的功能,这里永久免费。

**🌐 线上使用**: https://fx-history-sandy.vercel.app/

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Data](https://img.shields.io/badge/Data-ECB%20via%20Frankfurter-orange)](https://frankfurter.dev)

---

## 为什么做这个

通用汇率工具(XE / Google / Wise Calculator)给你一个数字。跨境电商卖家要的是**能用于具体工作场景的决策依据**:

- 月末对账:Amazon 美欧日 + TikTok Shop 多币种收入,要按当月汇率合并成人民币
- 平台汇差:Amazon Currency Converter / PayPal / Shopify 到账总比外面低,差多少、能不能换渠道
- 毛利敏感度:给新品定价时,汇率跌到 6.5 / 6.0 SKU 还赚不赚钱
- 锁汇参考:手里一笔美元,现在结汇还是再等等,用历史分位代替凭感觉
- 批量换算:Amazon 月度对账单几百行,要逐笔按当日汇率换人民币

这些**通用工具都不做**。这个工具把 9 个跨境卖家常用场景做成了一个免费网站。

---

## 功能清单(9 个工具)

### 🔄 日常换算(3 个)

| 页面 | 功能 |
|---|---|
| `/convert` | 单次换算 · 任意日期 + 币种 · 周末节假日自动回退 |
| `/multi` | 一币对多币 · 1 个源币同时换多个目标币 |
| `/reverse` | 反向定价 · 给期望到手金额反推源币种定价 |

### 🔥 平台分析 · 业内独家(3 个)

| 页面 | 功能 |
|---|---|
| `/platform` | 平台结算 · ECB 中间价 vs Amazon / Shopify / PayPal 实到 · 看清汇差 |
| `/window` | 结算窗口 · 本周期高低点 · 立刻结汇 vs 等待均价建议 |
| `/margin` | 毛利敏感度 · 算盈亏平衡汇率 · 汇率跌到哪里 SKU 开始翻车 |

### 📊 批量 · 报表(3 个)

| 页面 | 功能 |
|---|---|
| `/batch` | CSV 批量 · 上传对账单 · 按每行日期换算 |
| `/report` | 月度报表 · 多平台合并 · 三口径 + 上月对比 + 打印 PDF |
| `/trend` | 历史趋势 · 长期曲线 + 当前历史分位 |

### 12 个平台预设

Amazon(美/欧/英/日) · Shopify Payments · Stripe · PayPal · Wise · Payoneer · TikTok Shop(美/英) · Etsy

每个平台预设含:结算周期、结算汇率计算方法、典型汇差百分比、收款延迟天数。

---

## 技术栈

纯前端 · 零后端 · 零数据库。

```
Next.js 16 (App Router) + React 19 + TypeScript 5.7
Tailwind CSS 4 + 自定义 UI 组件
TanStack Query 5 · Zustand · nuqs(URL 状态)
Recharts · Papa Parse(CSV)· decimal.js(高精度)
Vercel 免费档部署
```

数据源:**欧洲央行(ECB)** via [Frankfurter API](https://frankfurter.dev),公开免费无限流。

30 种主流货币,1999-01-04 至今。

---

## 本地开发

```bash
pnpm install
pnpm dev       # 本地开发
pnpm build     # 生产构建
```

打开 http://localhost:3000

---

## 设计原则

1. **纯前端**:用户上传的 CSV / 金额 / 商品数据全部在浏览器内处理,不上传服务器
2. **无账号**:所有功能不需要注册,打开即用
3. **诚实**:每个数据源、每个估算值都标注来源;平台汇差标注"参考",明确说"实际以账户为准"
4. **真实数据**:所有计算都基于 ECB 实时数据,不做任何 mock 或近似

---

## 数据边界

**支持**(ECB 发布):
AUD BRL CAD CHF CNY CZK DKK EUR GBP HKD HUF IDR ILS INR ISK JPY KRW MXN MYR NOK NZD PHP PLN RON SEK SGD THB TRY USD ZAR(30 种)

**不支持**(ECB 不收录):
RUB · TWD · VND · AED · SAR · NGN · EGP

**注意**:
- CNY 是在岸人民币,不是离岸(CNH)。两者差异通常在 0.1-0.5% 之内
- 数据仅供内部管理报表和对账参考,**不作为税务凭证**(中国境内税务应以人民银行中间价为准)
- 平台汇差数值基于平台公开文档 + 行业实测,实际以你账户收到为准

---

## 开源协议

[MIT](./LICENSE) · 汇率数据来自欧洲央行(公共领域)

---

## 联系 / 反馈

- 🅧 X: [@BSCKing001](https://x.com/BSCKing001)
- 📞 电话 / 微信:13777586836
