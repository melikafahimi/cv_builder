/**
 * ───────────────────────────────────────────────
 * LocalStorage utilities (SSR-safe)
 * ───────────────────────────────────────────────
 * All access is guarded by `typeof window` checks so
 * these can be imported in server components / middleware.
 */

export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or serialization error — ignore.
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function clearByPrefix(prefix: string): void {
  if (!isBrowser()) return
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(prefix)) keys.push(key)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
