/**
 * EventAbsence 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import {
  EventAbsence,
  EventAbsenceWithMember,
  EventAbsenceWithDetails,
  CreateEventAbsenceDto,
  UpdateEventAbsenceDto,
  EventAbsenceListResult,
} from './event_absence.model'

// ============ EventAbsence CRUD ============

/**
 * 불참 기록 목록 조회 (페이징)
 */
export async function getEventAbsenceList(
  page: number = 1,
  limit: number = 10
): Promise<EventAbsenceListResult> {
  const offset = (page - 1) * limit

  const [list, countResult] = (await Promise.all([
    sql`
      SELECT
        ea.*,
        m.name AS member_name,
        m.nickname AS member_nickname,
        r.name AS reporter_name,
        r.nickname AS reporter_nickname,
        e.title AS event_title
      FROM event_absence ea
      JOIN member m ON ea.member_seq = m.seq
      JOIN events e ON ea.event_id = e.id
      LEFT JOIN member r ON ea.reported_by = r.seq
      ORDER BY ea.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total FROM event_absence
    `,
  ])) as [EventAbsenceWithDetails[], { total: number }[]]

  return {
    list,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * 특정 이벤트의 불참 기록 목록 조회
 */
export async function getEventAbsencesByEventId(
  eventId: number
): Promise<EventAbsenceWithMember[]> {
  const result = (await sql`
    SELECT
      ea.*,
      m.name AS member_name,
      m.nickname AS member_nickname
    FROM event_absence ea
    JOIN member m ON ea.member_seq = m.seq
    WHERE ea.event_id = ${eventId}
    ORDER BY ea.created_at DESC
  `) as EventAbsenceWithMember[]

  return result
}

/**
 * 특정 회원의 불참 기록 목록 조회
 */
export async function getEventAbsencesByMemberSeq(
  memberSeq: number
): Promise<EventAbsenceWithDetails[]> {
  const result = (await sql`
    SELECT
      ea.*,
      m.name AS member_name,
      m.nickname AS member_nickname,
      r.name AS reporter_name,
      r.nickname AS reporter_nickname,
      e.title AS event_title
    FROM event_absence ea
    JOIN member m ON ea.member_seq = m.seq
    JOIN events e ON ea.event_id = e.id
    LEFT JOIN member r ON ea.reported_by = r.seq
    WHERE ea.member_seq = ${memberSeq}
    ORDER BY ea.created_at DESC
  `) as EventAbsenceWithDetails[]

  return result
}

/**
 * 불참 기록 단건 조회
 */
export async function getEventAbsenceById(
  id: number
): Promise<EventAbsenceWithDetails | null> {
  const result = (await sql`
    SELECT
      ea.*,
      m.name AS member_name,
      m.nickname AS member_nickname,
      r.name AS reporter_name,
      r.nickname AS reporter_nickname,
      e.title AS event_title
    FROM event_absence ea
    JOIN member m ON ea.member_seq = m.seq
    JOIN events e ON ea.event_id = e.id
    LEFT JOIN member r ON ea.reported_by = r.seq
    WHERE ea.id = ${id}
  `) as EventAbsenceWithDetails[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 특정 이벤트-회원의 불참 기록 조회
 */
export async function getEventAbsenceByEventAndMember(
  eventId: number,
  memberSeq: number
): Promise<EventAbsence | null> {
  const result = (await sql`
    SELECT * FROM event_absence
    WHERE event_id = ${eventId} AND member_seq = ${memberSeq}
  `) as EventAbsence[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 불참 기록 생성
 */
export async function createEventAbsence(
  data: CreateEventAbsenceDto
): Promise<EventAbsence> {
  const {
    event_id,
    member_seq,
    absence_type,
    reason,
    late_minutes,
    reported_by,
  } = data

  const result = (await sql`
    INSERT INTO event_absence (
      event_id,
      member_seq,
      absence_type,
      reason,
      late_minutes,
      reported_by,
      created_at,
      updated_at
    )
    VALUES (
      ${event_id},
      ${member_seq},
      ${absence_type},
      ${reason},
      ${late_minutes || null},
      ${reported_by || null},
      NOW(),
      NOW()
    )
    RETURNING *
  `) as EventAbsence[]

  return result[0]
}

/**
 * 불참 기록 수정
 */
export async function updateEventAbsence(
  data: UpdateEventAbsenceDto
): Promise<EventAbsence> {
  const { id, absence_type, reason, late_minutes } = data

  const result = (await sql`
    UPDATE event_absence
    SET
      absence_type = ${absence_type},
      reason = ${reason},
      late_minutes = ${late_minutes || null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as EventAbsence[]

  return result[0]
}

/**
 * 불참 기록 삭제
 */
export async function deleteEventAbsence(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM event_absence WHERE id = ${id}
  `
  return (result as { count?: number }).count !== 0
}

/**
 * 회원의 불참 횟수 조회
 */
export async function getAbsenceCountByMember(
  memberSeq: number,
  absenceType?: string
): Promise<number> {
  const result = (await sql`
    SELECT COUNT(*) AS count
    FROM event_absence
    WHERE member_seq = ${memberSeq}
      AND (${absenceType ?? null} IS NULL OR absence_type = ${absenceType ?? null})
  `) as { count: number }[]

  return Number(result[0].count)
}
