import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY_META, UNSUPPORTED_CURRENCIES } from "@/lib/constants";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">帮助中心</h1>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          数据来源、使用说明、常见问题
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>数据来源</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-[var(--color-foreground)]">
          <p>
            本工具所有汇率数据来自{" "}
            <a
              href="https://frankfurter.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Frankfurter API
            </a>
            ,上游数据源为{" "}
            <a
              href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              欧洲央行 (ECB) 每日参考汇率
            </a>
            。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>数据时间范围:1999-01-04 至今</li>
            <li>更新频率:每工作日欧洲中部时间 16:00 左右</li>
            <li>不包含周末和 ECB 节假日(UI 自动回退到最近交易日)</li>
            <li>
              ECB 参考汇率为 <b>市场中间价</b>,不等于银行柜台价 / 平台结算价
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>支持的货币({Object.keys(CURRENCY_META).length} 种)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {Object.entries(CURRENCY_META)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([code, m]) => (
                <div
                  key={code}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2"
                >
                  <span className="text-lg">{m.flag}</span>
                  <span className="font-mono font-medium">{code}</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {m.nameZh}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>不支持的货币</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            因 ECB 不发布以下货币汇率,本工具暂不支持。若你主要做这些市场,请结合其他数据源。
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {UNSUPPORTED_CURRENCIES.map((c) => (
              <div
                key={c.code}
                className="rounded-lg border border-dashed border-[var(--color-border)] px-3 py-2"
              >
                <span className="font-mono font-medium">{c.code}</span> ·{" "}
                {c.name}
                <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                  {c.reason}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>常见问题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <FAQ
            q="为什么这个月某一天没有汇率?"
            a="欧洲央行只在欧洲工作日发布汇率,周末和 ECB 节假日(如圣诞、复活节)没有数据。工具会自动回退到最近的交易日,并在 UI 上用徽章标注。"
          />
          <FAQ
            q="我按 Amazon 周结算日 Amazon 给我的汇率和你这里不一样?"
            a="Amazon Currency Converter for Sellers(ACCS)在 ECB 中间价基础上会加 0.75%-1.5% 的汇差作为服务费。『平台结算』页面有专门的差价计算器。若想规避,可以用 Payoneer / Wise 收美元后再结汇。"
          />
          <FAQ
            q="月度报表的三种汇率分别怎么算?"
            a="月初 = 本月首个交易日 ECB 中间价;月末 = 本月最后一个交易日 ECB 中间价;月内平均 = 本月所有交易日中间价的简单算术平均。对账时建议以『月内平均』为主,月末汇率用于资产折算。"
          />
          <FAQ
            q="可以用来做税务申报吗?"
            a="不能。中国境内的税务申报应以中国人民银行公布的人民币汇率中间价为准。本工具基于 ECB 数据,仅供内部管理核算和跨平台对账参考。"
          />
          <FAQ
            q="历史分位怎么看?"
            a="分位数反映当前汇率在历史区间里的高低位置。例如 USD/CNY 在 85 分位,意味着过去这段时间 85% 的交易日汇率都比现在低。一般来说:高位对『有美元收入要结汇』的卖家有利,低位对『需要购汇支付供应商』的进口商有利。这只是事实描述,不构成预测。"
          />
          <FAQ
            q="我的数据安全吗?"
            a="本工具是纯前端应用,你上传的 CSV 文件和填写的金额数字只在你的浏览器内处理,不会上传到任何服务器。关闭页面数据自动消失(除非你保存了 URL 分享链接)。"
          />
          <FAQ
            q="API 会不会收费?"
            a="Frankfurter API 公开免费,无请求上限,基础设施由 Cloudflare CDN 支持。本工具保证永久免费。"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>免责声明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <p>
            本工具提供的汇率数据来自欧洲央行公开发布,仅供参考和教育用途。对于任何基于本工具数据做出的商业、税务或投资决策,作者不承担责任。
          </p>
          <p>
            工具内的"平台汇差"数值基于行业公开实测的通用范围,实际差额以你平台账户实际结算为准。
          </p>
          <p>
            历史分位、波动率等统计指标仅为事实性描述,不构成金融预测或投资建议。汇率涉及多种不可预测因素,过去表现不代表未来走势。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <summary className="cursor-pointer font-medium">{q}</summary>
      <p className="mt-2 text-[var(--color-muted-foreground)]">{a}</p>
    </details>
  );
}
