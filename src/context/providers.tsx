'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { QUERY_CONFIG } from '@/constants'

/**
 * ───────────────────────────────────────────────
 * Root Providers
 * ───────────────────────────────────────────────
 * Composes every client-side provider the app needs:
 *  - next-themes (dark/light)
 *  - TanStack Query (server state)
 *  - React DnD (drag-and-drop)
 *  - Sonner (toasts)
 *
 * Mounted once in `app/layout.tsx`.
 */

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.staleTime,
            gcTime: QUERY_CONFIG.gcTime,
            retry: QUERY_CONFIG.retry,
            refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
          },
        },
      }),
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <DndProvider backend={HTML5Backend}>
          {children}
          <Toaster richColors position="bottom-right" closeButton />
        </DndProvider>
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  )
}