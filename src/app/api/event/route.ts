import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getEventList, writeEvent } from '@/domains/event'
import { getMemberById } from '@/domains/member'
import { parsePaginationParams, parseIntSafe } from '@/lib/query.utils'

/**
 * 이벤트 목록 조회
 * GET /api/event?page=1&limit=10&year=2026&month=1
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const { page, limit } = parsePaginationParams(
        searchParams.get('page'),
        searchParams.get('limit')
      )

      const yearStr = searchParams.get('year')
      const monthStr = searchParams.get('month')
      const filter = yearStr && monthStr
        ? {
            year: parseIntSafe(yearStr, 0, 2000, 2100),
            month: parseIntSafe(monthStr, 0, 1, 12),
          }
        : undefined

      const result = await getEventList(page, limit, filter)

      return NextResponse.json({
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('이벤트 목록 조회 에러:', error)
      return handleApiError(error, '이벤트 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 이벤트 생성
 * POST /api/event
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body = await authenticatedReq.json()
      const {
        title,
        description,
        start_datetime,
        end_datetime,
        location_name,
        location_url,
        max_participants,
      } = body

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const event = await writeEvent({
        title,
        description,
        start_datetime,
        end_datetime,
        location_name,
        location_url,
        max_participants,
        host_member_seq: member.seq,
      })

      revalidatePath('/')
      revalidatePath('/schedule')

      return NextResponse.json(event, { status: 201 })
    } catch (error) {
      console.error('이벤트 생성 에러:', error)
      return handleApiError(error, '이벤트 생성 중 오류가 발생했습니다.')
    }
  })
}
