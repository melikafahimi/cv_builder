/**
 * ───────────────────────────────────────────────
 * Date formatting utilities
 * ───────────────────────────────────────────────
 * Resumes store dates as "YYYY-MM" or "YYYY-MM-DD".
 * These helpers render human-readable ranges.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/** Parse a "YYYY-MM" or "YYYY-MM-DD" string into parts. */
export function parseDate(
  value: string,
): { year: number; month: number | null; day: number | null } | null {
  if (!value) return null
  const match = value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/)
  if (!match) return null
  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = match[3] ? Number(match[3]) : null
  return { year, month, day }
}

/** Format a single date as "Month Year" or just "Year". */
export function formatDate(value: string): string {
  const parsed = parseDate(value)
  if (!parsed) return ''
  const { year, month } = parsed
  if (month && month >= 1 && month <= 12) {
    return `${MONTHS[month - 1]} ${year}`
  }
  return String(year)
}

/** Format a date range, e.g. "Jan 2020 – Present". */
export function formatDateRange(
  start: string,
  end: string,
  current?: boolean,
): string {
  const startStr = formatDate(start)
  const endStr = current ? 'Present' : formatDate(end)
  if (!startStr && !endStr) return ''
  if (!endStr) return startStr
  if (!startStr) return endStr
  return `${startStr} – ${endStr}`
}

/** Get the current month in "YYYY-MM" format. */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Relative time-ago formatter, e.g. "2 days ago". */
export function timeAgo(iso: string): string {
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}