'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PostDto, BbsType, PostListItem } from '@/domains/post/post.model'
import { request } from '@/lib/api.client'
import { ResponseList } from '@/domains/common/response.query'

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [postKeys.all, 'list'] as const,
  list: (bbsTypeId: number, page: number, limit: number) =>
    [postKeys.lists(), { bbsTypeId, page, limit }] as const,
  details: () => [postKeys.all, 'detail'] as const,
  detail: (id: number) => [postKeys.details(), id] as const,
}

interface PostListParams {
  bbsTypeId?: number
  page?: number
  limit?: number
}

/**
 * 게시글 목록 조회
 */
export function usePostList({
  bbsTypeId = BbsType.NOTICE,
  page = 1,
  limit = 10,
}: PostListParams = {}) {
  return useQuery<ResponseList<PostListItem>>({
    queryKey: postKeys.list(bbsTypeId, page, limit),
    queryFn: () =>
      request(`/api/bbs/post?type=${bbsTypeId}&page=${page}&limit=${limit}`),
  })
}

/**
 * 단일 게시글 조회
 */
export function usePost(id: number, bbsTypeId: number = BbsType.NOTICE) {
  return useQuery<PostDto>({
    queryKey: postKeys.detail(id),
    queryFn: () => request(`/api/bbs/post/${id}?type=${bbsTypeId}`),
    enabled: !!id,
  })
}

interface CreatePostInput {
  bbs_type_id: string
  title: string
  content: string
}

/**
 * 게시글 작성 mutation
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostInput) =>
      request<PostDto>('/api/bbs/post', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

interface UpdatePostInput {
  id: number
  bbs_type_id?: number
  title?: string
  content?: string
}

/**
 * 게시글 수정 mutation
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePostInput) =>
      request<PostDto>(`/api/bbs/post/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

interface DeletePostInput {
  id: number
  bbsTypeId: number
}

/**
 * 게시글 삭제 mutation
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, bbsTypeId }: DeletePostInput) =>
      request<boolean>(`/api/bbs/post/${id}?type=${bbsTypeId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
