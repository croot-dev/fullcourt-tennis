/**
 * Post 리포지토리 레이어
 * 순수 DB 접근 로직만 담당
 */

import 'server-only'
import {
  getPostList as getPostListQuery,
  selectRecentPosts,
  getPost as getPostQuery,
  createPost as createPostQuery,
  updatePost as updatePostQuery,
  deletePost as deletePostQuery,
  incrementViewCount as incrementViewCountQuery,
} from './post.query'
import { PostListItem, PostListFilter, PostDto, CreatePostDto } from './post.model'
import { ResponseList } from '../common/response.query'

/**
 * 게시글 목록 조회
 */
export async function findPostList(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10,
  filter?: PostListFilter
): Promise<ResponseList<PostListItem>> {
  return getPostListQuery(bbs_type_id, page, limit, filter)
}

export async function findRecentPosts(bbsTypeId: number, limit: number) {
  return selectRecentPosts(bbsTypeId, limit)
}

/**
 * 단일 게시글 조회
 */
export async function findPostById(
  post_id: number,
  bbs_type_id: number = 1
): Promise<PostListItem | null> {
  return getPostQuery(post_id, bbs_type_id)
}

/**
 * 게시글 생성
 */
export async function createPost(data: CreatePostDto): Promise<PostListItem> {
  return createPostQuery(data)
}

/**
 * 게시글 수정
 */
export async function updatePost(
  post_id: number,
  bbs_type_id: number,
  data: { title: string; content: string }
): Promise<PostDto | null> {
  return updatePostQuery(post_id, bbs_type_id, data)
}

/**
 * 게시글 삭제
 */
export async function deletePost(
  post_id: number,
  bbs_type_id: number
): Promise<boolean> {
  return deletePostQuery(post_id, bbs_type_id)
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(
  post_id: number,
  bbs_type_id: number
): Promise<void> {
  return incrementViewCountQuery(post_id, bbs_type_id)
}
