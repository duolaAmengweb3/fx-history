import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FXHistory · 跨境卖家免费汇率工具",
    template: "%s · FXHistory",
  },
  description:
    "跨境电商卖家专用:历史汇率查询、平台结算周期、CSV 批量换算、月度对账报表。基于欧洲央行 ECB 数据,永久免费。",
  keywords: [
    "汇率",
    "历史汇率",
    "跨境电商",
    "Amazon 汇率",
    "Shopify 汇率",
    "人民币",
    "美元",
  ],
  openGraph: {
    title: "FXHistory · 跨境卖家免费汇率工具",
    description:
      "历史汇率 + 平台结算 + CSV 批量 + 月度对账 · 基于 ECB,永久免费",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Sidebar />
          <div className="md:pl-60">
            <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-8 md:py-8">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
