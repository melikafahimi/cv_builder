/**
 * ───────────────────────────────────────────────
 * ID generation utilities
 * ───────────────────────────────────────────────
 * Uses `crypto.randomUUID` with a safe fallback for
 * older runtimes / non-secure contexts.
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Generate a URL-friendly slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Generate a short random ID (8 chars) for non-DB keys. */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10)
}
