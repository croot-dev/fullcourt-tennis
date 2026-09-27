/**
 * Event 리포지토리 레이어
 * 순수 DB 접근 로직만 담당
 */

import 'server-only'
import {
  type EventListFilter,
  selectUpcomingEvents,
  insertEvents,
  getEventList as getEventListQuery,
  getEventById as getEventByIdQuery,
  createEvent as createEventQuery,
  updateEvent as updateEventQuery,
  deleteEvent as deleteEventQuery,
  getEventParticipants as getEventParticipantsQuery,
  getParticipantByEventAndMember as getParticipantByEventAndMemberQuery,
  createParticipant as createParticipantQuery,
  updateParticipantStatus as updateParticipantStatusQuery,
  getMaxWaitOrder as getMaxWaitOrderQuery,
  getFirstWaiter as getFirstWaiterQuery,
  updateEventCurrentParticipants as updateEventCurrentParticipantsQuery,
  getJoinedParticipantCount as getJoinedParticipantCountQuery,
  getEventComments as getEventCommentsQuery,
  getCommentById as getCommentByIdQuery,
  createComment as createCommentQuery,
  updateComment as updateCommentQuery,
  deleteComment as deleteCommentQuery,
  createParticipantLog as createParticipantLogQuery,
  getEventParticipantLogs as getEventParticipantLogsQuery,
  getJoinedParticipantsOrderByLatest as getJoinedParticipantsOrderByLatestQuery,
  getMyEvents as getMyEventsQuery,
} from './event.query'
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
  EventParticipantStatusType,
  EventActionTypeType,
} from './event.model'

// ============ Event CRUD ============

/**
 * 이벤트 목록 조회 (페이징)
 */
export async function findEventList(
  page: number = 1,
  limit: number = 10,
  filter?: EventListFilter,
): Promise<EventListResult> {
  return getEventListQuery(page, limit, filter)
}

export async function findUpcomingEvents(limit: number): Promise<EventWithHost[]> {
  return selectUpcomingEvents(limit)
}

/**
 * 이벤트 단건 조회
 */
export async function findEventById(id: number): Promise<EventWithHost | null> {
  return getEventByIdQuery(id)
}

/**
 * 이벤트 생성
 */
export async function createEvent(data: CreateEventDto): Promise<Event> {
  return createEventQuery(data)
}

/**
 * 이벤트 수정
 */
export async function updateEvent(data: UpdateEventDto): Promise<Event> {
  return updateEventQuery(data)
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(id: number): Promise<boolean> {
  return deleteEventQuery(id)
}

// ============ Participant CRUD ============

/**
 * 이벤트 참여자 목록 조회
 */
export async function findEventParticipants(
  eventId: number,
): Promise<EventParticipant[]> {
  return getEventParticipantsQuery(eventId)
}

/**
 * 특정 회원의 이벤트 참여 정보 조회
 */
export async function findParticipantByEventAndMember(
  eventId: number,
  memberSeq: number,
): Promise<EventParticipant | null> {
  return getParticipantByEventAndMemberQuery(eventId, memberSeq)
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
  return createParticipantQuery(eventId, memberSeq, status, waitOrder)
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
  return updateParticipantStatusQuery(eventId, memberSeq, status, waitOrder)
}

/**
 * 현재 대기 순번 중 최대값 조회
 */
export async function findMaxWaitOrder(eventId: number): Promise<number> {
  return getMaxWaitOrderQuery(eventId)
}

/**
 * 대기자 중 1순위 조회
 */
export async function findFirstWaiter(
  eventId: number,
): Promise<EventParticipant | null> {
  return getFirstWaiterQuery(eventId)
}

/**
 * 이벤트 현재 참여자 수 업데이트
 */
export async function updateEventCurrentParticipants(
  eventId: number,
  count: number,
): Promise<void> {
  return updateEventCurrentParticipantsQuery(eventId, count)
}

/**
 * 이벤트의 JOIN 상태 참여자 수 조회
 */
export async function findJoinedParticipantCount(
  eventId: number,
): Promise<number> {
  return getJoinedParticipantCountQuery(eventId)
}

/**
 * JOIN 상태 참여자 목록 조회 (늦게 참여한 순으로 정렬)
 */
export async function findJoinedParticipantsOrderByLatest(
  eventId: number,
): Promise<EventParticipant[]> {
  return getJoinedParticipantsOrderByLatestQuery(eventId)
}

// ============ Comment CRUD ============

/**
 * 이벤트 댓글 목록 조회
 */
export async function findEventComments(
  eventId: number,
): Promise<EventCommentWithMember[]> {
  return getEventCommentsQuery(eventId)
}

/**
 * 댓글 단건 조회
 */
export async function findCommentById(
  id: number,
): Promise<EventComment | null> {
  return getCommentByIdQuery(id)
}

/**
 * 댓글 생성
 */
export async function createComment(
  data: CreateEventCommentDto,
): Promise<EventComment> {
  return createCommentQuery(data)
}

/**
 * 댓글 수정
 */
export async function updateComment(
  id: number,
  content: string,
): Promise<EventComment> {
  return updateCommentQuery(id, content)
}

/**
 * 댓글 삭제
 */
export async function deleteComment(id: number): Promise<boolean> {
  return deleteCommentQuery(id)
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
  return createParticipantLogQuery(
    eventId,
    memberSeq,
    fromStatus,
    toStatus,
    actionType,
    actorMemberSeq,
  )
}

/**
 * 이벤트의 참여 변경 로그 조회
 */
export async function findEventParticipantLogs(
  eventId: number,
): Promise<EventParticipantLog[]> {
  return getEventParticipantLogsQuery(eventId)
}

/**
 * 회원이 참여한 이벤트 목록 조회 (JOIN 또는 WAIT 상태)
 */
export async function findMyEvents(
  memberSeq: number,
  limit: number = 5,
): Promise<EventWithHost[]> {
  return getMyEventsQuery(memberSeq, limit)
}

export async function saveEvents(data: CreateEventDto[]): Promise<Event[]> {
  return insertEvents(data)
}
