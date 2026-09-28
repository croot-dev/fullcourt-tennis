/**
 * 이미지 서비스 레이어
 * 업로드 파일 검증 및 저장/조회 처리
 */

import 'server-only'
import { randomUUID } from 'crypto'
import {
  saveImage,
  findImageByKey,
  updatePostIdByContentImageKeys,
  findExpiredImageKeys,
  deleteImages,
  findRecentPostImages,
} from './image.repository'
import {
  IMAGE_CONTENT_TYPES,
  IMAGE_KEY_PATTERN,
  IMAGE_MAX_BYTES,
  IMAGE_URL_PREFIX,
  ImageExtension,
  StoredImage,
  UploadedImageDto,
  RecentPostImageDto,
  toImageUrl,
} from './image.model'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 파일 헤더(매직 바이트)로 실제 이미지 형식 판별
 * 클라이언트가 보낸 MIME 타입은 신뢰하지 않는다
 */
function detectImageExtension(bytes: Uint8Array): ImageExtension | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte)

  if (startsWith([0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return 'gif'
  // RIFF....WEBP
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'webp'
  }
  return null
}

// 익명 업로드 시 저장하는 업로더 값 (익명 게시글의 writer_seq 와 동일)
const ANONYMOUS_UPLOADER_SEQ = 0

/**
 * 게시글 이미지 등록
 * @param isAnonymous 익명 게시판용 업로드 여부 (업로더 정보를 저장하지 않음)
 */
export async function registerPostImage(
  data: ArrayBuffer,
  uploaderSeq: number,
  isAnonymous: boolean = false
): Promise<UploadedImageDto> {
  if (!uploaderSeq) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '작성자 정보가 필요합니다.')
  }

  if (data.byteLength === 0) {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '빈 파일입니다.')
  }

  if (data.byteLength > IMAGE_MAX_BYTES) {
    throw new ServiceError(
      ErrorCode.VALIDATION_ERROR,
      '이미지는 5MB 이하만 업로드할 수 있습니다.'
    )
  }

  const extension = detectImageExtension(new Uint8Array(data).subarray(0, 12))
  if (!extension) {
    throw new ServiceError(
      ErrorCode.VALIDATION_ERROR,
      'JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.'
    )
  }

  const key = `${randomUUID()}.${extension}`
  await saveImage(
    key,
    data,
    IMAGE_CONTENT_TYPES[extension],
    isAnonymous ? ANONYMOUS_UPLOADER_SEQ : uploaderSeq
  )

  return { key, url: toImageUrl(key) }
}

/**
 * 게시글 이미지 조회
 */
export async function getPostImage(key: string): Promise<StoredImage | null> {
  if (!IMAGE_KEY_PATTERN.test(key)) {
    return null
  }

  return findImageByKey(key)
}

/**
 * 게시판 최신 이미지 조회 (홈 커뮤니티 미리보기용)
 */
export async function getRecentPostImages(
  bbsTypeId: number,
  limit: number = 6
): Promise<RecentPostImageDto[]> {
  const safeLimit =
    Number.isInteger(limit) && limit >= 1 && limit <= 30 ? limit : 6
  return findRecentPostImages(bbsTypeId, safeLimit)
}

// 연결되지 않은 이미지(작성 취소, 본문에서 제거)는 하루 뒤 정리
const ORPHAN_IMAGE_TTL_HOURS = 24
// 삭제된 게시글의 이미지는 복구 가능 기간이 지난 뒤 정리
const DELETED_POST_IMAGE_TTL_DAYS = 30
// 한 번 실행에서 처리할 최대 개수 (함수 실행 시간 제한 대비)
const CLEANUP_BATCH_SIZE = 200

const CONTENT_IMAGE_KEY_REGEX = new RegExp(
  `${IMAGE_URL_PREFIX}([0-9a-f-]{36}\\.(?:jpg|png|gif|webp))`,
  'g'
)

function extractImageKeys(content: string): string[] {
  const keys = Array.from(content.matchAll(CONTENT_IMAGE_KEY_REGEX), (m) => m[1])
  return [...new Set(keys)].filter((key) => IMAGE_KEY_PATTERN.test(key))
}

/**
 * 게시글 본문에 포함된 이미지를 게시글에 연결하고, 빠진 이미지는 연결 해제
 */
export async function assignPostImages(
  postId: number,
  content: string
): Promise<void> {
  await updatePostIdByContentImageKeys(postId, extractImageKeys(content))
}

/**
 * 만료된 이미지 정리 (Blobs 파일 + 추적 정보)
 * @returns 삭제한 이미지 수
 */
export async function removeExpiredPostImages(): Promise<number> {
  const keys = await findExpiredImageKeys(
    ORPHAN_IMAGE_TTL_HOURS,
    DELETED_POST_IMAGE_TTL_DAYS,
    CLEANUP_BATCH_SIZE
  )

  if (keys.length === 0) return 0

  await deleteImages(keys)
  return keys.length
}
