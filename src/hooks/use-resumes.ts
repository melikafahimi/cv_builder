'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { resumeService } from '@/services/resume.service'
import type {
  Resume,
  ResumeCreateInput,
  ResumeUpdateInput,
  PaginationParams,
} from '@/types'

/**
 * ───────────────────────────────────────────────
 * Resume TanStack Query hooks
 * ───────────────────────────────────────────────
 * Thin wrappers around the resume service with
 * optimistic updates and cache invalidation.
 */

/** Stable query keys. */
export const resumeKeys = {
  all: ['resumes'] as const,
  lists: () => [...resumeKeys.all, 'list'] as const,
  list: (params: PaginationParams) =>
    [...resumeKeys.lists(), params] as const,
  details: () => [...resumeKeys.all, 'detail'] as const,
  detail: (id: string) => [...resumeKeys.details(), id] as const,
}

/** Fetch a paginated list of resumes. */
export function useResumes(params?: PaginationParams) {
  return useQuery({
    queryKey: resumeKeys.list(params ?? {}),
    queryFn: () => resumeService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Fetch a single resume by id. */
export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: resumeKeys.detail(id ?? ''),
    queryFn: () => resumeService.getById(id as string),
    enabled: Boolean(id),
  })
}

/** Create a new resume. */
export function useCreateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ResumeCreateInput) => resumeService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
    },
  })
}

/** Update an existing resume. */
export function useUpdateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ResumeUpdateInput) => resumeService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: resumeKeys.detail(input.id),
      })
      const previous = queryClient.getQueryData<Resume>(
        resumeKeys.detail(input.id),
      )
      if (previous) {
        queryClient.setQueryData<Resume>(resumeKeys.detail(input.id), {
          ...previous,
          ...input,
        })
      }
      return { previous }
    },
    onError: (_err, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          resumeKeys.detail(input.id),
          context.previous,
        )
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: resumeKeys.detail(data.id),
        })
      }
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
    },
  })
}

/** Delete a resume. */
export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
    },
  })
}

/** Duplicate a resume. */
export function useDuplicateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
    },
  })
}