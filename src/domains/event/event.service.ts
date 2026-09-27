/**
 * Event 서비스 레이어
 * 비즈니스 로직을 처리하고 Repository 레이어를 통해 DB에 접근
 */

import 'server-only'
import {
  Event,
  EventParticipant,
  EventComment,
  CreateEventDto,
  UpdateEventDto,
  CreateEventCommentDto,
  EventListResult,
  EventDetailResult,
  EventParticipantStatus,
  EventActionType,
} from './event.model'
import {
  findEventList,
  findUpcomingEvents,
  saveEvents,
  findEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  findEventParticipants,
  findParticipantByEventAndMember,
  createParticipant,
  updateParticipantStatus,
  findMaxWaitOrder,
  findFirstWaiter,
  updateEventCurrentParticipants,
  findJoinedParticipantCount,
  findEventComments,
  findCommentById,
  createComment,
  updateComment,
  deleteComment,
  createParticipantLog,
  findMyEvents,
  findJoinedParticipantsOrderByLatest,
} from './event.repository'
import type { EventListFilter } from './event.query'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 이벤트 시작 시간이 지났는지 확인
 */
function isEventStarted(event: Event): boolean {
  return new Date(event.start_datetime) <= new Date()
}

// ============ Event Services ============

/**
 * 이벤트 목록 조회
 */
export async function getEventList(
  page: number = 1,
  limit: number = 10,
  filter?: EventListFilter,
): Promise<EventListResult> {
  return await findEventList(page, limit, filter)
}

export async function getUpcomingEvents(limit: number = 2) {
  const safeLimit = Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : 2
  return findUpcomingEvents(safeLimit)
}

/**
 * 이벤트 상세 조회
 */
export async function getEventDetail(
  eventId: number
): Promise<EventDetailResult> {
  const event = await findEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  const [participants, comments] = await Promise.all([
    findEventParticipants(eventId),
    findEventComments(eventId),
  ])

  return { event, participants, comments }
}

/**
 * 이벤트 생성
 */
export async function writeEvent(data: CreateEventDto): Promise<Event> {
  const { title, max_participants, host_member_seq } = data

  if (!title || title.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '제목을 입력해주세요.')
  }

  if (max_participants <= 0) {
    throw new ServiceError(
      ErrorCode.INVALID_INPUT,
      '최대 참여 인원은 1명 이상이어야 합니다.'
    )
  }

  if (!host_member_seq) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '로그인이 필요합니다.')
  }

  return await createEvent(data)
}

/**
 * 이벤트 수정
 */
export async function modifyEvent(
  data: UpdateEventDto,
  requesterMemberSeq: number,
  isAdmin: boolean = false
): Promise<Event> {
  const existingEvent = await findEventById(data.id)

  if (!existingEvent) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 관리자 또는 주최자만 수정 가능
  if (!isAdmin && existingEvent.host_member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 수정할 수 있습니다.'
    )
  }

  // 이벤트 시작 시간이 지났으면 수정 불가
  if (isEventStarted(existingEvent)) {
    throw new ServiceError(
      ErrorCode.ALREADY_STARTED,
      '이벤트 시작 시간이 지나 수정할 수 없습니다.'
    )
  }

  // 최대 인원이 현재 참여자 수보다 작아지면, 늦게 참여한 사람들을 대기로 변경
  const currentJoinCount = await findJoinedParticipantCount(data.id)
  if (data.max_participants < currentJoinCount) {
    const excessCount = currentJoinCount - data.max_participants
    const joinedParticipants = await findJoinedParticipantsOrderByLatest(data.id)

    // 현재 최대 대기 순번 조회
    let currentMaxWaitOrder = await findMaxWaitOrder(data.id)

    // 늦게 참여한 순서대로 excessCount명을 대기로 변경
    for (let i = 0; i < excessCount; i++) {
      const participant = joinedParticipants[i]
      currentMaxWaitOrder += 1

      await updateParticipantStatus(
        data.id,
        participant.member_seq,
        EventParticipantStatus.WAIT,
        currentMaxWaitOrder
      )

      // 로그 기록
      await createParticipantLog(
        data.id,
        participant.member_seq,
        EventParticipantStatus.JOIN,
        EventParticipantStatus.WAIT,
        EventActionType.ADMIN_UPDATE,
        requesterMemberSeq
      )
    }

    // 현재 참여자 수 업데이트
    await updateEventCurrentParticipants(data.id, data.max_participants)
  }

  return await updateEvent(data)
}

