import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
  UpdateProfileInput,
} from '@/types'
import { apiClient } from './api-client'
import { API_ROUTES, STORAGE_KEYS } from '@/constants'
import { setItem, removeItem, isBrowser } from '@/utils/storage'

/**
 * ───────────────────────────────────────────────
 * Auth Service
 * ───────────────────────────────────────────────
 * Handles authentication, session persistence,
 * and profile management.
 */

export const authService = {
  /** Register a new account. */
  register(input: RegisterInput): Promise<AuthSession> {
    return apiClient.post<AuthSession>(API_ROUTES.AUTH.REGISTER, input, {
      skipAuth: true,
    })
  },

  /** Log in with email + password. */
  login(input: LoginInput): Promise<AuthSession> {
    return apiClient.post<AuthSession>(API_ROUTES.AUTH.LOGIN, input, {
      skipAuth: true,
    })
  },

  /** Log out and clear the local session. */
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>(API_ROUTES.AUTH.LOGOUT)
    } finally {
      removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  },

  /** Fetch the current authenticated user. */
  me(): Promise<User> {
    return apiClient.get<User>(API_ROUTES.AUTH.ME)
  },

  /** Update the user's profile. */
  updateProfile(input: UpdateProfileInput): Promise<User> {
    return apiClient.patch<User>('/api/auth/profile', input)
  },

  /** Persist the access token to localStorage. */
  persistSession(session: AuthSession): void {
    setItem(STORAGE_KEYS.AUTH_TOKEN, session.accessToken)
  },

  /** Whether a token is present (does not validate it). */
  hasToken(): boolean {
    return (
      isBrowser() &&
      Boolean(window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))
    )
  },
} as const
