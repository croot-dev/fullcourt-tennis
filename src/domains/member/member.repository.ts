/**
 * Member 리포지토리 레이어
 * 순수 DB 접근 로직만 담당
 */

import 'server-only'
import {
  getMemberByEmail as getMemberByEmailQuery,
  getMemberByNickname as getMemberByNicknameQuery,
  getMemberById as getMemberByIdQuery,
  getMemberBySeq as getMemberBySeqQuery,
  getMemberByIdWithRole as getMemberByIdWithRoleQuery,
  getMemberList as getMemberListQuery,
  createMember as createMemberQuery,
  updateMember as updateMemberQuery,
  deleteMember as deleteMemberQuery,
} from './member.query'
import {
  Member,
  MemberWithRole,
  CreateMemberDto,
  UpdateMemberDto,
  MemberListResult,
} from './member.model'

/**
 * 이메일로 회원 조회
 */
export async function findMemberByEmail(
  email: string
): Promise<Member | null> {
  return getMemberByEmailQuery(email)
}

/**
 * 닉네임으로 회원 조회
 */
export async function findMemberByNickname(
  nickname: string
): Promise<Member | null> {
  return getMemberByNicknameQuery(nickname)
}

/**
 * ID로 회원 조회
 */
export async function findMemberById(id: string): Promise<Member | null> {
  return getMemberByIdQuery(id)
}

/**
 * seq(PK)로 회원 조회 (역할 포함)
 */
export async function findMemberBySeq(seq: number): Promise<MemberWithRole | null> {
  return getMemberBySeqQuery(seq)
}

/**
 * ID로 회원 조회 (역할 포함)
 */
export async function findMemberByIdWithRole(
  id: string
): Promise<MemberWithRole | null> {
  return getMemberByIdWithRoleQuery(id)
}

/**
 * 회원 목록 조회
 */
export async function findMemberList(
  page: number = 1,
  limit: number = 10
): Promise<MemberListResult> {
  return getMemberListQuery(page, limit)
}

/**
 * 회원 생성
 */
export async function createMember(
  data: CreateMemberDto
): Promise<MemberWithRole> {
  return createMemberQuery(data)
}

/**
 * 회원 수정
 */
export async function updateMember(data: UpdateMemberDto): Promise<Member> {
  return updateMemberQuery(data)
}

/**
 * 회원 삭제 (소프트 삭제)
 */
export async function deleteMember(memberId: string): Promise<boolean> {
  return deleteMemberQuery(memberId)
}
