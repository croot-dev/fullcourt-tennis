/**
 * 게시글 서비스 레이어
 * 비즈니스 로직을 처리하고 Repository 레이어를 통해 DB에 접근
 */

import 'server-only'
import {
  findPostList,
  findPostById,
  createPost,
  updatePost,
  deletePost,
  incrementViewCount,
} from './post.repository'
import { CreatePostDto, PostDto } from './post.model'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 게시글 목록 조회
 */
export async function getPostList(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10
) {
  // 페이지 유효성 검증
  if (page < 1) page = 1
  if (limit < 1 || limit > 100) limit = 10

  return await findPostList(bbs_type_id, page, limit)
}

/**
 * 단일 게시글 조회
 */
export async function getPostById(post_id: number, bbs_type_id: number = 1) {
  if (!post_id || post_id < 1) {
    return null
  }

  return await findPostById(post_id, bbs_type_id)
}

/**
 * 게시글 생성
 */
export async function writePost(data: CreatePostDto) {
  const { bbs_type_id, title, content, writer_seq } = data

  // 유효성 검증
  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '제목을 입력해주세요.')
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '내용을 입력해주세요.')
  }

  if (!writer_seq) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '작성자 정보가 필요합니다.')
  }

  return createPost({ bbs_type_id, title, content, writer_seq })
}

/**
 * 게시글 수정
 */
export async function modifyPost(
  post_id: number,
  data: {
    title: string
    content: string
    user_id: number
  },
  bbs_type_id: number = 1
): Promise<PostDto | null> {
  const { title, content, user_id } = data

  // 유효성 검증
  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '제목을 입력해주세요.')
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '내용을 입력해주세요.')
  }

  if (!user_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 게시글 존재 여부 확인
  const existingPost = await findPostById(post_id, bbs_type_id)
  if (!existingPost) {
    throw new ServiceError(
      ErrorCode.POST_NOT_FOUND,
      '게시글을 찾을 수 없습니다.'
    )
  }

  // 작성자 권한 확인
  if (existingPost.writer_seq !== user_id) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '게시글을 수정할 권한이 없습니다.'
    )
  }

  return await updatePost(post_id, bbs_type_id, { title: title.trim(), content: content.trim() })
}

/**
 * 게시글 삭제
 */
export async function removePost(
  post_id: number,
  user_id: number,
  bbs_type_id: number = 1
): Promise<boolean> {
  if (!post_id || post_id < 1) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '유효하지 않은 게시글 ID입니다.'
    )
  }

  if (!user_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 게시글 존재 여부 확인
  const existingPost = await findPostById(post_id, bbs_type_id)
  if (!existingPost) {
    throw new ServiceError(
      ErrorCode.POST_NOT_FOUND,
      '게시글을 찾을 수 없습니다.'
    )
  }

  // 작성자 권한 확인
  if (existingPost.writer_seq !== user_id) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '게시글을 삭제할 권한이 없습니다.'
    )
  }

  return await deletePost(post_id, bbs_type_id)
}

/**
 * 조회수 증가
 */
export async function addViewCount(
  post_id: number,
  bbs_type_id: number = 1
): Promise<void> {
  await incrementViewCount(post_id, bbs_type_id)
}
