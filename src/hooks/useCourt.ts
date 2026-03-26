'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api.client'
import type {
  TennisCourt,
  CourtListResult,
  CreateCourtDto,
  UpdateCourtDto,
} from '@/domains/court/court.model'

export const courtKeys = {
  all: ['courts'] as const,
  list: () => [...courtKeys.all, 'list'] as const,
  detail: (id: number) => [...courtKeys.all, 'detail', id] as const,
}

/**
 * 코트 목록 조회
 */
export function useCourts(page: number = 1, limit: number = 10, isIndoor?: boolean) {
  return useQuery({
    queryKey: [...courtKeys.list(), page, limit, isIndoor],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (isIndoor !== undefined) params.set('isIndoor', String(isIndoor))
      return await request<CourtListResult & { page: number; limit: number }>(
        `/api/court?${params.toString()}`
      )
    },
  })
}

/**
 * 코트 상세 조회
 */
export function useCourtDetail(id: number) {
  return useQuery({
    queryKey: courtKeys.detail(id),
    queryFn: () => request<TennisCourt>(`/api/court/${id}`),
    enabled: id > 0,
  })
}

/**
 * 코트 생성 mutation
 */
export function useCreateCourt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtDto) =>
      request<TennisCourt>('/api/court', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() })
    },
  })
}

/**
 * 코트 수정 mutation
 */
export function useUpdateCourt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ court_id, ...data }: UpdateCourtDto) =>
      request<TennisCourt>(`/api/court/${court_id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() })
      queryClient.invalidateQueries({
        queryKey: courtKeys.detail(variables.court_id),
      })
    },
  })
}

/**
 * 코트 삭제 mutation
 */
export function useDeleteCourt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      request(`/api/court/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.list() })
    },
  })
}