/**
 * 이벤트 삭제
 */
export async function removeEvent(
  eventId: number,
  requesterMemberSeq: number
): Promise<boolean> {
  const existingEvent = await findEventById(eventId)

  if (!existingEvent) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 주최자만 삭제 가능
  if (existingEvent.host_member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 삭제할 수 있습니다.'
    )
  }

  return await deleteEvent(eventId)
}

// ============ Participant Services ============

/**
 * 이벤트 참여 신청
 */
export async function joinEvent(
  eventId: number,
  memberSeq: number
): Promise<EventParticipant> {
  const event = await findEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  // 이미 참여 중인지 확인
  const existingParticipant = await findParticipantByEventAndMember(
    eventId,
    memberSeq
  )

  if (existingParticipant) {
    if (existingParticipant.status === EventParticipantStatus.JOIN) {
      throw new ServiceError(
        ErrorCode.ALREADY_JOINED,
        '이미 참여 중인 이벤트입니다.'
      )
    }
    if (existingParticipant.status === EventParticipantStatus.WAIT) {
      throw new ServiceError(
        ErrorCode.ALREADY_WAITING,
        '이미 대기 중인 이벤트입니다.'
      )
    }
  }

  // 정원 확인
  const currentCount = await findJoinedParticipantCount(eventId)
  let participant: EventParticipant

  if (currentCount < event.max_participants) {
    // 바로 참여
    participant = await createParticipant(
      eventId,
      memberSeq,
      EventParticipantStatus.JOIN,
      null
    )
    await updateEventCurrentParticipants(eventId, currentCount + 1)

    // 로그 기록
    await createParticipantLog(
      eventId,
      memberSeq,
      null,
      EventParticipantStatus.JOIN,
      EventActionType.USER_JOIN,
      memberSeq
    )
  } else {
    // 대기 등록
    const maxWaitOrder = await findMaxWaitOrder(eventId)
    participant = await createParticipant(
      eventId,
      memberSeq,
      EventParticipantStatus.WAIT,
      maxWaitOrder + 1
    )

    // 로그 기록
    await createParticipantLog(
      eventId,
      memberSeq,
      null,
      EventParticipantStatus.WAIT,
      EventActionType.USER_JOIN,
      memberSeq
    )
  }

  return participant
}

/**
 * 이벤트 참여 취소
 */
export async function cancelEvent(
  eventId: number,
  memberSeq: number
): Promise<void> {
  const participant = await findParticipantByEventAndMember(eventId, memberSeq)

  if (!participant) {
    throw new ServiceError(
      ErrorCode.PARTICIPANT_NOT_FOUND,
      '참여 정보를 찾을 수 없습니다.'
    )
  }

  const previousStatus = participant.status

  // 상태를 CANCEL로 변경
  await updateParticipantStatus(
    eventId,
    memberSeq,
    EventParticipantStatus.CANCEL,
    null
  )

  // 로그 기록
  await createParticipantLog(
    eventId,
    memberSeq,
    previousStatus,
    EventParticipantStatus.CANCEL,
    EventActionType.USER_CANCEL,
    memberSeq
  )

  // 참여 확정자가 취소한 경우, 대기자 자동 승격
  if (previousStatus === EventParticipantStatus.JOIN) {
    const event = await findEventById(eventId)
    if (event) {
      const currentCount = await findJoinedParticipantCount(eventId)
      await updateEventCurrentParticipants(eventId, currentCount)

      // 대기자 승격
      await promoteFirstWaiter(eventId)
    }
  }
}

/**
 * 대기자 1순위 자동 승격
 */
async function promoteFirstWaiter(eventId: number): Promise<void> {
  const event = await findEventById(eventId)
  if (!event) return

  const currentCount = await findJoinedParticipantCount(eventId)
  if (currentCount >= event.max_participants) return

  const firstWaiter = await findFirstWaiter(eventId)
  if (!firstWaiter) return

  // 대기 → 참여로 변경
  await updateParticipantStatus(
    eventId,
    firstWaiter.member_seq,
    EventParticipantStatus.JOIN,
    null
  )

  // 참여자 수 업데이트
  await updateEventCurrentParticipants(eventId, currentCount + 1)

  // 로그 기록
  await createParticipantLog(
    eventId,
    firstWaiter.member_seq,
    EventParticipantStatus.WAIT,
    EventParticipantStatus.JOIN,
    EventActionType.AUTO_PROMOTE,
    null
  )
}

/**
 * 주최자가 참여자 취소 처리
 */
