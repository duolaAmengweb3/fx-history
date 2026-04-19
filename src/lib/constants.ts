export const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export const EARLIEST_DATE = "1999-01-04";

export const DEFAULT_BASE = "USD";
export const DEFAULT_TARGETS = ["CNY", "EUR", "GBP", "JPY", "HKD"];

export const CACHE_PREFIX = "fxh:v1:";
export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const HISTORICAL_CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export const CURRENCY_META: Record<
  string,
  { name: string; nameZh: string; flag: string; region: string }
> = {
  AUD: { name: "Australian Dollar", nameZh: "澳元", flag: "🇦🇺", region: "大洋洲" },
  BRL: { name: "Brazilian Real", nameZh: "巴西雷亚尔", flag: "🇧🇷", region: "南美" },
  CAD: { name: "Canadian Dollar", nameZh: "加元", flag: "🇨🇦", region: "北美" },
  CHF: { name: "Swiss Franc", nameZh: "瑞士法郎", flag: "🇨🇭", region: "欧洲" },
  CNY: { name: "Chinese Yuan", nameZh: "人民币", flag: "🇨🇳", region: "亚洲" },
  CZK: { name: "Czech Koruna", nameZh: "捷克克朗", flag: "🇨🇿", region: "欧洲" },
  DKK: { name: "Danish Krone", nameZh: "丹麦克朗", flag: "🇩🇰", region: "欧洲" },
  EUR: { name: "Euro", nameZh: "欧元", flag: "🇪🇺", region: "欧洲" },
  GBP: { name: "British Pound", nameZh: "英镑", flag: "🇬🇧", region: "欧洲" },
  HKD: { name: "Hong Kong Dollar", nameZh: "港币", flag: "🇭🇰", region: "亚洲" },
  HUF: { name: "Hungarian Forint", nameZh: "匈牙利福林", flag: "🇭🇺", region: "欧洲" },
  IDR: { name: "Indonesian Rupiah", nameZh: "印尼盾", flag: "🇮🇩", region: "东南亚" },
  ILS: { name: "Israeli Shekel", nameZh: "以色列新谢克尔", flag: "🇮🇱", region: "中东" },
  INR: { name: "Indian Rupee", nameZh: "印度卢比", flag: "🇮🇳", region: "南亚" },
  ISK: { name: "Icelandic Krona", nameZh: "冰岛克朗", flag: "🇮🇸", region: "欧洲" },
  JPY: { name: "Japanese Yen", nameZh: "日元", flag: "🇯🇵", region: "亚洲" },
  KRW: { name: "South Korean Won", nameZh: "韩元", flag: "🇰🇷", region: "亚洲" },
  MXN: { name: "Mexican Peso", nameZh: "墨西哥比索", flag: "🇲🇽", region: "北美" },
  MYR: { name: "Malaysian Ringgit", nameZh: "马来西亚林吉特", flag: "🇲🇾", region: "东南亚" },
  NOK: { name: "Norwegian Krone", nameZh: "挪威克朗", flag: "🇳🇴", region: "欧洲" },
  NZD: { name: "New Zealand Dollar", nameZh: "新西兰元", flag: "🇳🇿", region: "大洋洲" },
  PHP: { name: "Philippine Peso", nameZh: "菲律宾比索", flag: "🇵🇭", region: "东南亚" },
  PLN: { name: "Polish Zloty", nameZh: "波兰兹罗提", flag: "🇵🇱", region: "欧洲" },
  RON: { name: "Romanian Leu", nameZh: "罗马尼亚列伊", flag: "🇷🇴", region: "欧洲" },
  SEK: { name: "Swedish Krona", nameZh: "瑞典克朗", flag: "🇸🇪", region: "欧洲" },
  SGD: { name: "Singapore Dollar", nameZh: "新加坡元", flag: "🇸🇬", region: "东南亚" },
  THB: { name: "Thai Baht", nameZh: "泰铢", flag: "🇹🇭", region: "东南亚" },
  TRY: { name: "Turkish Lira", nameZh: "土耳其里拉", flag: "🇹🇷", region: "中东" },
  USD: { name: "US Dollar", nameZh: "美元", flag: "🇺🇸", region: "北美" },
  ZAR: { name: "South African Rand", nameZh: "南非兰特", flag: "🇿🇦", region: "非洲" },
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);

export const UNSUPPORTED_CURRENCIES = [
  { code: "RUB", name: "俄罗斯卢布", reason: "ECB 不再发布" },
  { code: "TWD", name: "新台币", reason: "ECB 不收录" },
  { code: "VND", name: "越南盾", reason: "ECB 不收录" },
  { code: "AED", name: "阿联酋迪拉姆", reason: "ECB 不收录" },
  { code: "SAR", name: "沙特里亚尔", reason: "ECB 不收录" },
  { code: "NGN", name: "尼日利亚奈拉", reason: "ECB 不收录" },
  { code: "EGP", name: "埃及镑", reason: "ECB 不收录" },
];
