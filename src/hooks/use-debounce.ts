'use client'

import * as React from 'react'
import type { DebouncedValue } from '@/types'

/**
 * ───────────────────────────────────────────────
 * useDebounce
 * ───────────────────────────────────────────────
 * Returns a debounced copy of `value` that only
 * updates after `delay` ms have elapsed without change.
 * Also reports whether a debounce is in-flight.
 */
export function useDebounce<T>(value: T, delay = 500): DebouncedValue<T> {
  const [debounced, setDebounced] = React.useState<T>(value)
  const [isDebouncing, setIsDebouncing] = React.useState(false)

  React.useEffect(() => {
    setIsDebouncing(true)
    const timer = setTimeout(() => {
      setDebounced(value)
      setIsDebouncing(false)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return { value: debounced, isDebouncing }
}