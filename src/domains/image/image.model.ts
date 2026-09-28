/**
 * Image 모델
 * 게시글 본문에 삽입되는 이미지 정의 (Netlify Blobs 저장)
 */

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024 // 5MB

export const IMAGE_CONTENT_TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
} as const

export type ImageExtension = keyof typeof IMAGE_CONTENT_TYPES

export const IMAGE_URL_PREFIX = '/api/images/'

// 서버에서 생성한 키 형식: <uuid>.<ext>
export const IMAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|gif|webp)$/

export interface StoredImage {
  data: ArrayBuffer
  contentType: string
}

export interface UploadedImageDto {
  key: string
  url: string
}

export interface RecentPostImageDto {
  post_id: number
  url: string
}

export function toImageUrl(key: string): string {
  return `${IMAGE_URL_PREFIX}${key}`
}

export function isImageUrl(src: string): boolean {
  if (!src.startsWith(IMAGE_URL_PREFIX)) return false
  return IMAGE_KEY_PATTERN.test(src.slice(IMAGE_URL_PREFIX.length))
}
