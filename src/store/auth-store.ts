import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'

/**
 * ───────────────────────────────────────────────
 * Auth Store (Zustand)
 * ───────────────────────────────────────────────
 * Holds the current user and auth status. Not persisted
 * to localStorage (the token is); the user is re-fetched
 * on app load via `authService.me()`.
 */

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

interface AuthState {
  user: User | null
  status: AuthStatus

  setUser: (user: User | null) => void
  setStatus: (status: AuthStatus) => void
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      status: 'loading',

      setUser: (user) =>
        set(
          { user, status: user ? 'authenticated' : 'unauthenticated' },
          false,
          'setUser',
        ),

      setStatus: (status) => set({ status }, false, 'setStatus'),

      fetchUser: async () => {
        if (!authService.hasToken()) {
          set({ user: null, status: 'unauthenticated' }, false, 'fetchUser')
          return
        }
        try {
          const user = await authService.me()
          set({ user, status: 'authenticated' }, false, 'fetchUser')
        } catch {
          set({ user: null, status: 'unauthenticated' }, false, 'fetchUser')
        }
      },

      logout: async () => {
        await authService.logout()
        set({ user: null, status: 'unauthenticated' }, false, 'logout')
      },
    }),
    { name: 'AuthStore' },
  ),
)