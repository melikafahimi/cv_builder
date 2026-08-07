import type { ApiResponse, ApiError, HttpMethod, RequestOptions } from '@/types'
import { API_ROUTES, STORAGE_KEYS } from '@/constants'
import { isBrowser } from '@/utils/storage'

/**
 * ───────────────────────────────────────────────
 * API Client
 * ───────────────────────────────────────────────
 * A thin fetch wrapper that injects auth headers,
 * normalizes errors, and parses the standard
 * `ApiResponse<T>` envelope.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    if (!isBrowser()) return null
    return window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ?? null
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    if (!options?.skipAuth) {
      const token = this.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    })

    if (!response.ok) {
      const error = (await this.parseError(response)) as ApiError
      throw error
    }

    const json = (await response.json()) as ApiResponse<T>
    return json.data
  }

  private async parseError(response: Response): Promise<ApiError> {
    try {
      const json = await response.json()
      return {
        code: json.code ?? 'UNKNOWN',
        message: json.message ?? 'An unexpected error occurred',
        fieldErrors: json.fieldErrors,
        statusCode: response.status,
      }
    } catch {
      return {
        code: 'PARSE_ERROR',
        message: response.statusText || 'Failed to parse error response',
        statusCode: response.status,
      }
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options)
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options)
  }
}

/** Singleton API client used across the app. */
export const apiClient = new ApiClient()

/** Convenience access to route constants. */
export { API_ROUTES }
