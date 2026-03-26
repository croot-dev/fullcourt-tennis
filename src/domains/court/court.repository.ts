/**
 * TennisCourt 리포지토리 레이어
 * 순수 DB 접근 로직만 담당
 */

import 'server-only'
import {
  getCourtList as getCourtListQuery,
  getCourtById as getCourtByIdQuery,
  createCourt as createCourtQuery,
  updateCourt as updateCourtQuery,
  deleteCourt as deleteCourtQuery,
} from './court.query'
import {
  TennisCourt,
  CreateCourtDto,
  UpdateCourtDto,
  CourtListResult,
} from './court.model'

/**
 * 코트 목록 조회 (페이징)
 */
export async function findCourtList(
  page: number = 1,
  limit: number = 10,
  isIndoor?: boolean,
): Promise<CourtListResult> {
  return getCourtListQuery(page, limit, isIndoor)
}

/**
 * 코트 단건 조회
 */
export async function findCourtById(courtId: number): Promise<TennisCourt | null> {
  return getCourtByIdQuery(courtId)
}

/**
 * 코트 생성
 */
export async function insertCourt(data: CreateCourtDto): Promise<TennisCourt> {
  return createCourtQuery(data)
}

/**
 * 코트 수정
 */
export async function modifyCourt(data: UpdateCourtDto): Promise<TennisCourt> {
  return updateCourtQuery(data)
}

/**
 * 코트 삭제
 */
export async function removeCourt(courtId: number): Promise<boolean> {
  return deleteCourtQuery(courtId)
}
