import imageCompression from 'browser-image-compression'
import { authenticatedFetch } from './api.client'
import type { UploadedImageDto } from '@/domains/image/image.model'

export const UPLOADABLE_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

// 휴대폰 원본 사진(4~10MB)을 본문 표시용 크기로 축소
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
}

/**
 * 게시글 이미지 업로드
 * GIF는 압축 시 애니메이션이 사라지므로 원본 그대로 업로드
 */
export async function uploadPostImage(
  file: File,
  isAnonymous: boolean = false
): Promise<UploadedImageDto> {
  const upload =
    file.type === 'image/gif'
      ? file
      : await imageCompression(file, COMPRESSION_OPTIONS)

  const formData = new FormData()
  formData.append('file', upload, file.name)
  if (isAnonymous) {
    formData.append('anonymous', 'true')
  }

  const response = await authenticatedFetch('/api/images', {
    method: 'POST',
    body: formData,
  })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error ?? '이미지 업로드에 실패했습니다.')
  }

  return body as UploadedImageDto
}
