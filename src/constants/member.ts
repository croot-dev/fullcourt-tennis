/**
 * 성별 상수
 */
export const MEMBER_GENDER = Object.freeze({
  MALE: 'M',
  FEMALE: 'F',
} as const)

export type MemberGender = (typeof MEMBER_GENDER)[keyof typeof MEMBER_GENDER]

export const MEMBER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  WITHDRAWN: 'withdrawn',
} as const)
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS]

export const MEMBER_ROLE = Object.freeze({
  ADMIN: '0',
  OPER: '2',
  GUEST: '10',
} as const)
export type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE]
