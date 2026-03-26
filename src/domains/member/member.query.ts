/**
 * Member 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import {
  Member,
  CreateMemberDto,
  MemberWithRole,
  UpdateMemberDto,
  MemberListResult,
} from './member.model'
import { MEMBER_ROLE, MEMBER_STATUS } from '@/constants'
import { ErrorCode, ServiceError } from '@/lib/error'

/**
 * 이메일로 회원 조회
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE email = ${email}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 별명으로 회원 조회
 */
export async function getMemberByNickname(
  nickname: string
): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE nickname = ${nickname}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * seq(PK)로 회원 조회 (역할 포함) — 내부 DB 조회에 사용
 */
export async function getMemberBySeq(seq: number): Promise<MemberWithRole | null> {
  const result = (await sql`
    SELECT
      m.seq,
      m.member_id,
      m.email,
      m.name,
      m.birthdate,
      m.nickname,
      m.ntrp,
      m.gender,
      m.phone,
      m.status,
      m.profile_image_url,
      m.last_login_at,
      m.created_at,
      m.updated_at,
      r.code AS role_code,
      r.name AS role_name
    FROM member m
    JOIN member_role mr ON m.seq = mr.member_seq
    JOIN role r ON mr.role_seq = r.seq
    WHERE m.seq = ${seq}
      AND m.deleted_at IS NULL
  `) as MemberWithRole[]
  return Array.isArray(result) ? result[0] ?? null : null
}

/**
 * ID로 회원 조회
 */
export async function getMemberById(id: string): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE member_id = ${id}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 회원 전체 조회
 * @returns
 */
export async function getMemberList(
  page: number = 1,
  limit: number = 10
): Promise<MemberListResult> {
  const offset = (page - 1) * limit

  const [members, countResult] = (await Promise.all([
    sql`
      SELECT *
      FROM member
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total
      FROM member
      WHERE deleted_at IS NULL
    `,
  ])) as [Member[], { total: number }[]]

  return {
    members,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * ID로 회원 조회
 */
export async function getMemberByIdWithRole(
  id: string
): Promise<MemberWithRole | null> {
  const result = (await sql`
    SELECT
      m.seq,
      m.member_id,
      m.email,
      m.name,
      m.birthdate,
      m.nickname,
      m.ntrp,
      m.gender,
      m.phone,
      m.status,
      m.profile_image_url,
      m.last_login_at,
      m.created_at,
      m.updated_at,
      r.code AS role_code,
      r.name AS role_name
    FROM member m
    JOIN member_role mr ON m.seq = mr.member_seq
    JOIN role r ON mr.role_seq = r.seq
    WHERE m.member_id = ${id}
      AND m.deleted_at IS NULL
  `) as MemberWithRole[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 회원 생성
 */
export async function createMember(
  data: CreateMemberDto
): Promise<MemberWithRole> {
  const {
    member_id,
    name,
    birthdate,
    nickname,
    gender,
    ntrp,
    email,
    password_hash,
    phone,
  } = data

  try {
    const memberResult = (await sql`
    WITH guest_role AS (
      SELECT seq
      FROM role
      WHERE code = ${MEMBER_ROLE.GUEST}
      LIMIT 1
    ),
    inserted_member AS (
      INSERT INTO member (
          member_id,
          name,
          birthdate,
          nickname,
          gender,
          ntrp,
          email,
          password_hash,
          phone,
          status,
          created_at,
          updated_at
      )
      VALUES (
          ${member_id},
          ${name},
          ${birthdate},
          ${nickname},
          ${gender},
          ${ntrp},
          ${email},
          ${password_hash},
          ${phone || null},
          ${MEMBER_STATUS.ACTIVE},
          NOW(),
          NOW()
      )
      RETURNING
          seq,
          member_id,
          email,
          name,
          birthdate,
          nickname,
          ntrp,
          gender,
          phone,
          status,
          created_at,
          updated_at
    ),
    inserted_member_role AS (
      INSERT INTO member_role (
          member_seq,
          role_seq,
          assigned_at
      )
      SELECT
          im.seq,
          gr.seq,
          NOW()
      FROM inserted_member im
      JOIN guest_role gr
        ON TRUE
      RETURNING member_seq, role_seq
    )
    SELECT
      im.member_id,
      im.email,
      im.name,
      im.birthdate,
      im.nickname,
      im.ntrp,
      im.gender,
      im.phone,
      im.status,
      im.created_at,
      im.updated_at,
      r.code AS role_code,
      r.name AS role_name
    FROM inserted_member im
    JOIN inserted_member_role imr
      ON imr.member_seq = im.seq
    JOIN role r
      ON r.seq = imr.role_seq;
    `) as MemberWithRole[]

    if (!Array.isArray(memberResult) || memberResult.length === 0) {
      throw new ServiceError(
        ErrorCode.INTERNAL_ERROR,
        '회원 생성 중 역할 할당에 실패했습니다.'
      )
    }

    return memberResult[0]
  } catch (error) {
    const dbError = error as {
      code?: string
      constraint?: string
      message?: string
    }

    if (dbError.code === '23505') {
      const constraint = dbError.constraint ?? ''
      if (/email/i.test(constraint)) {
        throw new ServiceError(
          ErrorCode.DUPLICATE_EMAIL,
          '이미 가입된 이메일입니다.'
        )
      }
      if (/nickname/i.test(constraint)) {
        throw new ServiceError(
          ErrorCode.DUPLICATE_NICKNAME,
          '이미 사용 중인 별명입니다.'
        )
      }
      if (/member_id/i.test(constraint)) {
        throw new ServiceError(
          ErrorCode.DUPLICATE,
          '이미 등록된 회원 ID입니다.'
        )
      }
      throw new ServiceError(
        ErrorCode.DUPLICATE,
        '중복된 회원 정보가 존재합니다.'
      )
    }

    if (error instanceof ServiceError) {
      throw error
    }

    throw new ServiceError(
      ErrorCode.INTERNAL_ERROR,
      '회원 생성 중 오류가 발생했습니다.'
    )
  }
}

/**
 * 회원 수정
 */
export async function updateMember(data: UpdateMemberDto): Promise<Member> {
  const { member_id, name, birthdate, nickname, gender, ntrp, phone } = data

  const memberResult = (await sql`
  WITH updated_member AS (
    UPDATE member
    SET
        name       = ${name},
        birthdate  = ${birthdate},
        nickname   = ${nickname},
        gender     = ${gender},
        ntrp       = ${ntrp},
        phone      = ${phone || null},
        updated_at = NOW()
    WHERE member_id = ${member_id}
      AND deleted_at IS NULL
    RETURNING
        seq,
        member_id,
        name,
        birthdate,
        nickname,
        gender,
        ntrp,
        email,
        phone,
        status,
        created_at,
        updated_at
  )
  SELECT
      member_id,
      name,
      birthdate,
      nickname,
      gender,
      ntrp,
      email,
      phone,
      status,
      created_at,
      updated_at
  FROM updated_member;
  `) as Member[]

  return memberResult[0]
}

/**
 * 회원 탈퇴 (소프트 삭제)
 */
export async function deleteMember(memberId: string): Promise<boolean> {
  const result = await sql`
    UPDATE member
    SET
        status = ${MEMBER_STATUS.WITHDRAWN},
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE member_id = ${memberId}
      AND deleted_at IS NULL
    RETURNING member_id
  `

  return Array.isArray(result) && result.length > 0
}
