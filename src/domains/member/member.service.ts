/**
 * 멤버 서비스 레이어
 * 비즈니스 로직을 처리하고 Repository 레이어를 통해 DB에 접근
 */

import 'server-only'
import { Member, MemberWithRole, MemberListResult } from './member.model'
import {
  findMemberByNickname,
  findMemberById,
  findMemberBySeq,
  findMemberByIdWithRole,
  findMemberList,
  updateMember,
  deleteMember,
} from './member.repository'
import type { MemberGender } from '@/constants'
import { ServiceError, ErrorCode } from '@/lib/error'

interface ModifyMemberData {
  member_id: string
  requester_id: string // 요청자 ID (인증된 사용자)
  name: string
  birthdate: string
  nickname: string
  ntrp: string
  gender: MemberGender
  phone?: string | null
}

/**
 * seq(PK)로 회원 상세 조회 (역할 포함) — 내부 DB 조회에 사용
 */
export async function getMemberBySeq(seq: number): Promise<MemberWithRole | null> {
  return await findMemberBySeq(seq)
}

/**
 * 회원 상세 조회 (역할 포함)
 */
export async function getMemberById(
  id: string,
): Promise<MemberWithRole | null> {
  return await findMemberByIdWithRole(id)
}

/**
 * 회원 목록 조회
 */
export async function getMemberList(
  page: number = 1,
  limit: number = 10,
): Promise<MemberListResult> {
  return await findMemberList(page, limit)
}

/**
 * 회원 정보 수정
 */
export async function modifyMember(data: ModifyMemberData): Promise<Member> {
  const {
    member_id,
    requester_id,
    name,
    birthdate,
    gender,
    nickname,
    ntrp,
    phone,
  } = data

  // 필수 필드 검증
  if (!member_id) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '알 수 없는 사용자입니다.')
  }

  if (!requester_id) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 대상 회원 존재 여부 확인
  const existingMember = await findMemberById(member_id)
  if (!existingMember) {
    throw new ServiceError(
      ErrorCode.MEMBER_NOT_FOUND,
      '회원을 찾을 수 없습니다.',
    )
  }

  // 별명 중복 확인 (본인 제외)
  const memberByNickname = await findMemberByNickname(nickname)
  if (memberByNickname && memberByNickname.member_id !== member_id) {
    throw new ServiceError(
      ErrorCode.DUPLICATE_NICKNAME,
      '이미 사용 중인 별명입니다.',
    )
  }

  // 회원 정보 업데이트
  const updatedMember = await updateMember({
    member_id,
    name,
    birthdate,
    nickname,
    gender,
    ntrp,
    phone: phone || null,
  })

  return updatedMember
}

/**
 * 회원 탈퇴
 */
export async function withdrawMember(
  memberId: string,
  requesterId: string,
): Promise<boolean> {
  if (!memberId) {
    throw new ServiceError(ErrorCode.INVALID_INPUT, '알 수 없는 사용자입니다.')
  }

  if (!requesterId) {
    throw new ServiceError(ErrorCode.UNAUTHORIZED, '사용자 인증이 필요합니다.')
  }

  // 본인만 탈퇴 가능
  if (memberId !== requesterId) {
    throw new ServiceError(ErrorCode.NOT_OWNER, '본인만 탈퇴할 수 있습니다.')
  }

  // 회원 존재 여부 확인
  const existingMember = await findMemberById(memberId)
  if (!existingMember) {
    throw new ServiceError(
      ErrorCode.MEMBER_NOT_FOUND,
      '회원을 찾을 수 없습니다.',
    )
  }

  return await deleteMember(memberId)
}
