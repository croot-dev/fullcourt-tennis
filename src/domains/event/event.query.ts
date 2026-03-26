/**
 * Event 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import {
  Event,
  EventWithHost,
  EventParticipant,
  EventComment,
  EventCommentWithMember,
  EventParticipantLog,
  CreateEventDto,
  UpdateEventDto,
  CreateEventCommentDto,
  EventListResult,
  EventParticipantStatus,
  EventParticipantStatusType,
  EventActionTypeType,
} from './event.model'

// ============ Event CRUD ============

export interface EventListFilter {
  year?: number
  month?: number
}

/**
 * 이벤트 목록 조회 (페이징)
 * filter.year, filter.month가 주어지면 해당 월에 걸치는 이벤트만 조회
 */
export async function getEventList(
  page: number = 1,
  limit: number = 10,
  filter?: EventListFilter,
): Promise<EventListResult> {
  const offset = (page - 1) * limit

  if (filter?.year && filter?.month) {
    const startOfMonth = `${filter.year}-${String(filter.month).padStart(2, '0')}-01`
    const nextMonth = filter.month === 12 ? 1 : filter.month + 1
    const nextYear = filter.month === 12 ? filter.year + 1 : filter.year
    const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const [events, countResult] = (await Promise.all([
      sql`
        SELECT
          e.*,
          m.name AS host_name,
          m.nickname AS host_nickname
        FROM events e
        JOIN member m ON e.host_member_seq = m.seq
        WHERE e.start_datetime < ${startOfNextMonth}
          AND e.end_datetime >= ${startOfMonth}
        ORDER BY e.start_datetime DESC, e.end_datetime DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*) as total FROM events
        WHERE start_datetime < ${startOfNextMonth}
          AND end_datetime >= ${startOfMonth}
      `,
    ])) as [EventWithHost[], { total: number }[]]

    return {
      events,
      total: Number(countResult[0].total),
      totalPages: Math.ceil(Number(countResult[0].total) / limit),
    }
  }

  const [events, countResult] = (await Promise.all([
    sql`
      SELECT
        e.*,
        m.name AS host_name,
        m.nickname AS host_nickname
      FROM events e
      JOIN member m ON e.host_member_seq = m.seq
      ORDER BY e.start_datetime DESC, e.end_datetime DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total FROM events
    `,
  ])) as [EventWithHost[], { total: number }[]]

  return {
    events,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * 이벤트 단건 조회
 */
export async function getEventById(id: number): Promise<EventWithHost | null> {
  const result = (await sql`
    SELECT
      e.*,
      m.name AS host_name,
      m.nickname AS host_nickname
    FROM events e
    JOIN member m ON e.host_member_seq = m.seq
    WHERE e.id = ${id}
  `) as EventWithHost[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 이벤트 생성
 */
export async function createEvent(data: CreateEventDto): Promise<Event> {
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    location_name,
    location_url,
    max_participants,
    host_member_seq,
  } = data

  const result = (await sql`
    INSERT INTO events (
      title,
      description,
      start_datetime,
      end_datetime,
      location_name,
      location_url,
      max_participants,
      current_participants,
      host_member_seq,
      created_at,
      updated_at
    )
    VALUES (
      ${title},
      ${description || null},
      ${start_datetime},
      ${end_datetime},
      ${location_name || null},
      ${location_url || null},
      ${max_participants},
      0,
      ${host_member_seq},
      NOW(),
      NOW()
    )
    RETURNING *
  `) as Event[]

  return result[0]
}

/**
 * 이벤트 수정
 */
export async function updateEvent(data: UpdateEventDto): Promise<Event> {
  const {
    id,
    title,
    description,
    start_datetime,
    end_datetime,
    location_name,
    location_url,
    max_participants,
  } = data

  const result = (await sql`
    UPDATE events
    SET
      title = ${title},
      description = ${description || null},
      start_datetime = ${start_datetime},
      end_datetime = ${end_datetime},
      location_name = ${location_name || null},
      location_url = ${location_url || null},
      max_participants = ${max_participants},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as Event[]

  return result[0]
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM events WHERE id = ${id}
  `
  return (result as { count?: number }).count !== 0
}

// ============ Participant CRUD ============

/**
 * 이벤트 참여자 목록 조회
 */
export async function getEventParticipants(
  eventId: number,
): Promise<EventParticipant[]> {
  const result = (await sql`
    SELECT
      ep.*,
      m.name,
      m.nickname,
      m.birthdate,
      m.gender
    FROM event_participants ep
    JOIN member m ON ep.member_seq = m.seq
    WHERE ep.event_id = ${eventId}
      AND ep.status IN (${EventParticipantStatus.JOIN}, ${EventParticipantStatus.WAIT})
    ORDER BY
      CASE ep.status
        WHEN 'JOIN' THEN 1
        WHEN 'WAIT' THEN 2
        ELSE 3
      END,
      ep.wait_order NULLS LAST,
      ep.created_at ASC
  `) as EventParticipant[]

  return result
}

/**
 * 특정 회원의 이벤트 참여 정보 조회
 */
export async function getParticipantByEventAndMember(
  eventId: number,
  memberSeq: number,
): Promise<EventParticipant | null> {
  const result = (await sql`
    SELECT * FROM event_participants
    WHERE event_id = ${eventId} AND member_seq = ${memberSeq}
  `) as EventParticipant[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 이벤트 참여 신청 (JOIN 또는 WAIT)
 */
export async function createParticipant(
  eventId: number,
  memberSeq: number,
  status: EventParticipantStatusType,
  waitOrder: number | null,
): Promise<EventParticipant> {
  const result = (await sql`
    INSERT INTO event_participants (
      event_id,
      member_seq,
      status,
      wait_order,
      created_at,
      updated_at
    )
    VALUES (
      ${eventId},
      ${memberSeq},
      ${status},
      ${waitOrder},
      NOW(),
      NOW()
    )
    RETURNING *
  `) as EventParticipant[]

  return result[0]
}

/**
 * 참여 상태 변경
 */
export async function updateParticipantStatus(
  eventId: number,
  memberSeq: number,
  status: EventParticipantStatusType,
  waitOrder: number | null,
): Promise<EventParticipant> {
  const result = (await sql`
    UPDATE event_participants
    SET
      status = ${status},
      wait_order = ${waitOrder},
      updated_at = NOW()
    WHERE event_id = ${eventId} AND member_seq = ${memberSeq}
    RETURNING *
  `) as EventParticipant[]

  return result[0]
}

/**
 * 현재 대기 순번 중 최대값 조회
 */
export async function getMaxWaitOrder(eventId: number): Promise<number> {
  const result = (await sql`
    SELECT COALESCE(MAX(wait_order), 0) AS max_order
    FROM event_participants
    WHERE event_id = ${eventId} AND status = ${EventParticipantStatus.WAIT}
  `) as { max_order: number }[]

  return result[0].max_order
}

/**
 * 대기자 중 1순위 조회
 */
export async function getFirstWaiter(
  eventId: number,
): Promise<EventParticipant | null> {
  const result = (await sql`
    SELECT * FROM event_participants
    WHERE event_id = ${eventId} AND status = ${EventParticipantStatus.WAIT}
    ORDER BY wait_order ASC
    LIMIT 1
  `) as EventParticipant[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 이벤트 현재 참여자 수 업데이트
 * @deprecated syncEventParticipantCount 사용 권장 (레이스컨디션 방지)
 */
export async function updateEventCurrentParticipants(
  eventId: number,
  count: number,
): Promise<void> {
  await sql`
    UPDATE events
    SET current_participants = ${count}, updated_at = NOW()
    WHERE id = ${eventId}
  `
}

/**
 * 이벤트 현재 참여자 수 동기화 (원자적)
 * JOIN 상태 참여자 수를 서브쿼리로 직접 계산하여 레이스컨디션 방지
 */
export async function syncEventParticipantCount(eventId: number): Promise<void> {
  await sql`
    UPDATE events
    SET current_participants = (
      SELECT COUNT(*)
      FROM event_participants
      WHERE event_id = ${eventId} AND status = ${EventParticipantStatus.JOIN}
    ),
    updated_at = NOW()
    WHERE id = ${eventId}
  `
}

/**
 * 이벤트의 JOIN 상태 참여자 수 조회
 */
export async function getJoinedParticipantCount(
  eventId: number,
): Promise<number> {
  const result = (await sql`
    SELECT COUNT(*) AS count
    FROM event_participants
    WHERE event_id = ${eventId} AND status = ${EventParticipantStatus.JOIN}
  `) as { count: number }[]

  return Number(result[0].count)
}

// ============ Comment CRUD ============

/**
 * 이벤트 댓글 목록 조회
 */
export async function getEventComments(
  eventId: number,
): Promise<EventCommentWithMember[]> {
  const result = (await sql`
    SELECT
      ec.*,
      m.name AS member_name,
      m.nickname AS member_nickname
    FROM event_comments ec
    JOIN member m ON ec.member_seq = m.seq
    WHERE ec.event_id = ${eventId}
    ORDER BY ec.created_at ASC
  `) as EventCommentWithMember[]

  return result
}

/**
 * 댓글 단건 조회
 */
export async function getCommentById(id: number): Promise<EventComment | null> {
  const result = (await sql`
    SELECT * FROM event_comments WHERE id = ${id}
  `) as EventComment[]

  return Array.isArray(result) && result.length > 0 ? result[0] : null
}

/**
 * 댓글 생성
 */
export async function createComment(
  data: CreateEventCommentDto,
): Promise<EventComment> {
  const { event_id, member_seq, content } = data

  const result = (await sql`
    INSERT INTO event_comments (
      event_id,
      member_seq,
      content,
      created_at,
      updated_at
    )
    VALUES (
      ${event_id},
      ${member_seq},
      ${content},
      NOW(),
      NOW()
    )
    RETURNING *
  `) as EventComment[]

  return result[0]
}

/**
 * 댓글 수정
 */
export async function updateComment(
  id: number,
  content: string,
): Promise<EventComment> {
  const result = (await sql`
    UPDATE event_comments
    SET content = ${content}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as EventComment[]

  return result[0]
}

/**
 * 댓글 삭제
 */
export async function deleteComment(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM event_comments WHERE id = ${id}
  `
  return (result as { count?: number }).count !== 0
}

// ============ Participant Log ============

/**
 * 참여 변경 로그 생성
 */
export async function createParticipantLog(
  eventId: number,
  memberSeq: number,
  fromStatus: EventParticipantStatusType | null,
  toStatus: EventParticipantStatusType,
  actionType: EventActionTypeType,
  actorMemberSeq: number | null,
): Promise<EventParticipantLog> {
  const result = (await sql`
    INSERT INTO event_participant_logs (
      event_id,
      member_seq,
      from_status,
      to_status,
      action_type,
      actor_member_seq,
      created_at
    )
    VALUES (
      ${eventId},
      ${memberSeq},
      ${fromStatus},
      ${toStatus},
      ${actionType},
      ${actorMemberSeq},
      NOW()
    )
    RETURNING *
  `) as EventParticipantLog[]

  return result[0]
}

/**
 * 이벤트의 참여 변경 로그 조회
 */
export async function getEventParticipantLogs(
  eventId: number,
): Promise<EventParticipantLog[]> {
  const result = (await sql`
    SELECT * FROM event_participant_logs
    WHERE event_id = ${eventId}
    ORDER BY created_at DESC
  `) as EventParticipantLog[]

  return result
}

/**
 * JOIN 상태 참여자 목록 조회 (늦게 참여한 순으로 정렬)
 */
export async function getJoinedParticipantsOrderByLatest(
  eventId: number,
): Promise<EventParticipant[]> {
  const result = (await sql`
    SELECT * FROM event_participants
    WHERE event_id = ${eventId} AND status = ${EventParticipantStatus.JOIN}
    ORDER BY created_at DESC
  `) as EventParticipant[]

  return result
}

/**
 * 회원이 참여한 이벤트 목록 조회 (JOIN 또는 WAIT 상태)
 */
export async function getMyEvents(
  memberSeq: number,
  limit: number = 5,
): Promise<EventWithHost[]> {
  const result = (await sql`
    SELECT
      e.*,
      m.name AS host_name,
      m.nickname AS host_nickname,
      ep.status AS my_status
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    JOIN member m ON e.host_member_seq = m.seq
    WHERE ep.member_seq = ${memberSeq}
      AND ep.status IN (${EventParticipantStatus.JOIN}, ${EventParticipantStatus.WAIT})
      AND e.start_datetime >= NOW()
    ORDER BY e.start_datetime ASC
    LIMIT ${limit}
  `) as EventWithHost[]

  return result
}
