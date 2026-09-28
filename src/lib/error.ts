/**
 * 공통 에러 처리 모듈
 * Service에서 발생하는 에러를 정의하고 API에서 일관되게 처리
 */

/**
 * 에러 코드 정의
 */
export const ErrorCode = {
  // 인증 관련 (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // 권한 관련 (403)
  FORBIDDEN: 'FORBIDDEN',
  NOT_OWNER: 'NOT_OWNER',

  // 리소스 관련 (404)
  NOT_FOUND: 'NOT_FOUND',
  MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  PARTICIPANT_NOT_FOUND: 'PARTICIPANT_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',

  // 이벤트 관련 (409)
  ALREADY_JOINED: 'ALREADY_JOINED',
  ALREADY_WAITING: 'ALREADY_WAITING',
  ALREADY_STARTED: 'ALREADY_STARTED',

  // 충돌 관련 (409)
  DUPLICATE: 'DUPLICATE',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_NICKNAME: 'DUPLICATE_NICKNAME',

  // 유효성 검증 관련 (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 요청 제한 (429)
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // 서버 에러 (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

/**
 * 에러 코드별 HTTP 상태 코드 매핑
 */
const errorStatusMap: Record<ErrorCodeType, number> = {
  // 401
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,

  // 403
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_OWNER]: 403,

  // 404
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.MEMBER_NOT_FOUND]: 404,
  [ErrorCode.POST_NOT_FOUND]: 404,
  [ErrorCode.EVENT_NOT_FOUND]: 404,
  [ErrorCode.PARTICIPANT_NOT_FOUND]: 404,
  [ErrorCode.COMMENT_NOT_FOUND]: 404,

  // 이벤트 관련 (409)
  [ErrorCode.ALREADY_JOINED]: 409,
  [ErrorCode.ALREADY_WAITING]: 409,
  [ErrorCode.ALREADY_STARTED]: 409,

  // 409
  [ErrorCode.DUPLICATE]: 409,
  [ErrorCode.DUPLICATE_EMAIL]: 409,
  [ErrorCode.DUPLICATE_NICKNAME]: 409,

  // 400
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,

  // 429
  [ErrorCode.TOO_MANY_REQUESTS]: 429,

  // 500
  [ErrorCode.INTERNAL_ERROR]: 500,
}

export function getServiceErrorCode(error: Error): ErrorCodeType | null {
  if (error.name.startsWith('ServiceError')) {
    return (error.name || '').replace(/.*\[(.+)\].*/, '$1') as ErrorCodeType
  }
  return null
}

/**
 * 서비스 에러 클래스
 * Service 레이어에서 발생하는 비즈니스 로직 에러
 */
export class ServiceError extends Error {
  public readonly code: ErrorCodeType
  public readonly statusCode: number

  constructor(code: ErrorCodeType, message: string) {
    super(message)
    this.name = `ServiceError [${code}]`
    this.code = code
    this.statusCode = errorStatusMap[code]
  }
}

/**
 * HTTP 상태 코드 조회
 */
export function getHttpStatus(code: ErrorCodeType): number {
  return errorStatusMap[code]
}
