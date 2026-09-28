import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { removeExpiredPostImages } from '@/domains/image'
import { handleApiError } from '@/lib/api.error'
import { ServiceError, ErrorCode } from '@/lib/error'

function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(req.headers.get('authorization') ?? '')
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  )
}

// 만료된 게시글 이미지 정리 API (Netlify 예약 함수에서 호출)
export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedCron(req)) {
      throw new ServiceError(ErrorCode.UNAUTHORIZED, '인증이 필요합니다.')
    }

    const deletedCount = await removeExpiredPostImages()

    return NextResponse.json({ deletedCount })
  } catch (error) {
    console.error('게시글 이미지 정리 에러:', error)
    return handleApiError(error, '게시글 이미지 정리 중 오류가 발생했습니다.')
  }
}
