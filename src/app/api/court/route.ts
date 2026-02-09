import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getCourtList, createCourt } from '@/domains/court'
import { parsePaginationParams } from '@/lib/query.utils'
import { MEMBER_ROLE } from '@/constants'
import { ErrorCode, ServiceError } from '@/lib/error'

/**
 * 코트 목록 조회
 * GET /api/court?page=1&limit=10
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const { page, limit } = parsePaginationParams(
        searchParams.get('page'),
        searchParams.get('limit')
      )

      const result = await getCourtList(page, limit)

      return NextResponse.json({
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('코트 목록 조회 에러:', error)
      return handleApiError(error, '코트 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 코트 생성
 * POST /api/court
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      if (user.roleCode !== MEMBER_ROLE.ADMIN) {
        throw new ServiceError(
          ErrorCode.FORBIDDEN,
          '코트를 생성할 권한이 없습니다.'
        )
      }

      const body = await authenticatedReq.json()
      const {
        name,
        naver_place_id,
        naver_business_id,
        rsv_url,
        address,
        is_indoor,
        court_type,
        court_count,
        amenities,
        tags,
        memo,
      } = body

      const court = await createCourt({
        name,
        naver_place_id,
        naver_business_id,
        rsv_url,
        address,
        is_indoor,
        court_type,
        court_count,
        amenities,
        tags,
        memo,
      })

      return NextResponse.json(court, { status: 201 })
    } catch (error) {
      console.error('코트 생성 에러:', error)
      return handleApiError(error, '코트 생성 중 오류가 발생했습니다.')
    }
  })
}
