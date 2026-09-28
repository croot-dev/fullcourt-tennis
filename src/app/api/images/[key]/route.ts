import { NextRequest, NextResponse } from 'next/server'
import { getPostImage } from '@/domains/image'
import { handleApiError } from '@/lib/api.error'
import { ServiceError, ErrorCode } from '@/lib/error'

// 키가 UUID라 내용이 바뀌지 않으므로 장기 캐시
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

// 게시글 이미지 조회 API (인증 불필요)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const image = await getPostImage(key)

    if (!image) {
      throw new ServiceError(ErrorCode.NOT_FOUND, '이미지를 찾을 수 없습니다.')
    }

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': IMAGE_CACHE_CONTROL,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('이미지 조회 에러:', error)
    return handleApiError(error, '이미지 조회 중 오류가 발생했습니다.')
  }
}
