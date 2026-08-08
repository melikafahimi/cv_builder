/**
 * ───────────────────────────────────────────────
 * API / Network Types
 * ───────────────────────────────────────────────
 * Shared shapes for REST responses, TanStack Query
 * integration, and error handling.
 */

/** Standard envelope for all API responses. */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

/** Paginated list response. */
export interface PaginatedResponse<T = unknown> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

/** Query parameters for list endpoints. */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sort?: 'asc' | 'desc'
  sortBy?: string
  search?: string
}

/** Structured API error. */
export interface ApiError {
  code: string
  message: string
  /** Field-level validation errors keyed by field path. */
  fieldErrors?: Record<string, string[]>
  statusCode: number
}

/** TanStack Query key segments. */
export type QueryKey = readonly (string | number | object)[]

/** Mutation context for optimistic updates. */
export interface MutationContext<TData = unknown> {
  previousData?: TData
  rollback?: () => void
}

/** Generic request options passed to the API client. */
export interface RequestOptions {
  signal?: AbortSignal
  headers?: Record<string, string>
  /** Skip auth header injection. */
  skipAuth?: boolean
}

/** HTTP methods supported by the API client. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'