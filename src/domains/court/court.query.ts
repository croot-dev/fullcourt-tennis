/**
 * TennisCourt 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import {
  TennisCourt,
  CreateCourtDto,
  UpdateCourtDto,
  CourtListResult,
} from './court.model'

/**
 * 코트 목록 조회 (페이징)
 */
export async function getCourtList(
  page: number = 1,
  limit: number = 10,
  isIndoor?: boolean,
): Promise<CourtListResult> {
  const offset = (page - 1) * limit

  const [courts, countResult] = (await Promise.all([
    isIndoor === undefined
      ? sql`
          SELECT * FROM tennis_courts
          ORDER BY name DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : sql`
          SELECT * FROM tennis_courts
          WHERE is_indoor = ${isIndoor}
          ORDER BY name DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
    isIndoor === undefined
      ? sql`SELECT COUNT(*) as total FROM tennis_courts`
      : sql`SELECT COUNT(*) as total FROM tennis_courts WHERE is_indoor = ${isIndoor}`,
  ])) as [TennisCourt[], { total: number }[]]

  return {
    courts,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * 코트 단건 조회
 */
export async function getCourtById(
  courtId: number
): Promise<TennisCourt | null> {
  const result = (await sql`
    SELECT * FROM tennis_courts WHERE court_id = ${courtId}
  `) as TennisCourt[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 코트 생성
 */
export async function createCourt(data: CreateCourtDto): Promise<TennisCourt> {
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
  } = data

  const result = (await sql`
    INSERT INTO tennis_courts (
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
      created_at,
      updated_at
    )
    VALUES (
      ${name},
      ${naver_place_id || null},
      ${naver_business_id || null},
      ${rsv_url || null},
      ${address || null},
      ${is_indoor ?? null},
      ${court_type || null},
      ${court_count ?? null},
      ${amenities ? JSON.stringify(amenities) : null}::jsonb,
      ${tags ? JSON.stringify(tags) : null}::jsonb,
      ${memo || null},
      NOW(),
      NOW()
    )
    RETURNING *
  `) as TennisCourt[]

  return result[0]
}

/**
 * 코트 수정
 */
export async function updateCourt(data: UpdateCourtDto): Promise<TennisCourt> {
  const {
    court_id,
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
  } = data

  const result = (await sql`
    UPDATE tennis_courts
    SET
      name = ${name},
      naver_place_id = ${naver_place_id || null},
      naver_business_id = ${naver_business_id || null},
      rsv_url = ${rsv_url || null},
      address = ${address || null},
      is_indoor = ${is_indoor ?? null},
      court_type = ${court_type || null},
      court_count = ${court_count ?? null},
      amenities = ${amenities ? JSON.stringify(amenities) : null}::jsonb,
      tags = ${tags ? JSON.stringify(tags) : null}::jsonb,
      memo = ${memo || null},
      updated_at = NOW()
    WHERE court_id = ${court_id}
    RETURNING *
  `) as TennisCourt[]

  return result[0]
}

/**
 * 코트 삭제
 */
export async function deleteCourt(courtId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM tennis_courts WHERE court_id = ${courtId}
  `
  return (result as { count?: number }).count !== 0
}
