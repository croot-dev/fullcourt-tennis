/**
 * Member 모델
 * 회원 테이블 스키마 정의
 */

import type { MemberGender } from '@/constants'

export interface Member {
  seq: number
  member_id: string
  email: string
  name: string
  birthdate: string
  nickname: string
  ntrp: string
  gender: MemberGender
  phone: string | null
  password_hash: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MemberWithRole extends Member {
  role_code: string
  role_name: string
}

/**
 * 회원 생성 DTO
 */
export interface CreateMemberDto {
  member_id: string
  email: string
  password_hash: string
  name: string
  birthdate: string
  nickname: string
  gender: MemberGender
  ntrp: string
  phone?: string
}

/**
 * 회원 수정 DTO
 */
export interface UpdateMemberDto {
  member_id: string
  name: string
  birthdate: string
  nickname: string
  gender: MemberGender
  ntrp: string
  phone: string | null
}

/**
 * 게시글 목록 응답
 */
export interface MemberListResult {
  members: Member[]
  total: number
  totalPages: number
}