export async function hostCancelParticipant(
  eventId: number,
  targetMemberSeq: number,
  hostMemberSeq: number
): Promise<void> {
  const event = await findEventById(eventId)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  if (event.host_member_seq !== hostMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '이벤트 주최자만 참여자를 취소할 수 있습니다.'
    )
  }

  const participant = await findParticipantByEventAndMember(
    eventId,
    targetMemberSeq
  )

  if (!participant) {
    throw new ServiceError(
      ErrorCode.PARTICIPANT_NOT_FOUND,
      '참여 정보를 찾을 수 없습니다.'
    )
  }

  const previousStatus = participant.status

  await updateParticipantStatus(
    eventId,
    targetMemberSeq,
    EventParticipantStatus.CANCEL,
    null
  )

  // 로그 기록
  await createParticipantLog(
    eventId,
    targetMemberSeq,
    previousStatus,
    EventParticipantStatus.CANCEL,
    EventActionType.HOST_CANCEL,
    hostMemberSeq
  )

  // 참여자 수 업데이트 및 대기자 승격
  if (previousStatus === EventParticipantStatus.JOIN) {
    const currentCount = await findJoinedParticipantCount(eventId)
    await updateEventCurrentParticipants(eventId, currentCount)
    await promoteFirstWaiter(eventId)
  }
}

// ============ Comment Services ============

/**
 * 댓글 작성
 */
export async function writeComment(
  data: CreateEventCommentDto
): Promise<EventComment> {
  const event = await findEventById(data.event_id)

  if (!event) {
    throw new ServiceError(
      ErrorCode.EVENT_NOT_FOUND,
      '이벤트를 찾을 수 없습니다.'
    )
  }

  if (!data.content || data.content.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '댓글 내용을 입력해주세요.')
  }

  return await createComment(data)
}

/**
 * 댓글 수정
 */
export async function modifyComment(
  commentId: number,
  content: string,
  requesterMemberSeq: number
): Promise<EventComment> {
  const comment = await findCommentById(commentId)

  if (!comment) {
    throw new ServiceError(
      ErrorCode.COMMENT_NOT_FOUND,
      '댓글을 찾을 수 없습니다.'
    )
  }

  if (comment.member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인의 댓글만 수정할 수 있습니다.'
    )
  }

  if (!content || content.trim().length === 0) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '댓글 내용을 입력해주세요.')
  }

  return await updateComment(commentId, content)
}

/**
 * 댓글 삭제
 */
export async function removeComment(
  commentId: number,
  requesterMemberSeq: number
): Promise<boolean> {
  const comment = await findCommentById(commentId)

  if (!comment) {
    throw new ServiceError(
      ErrorCode.COMMENT_NOT_FOUND,
      '댓글을 찾을 수 없습니다.'
    )
  }

  if (comment.member_seq !== requesterMemberSeq) {
    throw new ServiceError(
      ErrorCode.NOT_OWNER,
      '본인의 댓글만 삭제할 수 있습니다.'
    )
  }

  return await deleteComment(commentId)
}

/**
 * 내가 참여한 이벤트 목록 조회
 */
export async function getMyEvents(
  memberSeq: number,
  limit: number = 5
) {
  return await findMyEvents(memberSeq, limit)
}

/** 목록을 모두 검증한 뒤 한 번에 저장한다. */
export async function writeEvents(data: CreateEventDto[]): Promise<Event[]> {
  if (!Array.isArray(data) || data.length < 1 || data.length > 100) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '한 번에 1~100개 일정을 등록해주세요.')
  }
  const keys = new Set<string>()
  for (const event of data) {
    const start = new Date(event.start_datetime).getTime()
    const end = new Date(event.end_datetime).getTime()
    if (!event.title?.trim() || event.title.length > 100 || (event.location_name?.length ?? 0) > 100 ||
        !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
        !Number.isInteger(event.max_participants) || event.max_participants < 1 ||
        !Number.isSafeInteger(event.host_member_seq) || event.host_member_seq < 1) {
      throw new ServiceError(ErrorCode.INVALID_INPUT, '일정의 제목, 장소, 시간 또는 인원을 확인해주세요.')
    }
    const key = `${start}|${event.location_name?.replace(/\s/g, '')}`
    if (keys.has(key)) {
      throw new ServiceError(ErrorCode.INVALID_INPUT, '목록에 같은 시간·코트의 일정이 중복되어 있습니다.')
    }
    keys.add(key)
  }
  return saveEvents(data)
}
