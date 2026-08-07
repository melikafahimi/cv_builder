/**
 * ───────────────────────────────────────────────
 * App-wide configuration constants
 * ───────────────────────────────────────────────
 */

export const APP_CONFIG = {
  name: 'CV Builder',
  description: 'Build a production-ready resume in minutes.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  locale: 'en',
} as const

/** TanStack Query stale-time / cache defaults (ms). */
export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 min
  gcTime: 30 * 60 * 1000, // 30 min
  retry: 1,
  refetchOnWindowFocus: false,
} as const

/** Auto-save debounce delay (ms). */
export const AUTOSAVE_DELAY = 2000

/** Local storage keys (namespaced to avoid collisions). */
export const STORAGE_KEYS = {
  RESUME_DRAFT: 'cvb:resume:draft',
  RESUME_LIST: 'cvb:resume:list',
  AUTH_TOKEN: 'cvb:auth:token',
  THEME: 'cvb:theme',
  EDITOR_STATE: 'cvb:editor:state',
} as const

/** API route prefixes. */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  RESUMES: '/api/resumes',
  RESUME: (id: string) => `/api/resumes/${id}`,
  TEMPLATES: '/api/templates',
  EXPORT: (id: string) => `/api/resumes/${id}/export`,
} as const

/** Free-tier limits for feature gating. */
export const FREE_TIER_LIMITS = {
  maxResumes: 3,
  maxTemplates: 2,
  exportFormats: ['pdf'] as const,
  aiAssist: false,
} as const

/** Page sizes in mm for PDF export. */
export const PAGE_DIMENSIONS = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
  legal: { width: 216, height: 356 },
} as const
