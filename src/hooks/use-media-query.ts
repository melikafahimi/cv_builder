'use client'

import * as React from 'react'

/**
 * ───────────────────────────────────────────────
 * useMediaQuery
 * ───────────────────────────────────────────────
 * SSR-safe media query hook. Returns `false` during
 * SSR and the first client render, then updates after
 * mount to avoid hydration mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Convenience hook for the `md` breakpoint (≥768px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

/** Convenience hook for the `lg` breakpoint (≥1024px). */
export function useIsLargeScreen(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}