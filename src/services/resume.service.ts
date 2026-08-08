import type {
  Resume,
  ResumeCreateInput,
  ResumeSummary,
  ResumeUpdateInput,
  PaginatedResponse,
  PaginationParams,
} from '@/types'
import { apiClient } from './api-client'
import { API_ROUTES } from '@/constants'

/**
 * ───────────────────────────────────────────────
 * Resume Service
 * ───────────────────────────────────────────────
 * Encapsulates all resume CRUD operations against
 * the REST API. Consumed by TanStack Query hooks.
 */

export const resumeService = {
  /** Fetch a paginated list of the current user's resumes. */
  list(params?: PaginationParams): Promise<PaginatedResponse<ResumeSummary>> {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.sort) search.set('sort', params.sort)
    if (params?.sortBy) search.set('sortBy', params.sortBy)
    if (params?.search) search.set('search', params.search)
    const query = search.toString()
    return apiClient.get<PaginatedResponse<ResumeSummary>>(
      `${API_ROUTES.RESUMES}${query ? `?${query}` : ''}`,
    )
  },

  /** Fetch a single resume by id. */
  getById(id: string): Promise<Resume> {
    return apiClient.get<Resume>(API_ROUTES.RESUME(id))
  },

  /** Create a new resume. */
  create(input: ResumeCreateInput): Promise<Resume> {
    return apiClient.post<Resume>(API_ROUTES.RESUMES, input)
  },

  /** Update an existing resume. */
  update(input: ResumeUpdateInput): Promise<Resume> {
    return apiClient.patch<Resume>(API_ROUTES.RESUME(input.id), input)
  },

  /** Delete a resume by id. */
  remove(id: string): Promise<void> {
    return apiClient.delete<void>(API_ROUTES.RESUME(id))
  },

  /** Duplicate an existing resume. */
  duplicate(id: string): Promise<Resume> {
    return apiClient.post<Resume>(`${API_ROUTES.RESUME(id)}/duplicate`)
  },

  /** Toggle public sharing. */
  togglePublic(id: string, isPublic: boolean): Promise<Resume> {
    return apiClient.patch<Resume>(API_ROUTES.RESUME(id), { isPublic })
  },
} as const