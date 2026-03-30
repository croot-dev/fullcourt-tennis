import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getCourtById, updateCourt, deleteCourt } from '@/domains/court'
import { MEMBER_ROLE } from '@/constants'
import { ErrorCode, ServiceError } from '@/lib/error'

/**
 * 코트 상세 조회
 * GET /api/court/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async () => {
    try {
      const { id } = await params
      const courtId = parseInt(id, 10)

      if (isNaN(courtId)) {
        throw new ServiceError(
          ErrorCode.VALIDATION_ERROR,
          '유효하지 않은 코트 ID입니다.',
        )
      }

      const court = await getCourtById(courtId)

      return NextResponse.json(court)
    } catch (error) {
      console.error('코트 상세 조회 에러:', error)
      return handleApiError(error, '코트 상세 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 코트 수정
 * PUT /api/court/:id
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      if (
        user.roleCode !== MEMBER_ROLE.ADMIN &&
        user.roleCode !== MEMBER_ROLE.OPER
      ) {
        throw new ServiceError(
          ErrorCode.FORBIDDEN,
          '코트를 수정할 권한이 없습니다.',
        )
      }

      const { id } = await params
      const courtId = parseInt(id, 10)

      if (isNaN(courtId)) {
        throw new ServiceError(
          ErrorCode.VALIDATION_ERROR,
          '유효하지 않은 코트 ID입니다.',
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

      const court = await updateCourt({
        court_id: courtId,
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

      return NextResponse.json(court)
    } catch (error) {
      console.error('코트 수정 에러:', error)
      return handleApiError(error, '코트 수정 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 코트 삭제
 * DELETE /api/court/:id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(req, async (_authenticatedReq, user) => {
    try {
      if (user.roleCode !== MEMBER_ROLE.ADMIN) {
        throw new ServiceError(
          ErrorCode.FORBIDDEN,
          '코트를 삭제할 권한이 없습니다.',
        )
      }

      const { id } = await params
      const courtId = parseInt(id, 10)

      if (isNaN(courtId)) {
        throw new ServiceError(
          ErrorCode.VALIDATION_ERROR,
          '유효하지 않은 코트 ID입니다.',
        )
      }

      await deleteCourt(courtId)

      return NextResponse.json({
        success: true,
        message: '코트가 삭제되었습니다.',
      })
    } catch (error) {
      console.error('코트 삭제 에러:', error)
      return handleApiError(error, '코트 삭제 중 오류가 발생했습니다.')
    }
  })
}
