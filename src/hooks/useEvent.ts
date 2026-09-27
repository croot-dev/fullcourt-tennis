'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api.client'
import { useRouter } from 'next/navigation'
import type {
  Event,
  EventWithHost,
  EventListResult,
  EventDetailResult,
} from '@/domains/event/event.model'

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: number) => [...eventKeys.all, 'detail', id] as const,
  my: () => [...eventKeys.all, 'my'] as const,
}

/**
 * FullCalendar용 이벤트 형식
 */
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  extendedProps?: {
    description?: string
    location_name?: string
    max_participants?: number
    current_participants?: number
    host_nickname?: string
  }
}

/**
 * EventWithHost를 CalendarEvent로 변환
 */
export function toCalendarEvent(event: EventWithHost): CalendarEvent {
  return {
    id: String(event.id),
    title: event.title,
    start: event.start_datetime,
    end: event.end_datetime,
    extendedProps: {
      description: event.description || undefined,
      location_name: event.location_name || undefined,
      max_participants: event.max_participants,
      current_participants: event.current_participants,
      host_nickname: event.host_nickname,
    },
  }
}

export interface EventListFilter {
  year?: number
  month?: number
}

/**
 * 이벤트 목록 조회 (원본 데이터)
 */
export function useEvents(page: number = 1, limit: number = 100, filter?: EventListFilter) {
  return useQuery({
    queryKey: [...eventKeys.list(), page, limit, filter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (filter?.year && filter?.month) {
        params.set('year', String(filter.year))
        params.set('month', String(filter.month))
      }
      const result = await request<EventListResult>(
        `/api/event?${params.toString()}`
      )
      return result.events
    },
  })
}

/**
 * 이벤트 상세 조회
 */
export function useEventDetail(id: number) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => request<EventDetailResult>(`/api/event/${id}`),
    enabled: id > 0,
  })
}

/**
 * 이벤트 생성 Input
 */
export interface CreateEventInput {
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  location_name?: string
  location_url?: string
  max_participants: number
}

/**
 * 이벤트 생성 mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      request<Event>('/api/event', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      router.refresh()
    },
  })
}

/**
 * 이벤트 수정 mutation
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ id, ...data }: CreateEventInput & { id: number }) =>
      request<Event>(`/api/event/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      router.refresh()
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      })
    },
  })
}

/**
 * 이벤트 삭제 mutation
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: number) =>
      request(`/api/event/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      router.refresh()
    },
  })
}

/**
 * 이벤트 참여 신청 mutation
 */
export function useJoinEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) =>
      request(`/api/event/${eventId}/join`, { method: 'POST' }),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      queryClient.invalidateQueries({ queryKey: eventKeys.my() })
    },
  })
}

/**
 * 이벤트 참여 취소 mutation
 */
export function useCancelEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) =>
      request(`/api/event/${eventId}/join`, { method: 'DELETE' }),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      queryClient.invalidateQueries({ queryKey: eventKeys.my() })
    },
  })
}

/**
 * 내가 참여한 이벤트와 my_status를 포함한 타입
 */
export interface MyEventWithStatus extends EventWithHost {
  my_status: 'JOIN' | 'WAIT'
}

/**
 * 내가 참여한 이벤트 목록 조회
 */
export function useMyEvents(limit: number = 5) {
  return useQuery({
    queryKey: [...eventKeys.my(), limit],
    queryFn: async () => {
      const result = await request<{ events: MyEventWithStatus[] }>(
        `/api/event/my?limit=${limit}`
      )
      return result.events
    },
  })
}
