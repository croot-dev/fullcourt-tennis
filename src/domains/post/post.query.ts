/**
 * Post 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import { PostListItem, PostDto, CreatePostDto } from './post.model'
import { ResponseList, ResponsePaging } from '../common/response.query'

/**
 * 게시글 목록 조회
 */
export async function getPostList(
  bbs_type_id: number = 1,
  page: number = 1,
  limit: number = 10,
): Promise<ResponseList<PostListItem>> {
  const offset = (page - 1) * limit
  const conditions = [
    sql`bbs_type_id = ${bbs_type_id}`,
    sql`deleted_at IS NULL`,
    sql`(display_start_at IS NULL OR display_start_at <= NOW())`,
    sql`(display_end_at IS NULL OR display_end_at >= NOW())`,
  ]
  const whereClause = conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`)

  const [posts, countResult] = (await Promise.all([
    sql`
      SELECT
        p.post_id,
        p.bbs_type_id,
        p.title,
        p.writer_seq,
        p.view_count,
        p.created_at,
        p.updated_at,
        m.nickname as writer_name
      FROM bbs_post p
      LEFT JOIN member m
        ON p.writer_seq = m.seq
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total
      FROM bbs_post p
      WHERE ${whereClause}
    `,
  ])) as [PostListItem[], ResponsePaging[]]

  return {
    list: posts,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/** 홈의 최신 게시글 미리보기 (페이지 수가 필요하지 않으므로 COUNT 생략). */
export async function selectRecentPosts(
  bbsTypeId: number,
  limit: number,
): Promise<PostListItem[]> {
  return (await sql`
    SELECT
      p.post_id, p.bbs_type_id, p.title, p.writer_seq,
      p.view_count, p.created_at, p.updated_at,
      m.nickname AS writer_name
    FROM bbs_post p
    LEFT JOIN member m ON p.writer_seq = m.seq
    WHERE p.bbs_type_id = ${bbsTypeId}
      AND p.deleted_at IS NULL
      AND (p.display_start_at IS NULL OR p.display_start_at <= NOW())
      AND (p.display_end_at IS NULL OR p.display_end_at >= NOW())
    ORDER BY p.created_at DESC, p.post_id DESC
    LIMIT ${limit}
  `) as PostListItem[]
}

/**
 * 단일 게시글 조회
 */
export async function getPost(
  post_id: number,
  bbs_type_id: number = 1
): Promise<PostListItem | null> {
  const result = (await sql`
    SELECT
      p.post_id,
      p.bbs_type_id,
      p.title,
      p.content,
      p.writer_seq,
      p.view_count,
      p.created_at,
      p.updated_at,
      m.nickname as writer_name
    FROM bbs_post p
      LEFT JOIN member m
        ON p.writer_seq = m.seq
    WHERE post_id = ${post_id}
      AND bbs_type_id = ${bbs_type_id}
      AND p.deleted_at IS NULL
  `) as PostListItem[]

  return result[0] || null
}

/**
 * 게시글 생성
 */
export async function createPost(data: CreatePostDto) {
  const { bbs_type_id, title, content, writer_seq } = data
  // 데이터베이스에 게시글 저장
  const newPost = await sql`
    INSERT INTO bbs_post (
      bbs_type_id,
      title,
      content,
      writer_seq,
      created_at,
      updated_at
    )
    VALUES (
      ${bbs_type_id},
      ${title},
      ${content},
      ${writer_seq},
      NOW(),
      NOW()
    )
    RETURNING post_id, bbs_type_id, title, content, writer_seq, view_count, created_at, updated_at
  `

  return newPost[0] as PostListItem
}

/**
 * 게시글 수정
 */
export async function updatePost(
  post_id: number,
  bbs_type_id: number,
  data: { title: string; content: string }
): Promise<PostDto | null> {
  const { title, content } = data

  const updatedPost = (await sql`
    UPDATE bbs_post
    SET
      title = ${title.trim()},
      content = ${content.trim()},
      updated_at = NOW()
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
      AND deleted_at IS NULL
    RETURNING post_id, bbs_type_id, title, content, writer_seq, view_count, created_at, updated_at
  `) as PostDto[]

  return updatedPost[0] || null
}

/**
 * 게시글 삭제 (소프트 삭제: deleted_at 기록)
 */
export async function deletePost(
  post_id: number,
  bbs_type_id: number
): Promise<boolean> {
  const result = await sql`
    UPDATE bbs_post
    SET deleted_at = NOW()
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
      AND deleted_at IS NULL
    RETURNING post_id
  `

  return result.length > 0
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(
  post_id: number,
  bbs_type_id: number
): Promise<void> {
  await sql`
    UPDATE bbs_post
    SET view_count = view_count + 1
    WHERE post_id = ${post_id} AND bbs_type_id = ${bbs_type_id}
      AND deleted_at IS NULL
  `
}
