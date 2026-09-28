/**
 * 이미지 Repository 레이어
 * Netlify Blobs(파일)와 bbs_post_image(추적 정보) 접근을 담당
 */

import 'server-only'
import { getPostImageStore } from '@/lib/blob.server'
import { StoredImage } from './image.model'
import {
  insertPostImage,
  updatePostIdByImageKeys,
  updatePostIdToNullExceptImageKeys,
  selectExpiredImageKeys,
  deletePostImagesByKeys,
} from './image.query'

export async function saveImage(
  key: string,
  data: ArrayBuffer,
  contentType: string,
  uploaderSeq: number
): Promise<void> {
  // 추적 정보를 먼저 기록: Blobs 저장이 실패해도 정리 작업이 행을 지운다
  await insertPostImage(key, uploaderSeq)
  await getPostImageStore().set(key, data, {
    metadata: {
      contentType,
      uploaderSeq,
      uploadedAt: new Date().toISOString(),
    },
  })
}

export async function findImageByKey(key: string): Promise<StoredImage | null> {
  const result = await getPostImageStore().getWithMetadata(key, {
    type: 'arrayBuffer',
  })

  if (!result) return null

  return {
    data: result.data,
    contentType: String(result.metadata.contentType ?? ''),
  }
}

/**
 * 게시글의 이미지 연결 상태를 본문 기준으로 맞춘다
 */
export async function updatePostIdByContentImageKeys(
  postId: number,
  imageKeys: string[]
): Promise<void> {
  if (imageKeys.length > 0) {
    await updatePostIdByImageKeys(postId, imageKeys)
  }
  await updatePostIdToNullExceptImageKeys(postId, imageKeys)
}

export async function findExpiredImageKeys(
  orphanHours: number,
  deletedDays: number,
  limit: number
): Promise<string[]> {
  return selectExpiredImageKeys(orphanHours, deletedDays, limit)
}

export async function deleteImages(keys: string[]): Promise<void> {
  const store = getPostImageStore()
  await Promise.all(keys.map((key) => store.delete(key)))
  await deletePostImagesByKeys(keys)
}
