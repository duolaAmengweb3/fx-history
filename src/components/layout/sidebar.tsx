"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Coins,
  Target,
  Building2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  LineChart,
  HelpCircle,
  Menu,
  X as CloseIcon,
  Phone,
  Home,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = { title: string; items: NavItem[] };

const TOP_ITEM: NavItem = { href: "/", label: "首页", icon: Home };

const NAV: NavGroup[] = [
  {
    title: "换算",
    items: [
      { href: "/convert", label: "单次换算", icon: ArrowLeftRight },
      { href: "/multi", label: "一币对多币", icon: Coins },
      { href: "/reverse", label: "反向定价", icon: Target },
    ],
  },
  {
    title: "平台分析",
    items: [
      { href: "/platform", label: "平台结算", icon: Building2 },
      { href: "/window", label: "结算窗口", icon: Clock },
      { href: "/margin", label: "毛利分析", icon: TrendingUp },
    ],
  },
  {
    title: "批量 · 报表",
    items: [
      { href: "/batch", label: "CSV 批量", icon: FileSpreadsheet },
      { href: "/report", label: "月度报表", icon: FileText },
    ],
  },
  {
    title: "参考 · 帮助",
    items: [
      { href: "/trend", label: "历史趋势", icon: LineChart },
      { href: "/help", label: "帮助", icon: HelpCircle },
    ],
  },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M8.686 2c-4.784 0-8.655 3.226-8.655 7.203 0 2.296 1.305 4.334 3.32 5.666l-.83 2.497 2.904-1.456c.928.273 1.91.496 2.956.496.246 0 .488-.01.73-.03-.16-.502-.246-1.028-.246-1.573 0-3.328 2.892-6.028 6.466-6.028.16 0 .32.006.48.017C15.202 4.764 12.22 2 8.686 2zM5.92 6.563c.56 0 1.013.453 1.013 1.013 0 .56-.453 1.013-1.013 1.013-.56 0-1.014-.453-1.014-1.013 0-.56.454-1.013 1.014-1.013zm5.535 0c.56 0 1.014.453 1.014 1.013 0 .56-.454 1.013-1.014 1.013-.56 0-1.013-.453-1.013-1.013 0-.56.453-1.013 1.013-1.013zM15.38 9.928c-3.287 0-5.954 2.38-5.954 5.316 0 2.937 2.667 5.317 5.954 5.317.686 0 1.353-.11 1.973-.3l2.427 1.22-.7-2.088c1.67-1.106 2.254-2.646 2.254-4.15 0-2.935-2.667-5.315-5.954-5.315zM13.5 12.2c.467 0 .845.378.845.845 0 .466-.378.844-.845.844-.466 0-.844-.378-.844-.844 0-.467.378-.845.844-.845zm3.76 0c.467 0 .845.378.845.845 0 .466-.378.844-.845.844-.466 0-.844-.378-.844-.844 0-.467.378-.845.844-.845z" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <Link
      href="/"
      className="flex items-center gap-3"
      onClick={() => setMobileOpen(false)}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white">
        <Image
          src="/logo.png"
          alt="FXHistory"
          fill
          sizes="40px"
          className="object-cover"
          priority
        />
      </div>
      <div>
        <div className="font-bold leading-tight">FXHistory</div>
        <div className="text-xs text-[var(--color-muted-foreground)]">
          跨境汇率工具
        </div>
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/90 px-4 py-2 backdrop-blur md:hidden">
        {brand}
        <button
          type="button"
          aria-label="菜单"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 hover:bg-[var(--color-muted)]"
        >
          {mobileOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] transition-transform duration-200",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-[var(--color-border)] px-4 py-4">
          {brand}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4">
            {(() => {
              const Icon = TOP_ITEM.icon;
              const active = pathname === TOP_ITEM.href;
              return (
                <Link
                  href={TOP_ITEM.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "hover:bg-[var(--color-muted)]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{TOP_ITEM.label}</span>
                </Link>
              );
            })()}
          </div>
          {NAV.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                          : "hover:bg-[var(--color-muted)]",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
          <div className="mb-2 font-semibold text-[var(--color-foreground)]">
            联系 / 反馈
          </div>
          <div className="space-y-1.5">
            <a
              href="https://x.com/BSCKing001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-[var(--color-muted)]"
              title="X: @BSCKing001"
            >
              <XIcon className="h-3.5 w-3.5" />
              <span>@BSCKing001</span>
            </a>
            <a
              href="tel:13777586836"
              className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-[var(--color-muted)]"
              title="电话 / 微信同号"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>13777586836</span>
            </a>
            <div className="flex items-center gap-2 px-1 py-1">
              <WeChatIcon className="h-3.5 w-3.5" />
              <span>微信同号</span>
            </div>
          </div>
          <div className="mt-3 border-t border-[var(--color-border)] pt-2">
            数据:
            <a
              href="https://frankfurter.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              ECB · Frankfurter
            </a>
          </div>
          <div className="mt-1">⚠️ 参考中间价,非税务凭证</div>
        </div>
      </aside>
    </>
  );
}
