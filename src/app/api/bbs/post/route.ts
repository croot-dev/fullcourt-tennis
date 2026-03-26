import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getPostList, writePost } from '@/domains/post'
import { handleApiError } from '@/lib/api.error'
import { BBS_TYPE } from '@/constants'
import { parsePaginationParams, parseIntSafe } from '@/lib/query.utils'

// 게시글 목록 조회 API (인증 불필요)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bbs_type_id = parseIntSafe(searchParams.get('type'), 1, 1)
    const { page, limit } = parsePaginationParams(
      searchParams.get('page'),
      searchParams.get('limit')
    )

    const result = await getPostList(bbs_type_id, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('게시글 목록 조회 에러:', error)
    return handleApiError(error, '게시글 목록 조회 중 오류가 발생했습니다.')
  }
}

// 게시글 작성 API (인증 필요)
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body = await authenticatedReq.json()
      const { bbs_type_id, title, content } = body

      const result = await writePost({
        bbs_type_id: parseInt(bbs_type_id) || 1,
        title,
        content,
        writer_seq:
          Number(bbs_type_id) === BBS_TYPE.BLIND ? 0 : user?.memberSeq,
      })

      return NextResponse.json(result)
    } catch (error) {
      console.error('게시글 작성 에러:', error)
      return handleApiError(error, '게시글 작성 중 오류가 발생했습니다.')
    }
  })
}
