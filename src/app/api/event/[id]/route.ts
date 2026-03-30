import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getEventDetail, modifyEvent, removeEvent } from '@/domains/event'
import { getMemberById } from '@/domains/member'
import { MEMBER_ROLE } from '@/constants'

/**
 * 이벤트 상세 조회
 * GET /api/event/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async () => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 },
        )
      }

      const result = await getEventDetail(eventId)

      return NextResponse.json(result)
    } catch (error) {
      console.error('이벤트 상세 조회 에러:', error)
      return handleApiError(error, '이벤트 상세 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 이벤트 수정
 * PUT /api/event/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 },
        )
      }

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
          { status: 404 },
        )
      }

      const isOperator =
        user.roleCode === MEMBER_ROLE.ADMIN ||
        user.roleCode === MEMBER_ROLE.OPER

      const event = await modifyEvent(
        {
          id: eventId,
          title,
          description,
          start_datetime,
          end_datetime,
          location_name,
          location_url,
          max_participants,
        },
        member.seq,
        isOperator,
      )

      return NextResponse.json(event)
    } catch (error) {
      console.error('이벤트 수정 에러:', error)
      return handleApiError(error, '이벤트 수정 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 이벤트 삭제
 * DELETE /api/event/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async (_, user) => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 },
        )
      }

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 },
        )
      }

      await removeEvent(eventId, member.seq)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('이벤트 삭제 에러:', error)
      return handleApiError(error, '이벤트 삭제 중 오류가 발생했습니다.')
    }
  })
}
