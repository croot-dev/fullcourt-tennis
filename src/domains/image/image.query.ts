/**
 * Image 데이터 액세스 레이어
 * bbs_post_image 테이블 SQL만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'

export async function insertPostImage(
  imageKey: string,
  uploaderSeq: number
): Promise<void> {
  await sql`
    INSERT INTO bbs_post_image (image_key, uploader_seq)
    VALUES (${imageKey}, ${uploaderSeq})
  `
}

/**
 * 본문에 포함된 이미지를 게시글에 연결
 * 다른 게시글에 이미 연결된 이미지는 건드리지 않는다
 */
export async function updatePostIdByImageKeys(
  postId: number,
  imageKeys: string[]
): Promise<void> {
  await sql`
    UPDATE bbs_post_image
    SET post_id = ${postId}
    WHERE image_key = ANY(${imageKeys}::text[])
      AND (post_id IS NULL OR post_id = ${postId})
  `
}

/**
 * 본문에서 빠진 이미지의 게시글 연결 해제 (정리 대상이 됨)
 */
export async function updatePostIdToNullExceptImageKeys(
  postId: number,
  imageKeys: string[]
): Promise<void> {
  await sql`
    UPDATE bbs_post_image
    SET post_id = NULL
    WHERE post_id = ${postId}
      AND NOT (image_key = ANY(${imageKeys}::text[]))
  `
}

/**
 * 정리 대상 이미지 키 조회
 * - 게시글에 연결되지 않고 orphanHours 이상 지난 이미지
 * - 삭제된 지 deletedDays 이상 지난 게시글의 이미지
 * 연결 누락에 대비해, 삭제되지 않은 게시글 본문에 키가 남아 있으면 제외
 */
export async function selectExpiredImageKeys(
  orphanHours: number,
  deletedDays: number,
  limit: number
): Promise<string[]> {
  const rows = (await sql`
    SELECT i.image_key
    FROM bbs_post_image i
    LEFT JOIN bbs_post p ON p.post_id = i.post_id
    WHERE (
        (i.post_id IS NULL
          AND i.created_at < NOW() - make_interval(hours => ${orphanHours}))
        OR (p.deleted_at IS NOT NULL
          AND p.deleted_at < NOW() - make_interval(days => ${deletedDays}))
      )
      AND NOT EXISTS (
        SELECT 1 FROM bbs_post live
        WHERE live.deleted_at IS NULL
          AND live.content LIKE '%' || i.image_key || '%'
      )
    ORDER BY i.created_at
    LIMIT ${limit}
  `) as { image_key: string }[]

  return rows.map((row) => row.image_key)
}

export async function deletePostImagesByKeys(
  imageKeys: string[]
): Promise<void> {
  await sql`
    DELETE FROM bbs_post_image
    WHERE image_key = ANY(${imageKeys}::text[])
  `
}
