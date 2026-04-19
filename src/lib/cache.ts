import { CACHE_PREFIX, DEFAULT_CACHE_TTL_MS } from "./constants";

type CacheEntry<T> = { value: T; expiry: number };

export function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function cacheSet<T>(
  key: string,
  value: T,
  ttlMs: number = DEFAULT_CACHE_TTL_MS,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ value, expiry: Date.now() + ttlMs }),
    );
  } catch {
    cleanupOldest();
    try {
      localStorage.setItem(
        CACHE_PREFIX + key,
        JSON.stringify({ value, expiry: Date.now() + ttlMs }),
      );
    } catch {
      // ignore
    }
  }
}

export function cacheClear(prefix = "") {
  if (typeof window === "undefined") return;
  const fullPrefix = CACHE_PREFIX + prefix;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(fullPrefix)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

function cleanupOldest() {
  const entries: { key: string; expiry: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(CACHE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(k) || "{}");
      entries.push({ key: k, expiry: parsed.expiry ?? 0 });
    } catch {
      entries.push({ key: k, expiry: 0 });
    }
  }
  entries.sort((a, b) => a.expiry - b.expiry);
  entries.slice(0, Math.ceil(entries.length / 4)).forEach((e) => {
    localStorage.removeItem(e.key);
  });
}
