import type { ISODateString, UUID } from './resume'

/** User role for RBAC. */
export type UserRole = 'user' | 'admin'

/** Subscription tier for billing / feature gating. */
export type SubscriptionTier = 'free' | 'pro' | 'business'

/** Authenticated user account. */
export interface User {
  id: UUID
  email: string
  username: string
  firstName: string
  lastName: string
  role: UserRole
  subscription: SubscriptionTier
  profilePic: string
  emailVerified: boolean
  createdAt: ISODateString
  updatedAt: ISODateString
}

/** Payload for registration. */
export interface RegisterInput {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

/** Payload for login. */
export interface LoginInput {
  email: string
  password: string
  /** Optional "remember me" flag. */
  remember?: boolean
}

/** Auth session returned by the API. */
export interface AuthSession {
  user: User
  accessToken: string
  expiresAt: ISODateString
}

/** Password reset request payload. */
export interface ResetPasswordInput {
  token: string
  password: string
}

/** Profile update payload. */
export type UpdateProfileInput = Partial<
  Pick<User, 'username' | 'firstName' | 'lastName' | 'profilePic'>
>
