import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { registerPostImage, IMAGE_MAX_BYTES } from '@/domains/image'
import { getMemberById } from '@/domains/member'
import { handleApiError } from '@/lib/api.error'
import { ServiceError, ErrorCode } from '@/lib/error'
import { createRateLimiter } from '@/lib/rate-limit.server'

// multipart 경계/헤더 여유분
const MULTIPART_OVERHEAD_BYTES = 64 * 1024

// 회원당 10분에 20장
const UPLOAD_LIMIT = 20
const UPLOAD_WINDOW_MS = 10 * 60 * 1000
const uploadRateLimiter = createRateLimiter(UPLOAD_LIMIT, UPLOAD_WINDOW_MS)

// 게시글 이미지 업로드 API (인증 필요)
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const contentLength = Number(req.headers.get('content-length') || 0)
      if (contentLength > IMAGE_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) {
        throw new ServiceError(
          ErrorCode.VALIDATION_ERROR,
          '이미지는 5MB 이하만 업로드할 수 있습니다.'
        )
      }

      const member = await getMemberById(user.memberId)
      if (!member) {
        throw new ServiceError(
          ErrorCode.UNAUTHORIZED,
          '회원 정보를 찾을 수 없습니다.'
        )
      }

      if (!uploadRateLimiter.consume(String(member.seq))) {
        throw new ServiceError(
          ErrorCode.TOO_MANY_REQUESTS,
          '이미지를 너무 많이 올렸습니다. 잠시 후 다시 시도해주세요.'
        )
      }

      const formData = await authenticatedReq.formData()
      const file = formData.get('file')
      if (!(file instanceof File)) {
        throw new ServiceError(
          ErrorCode.MISSING_REQUIRED_FIELD,
          '업로드할 이미지를 선택해주세요.'
        )
      }

      // 익명 게시판: 업로더 정보를 남기지 않는다
      const isAnonymous = formData.get('anonymous') === 'true'

      const result = await registerPostImage(
        await file.arrayBuffer(),
        member.seq,
        isAnonymous
      )

      return NextResponse.json(result)
    } catch (error) {
      console.error('이미지 업로드 에러:', error)
      return handleApiError(error, '이미지 업로드 중 오류가 발생했습니다.')
    }
  })
}
