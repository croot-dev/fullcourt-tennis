import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import {
  getPostById,
  modifyPost,
  removePost,
  addViewCount,
} from '@/domains/post'
import { handleApiError } from '@/lib/api.error'
import { ServiceError, ErrorCode } from '@/lib/error'

// 단일 게시글 조회 API (인증 불필요)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const bbs_type_id = parseInt(searchParams.get('type') || '1')
    const post_id = parseInt(id)

    const post = await getPostById(post_id, bbs_type_id)

    if (!post) {
      throw new ServiceError(
        ErrorCode.POST_NOT_FOUND,
        '게시글을 찾을 수 없습니다.'
      )
    }

    addViewCount(post_id, bbs_type_id)

    return NextResponse.json(post)
  } catch (error) {
    console.error('게시글 조회 에러:', error)
    return handleApiError(error, '게시글 조회 중 오류가 발생했습니다.')
  }
}

// 게시글 수정 API (인증 필요)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const body = await authenticatedReq.json()
      const { title, content, bbs_type_id } = body
      const post_id = parseInt(id)
      const type_id = parseInt(bbs_type_id || '1')

      const updatedPost = await modifyPost(
        post_id,
        { title, content, user_id: user.memberSeq },
        type_id
      )

      return NextResponse.json(updatedPost)
    } catch (error) {
      console.error('게시글 수정 에러:', error)
      return handleApiError(error, '게시글 수정 중 오류가 발생했습니다.')
    }
  })
}

// 게시글 삭제 API (인증 필요)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_authenticatedReq, user) => {
    try {
      const { id } = await params
      const { searchParams } = new URL(req.url)
      const bbs_type_id = parseInt(searchParams.get('type') || '1')
      const post_id = parseInt(id)

      await removePost(post_id, user.memberSeq, bbs_type_id)

      return NextResponse.json(true)
    } catch (error) {
      console.error('게시글 삭제 에러:', error)
      return handleApiError(error, '게시글 삭제 중 오류가 발생했습니다.')
    }
  })
}
