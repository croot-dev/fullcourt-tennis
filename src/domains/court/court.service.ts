/**
 * TennisCourt 서비스 레이어
 * 비즈니스 로직을 처리하고 Repository 레이어를 통해 DB에 접근
 */

import 'server-only'
import {
  TennisCourt,
  CreateCourtDto,
  UpdateCourtDto,
  CourtListResult,
} from './court.model'
import {
  findCourtList,
  findCourtById,
  insertCourt,
  modifyCourt,
  removeCourt,
} from './court.repository'
import { ServiceError, ErrorCode } from '@/lib/error'

/**
 * 코트 목록 조회
 */
export async function getCourtList(
  page: number = 1,
  limit: number = 10,
  isIndoor?: boolean,
): Promise<CourtListResult> {
  return await findCourtList(page, limit, isIndoor)
}

/**
 * 코트 상세 조회
 */
export async function getCourtById(courtId: number): Promise<TennisCourt> {
  const court = await findCourtById(courtId)
  if (!court) {
    throw new ServiceError(ErrorCode.NOT_FOUND, '코트를 찾을 수 없습니다.')
  }
  return court
}

/**
 * 코트 생성
 */
export async function createCourt(data: CreateCourtDto): Promise<TennisCourt> {
  if (!data.name || data.name.trim() === '') {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '코트 이름은 필수입니다.')
  }
  return await insertCourt(data)
}

/**
 * 코트 수정
 */
export async function updateCourt(data: UpdateCourtDto): Promise<TennisCourt> {
  const existing = await findCourtById(data.court_id)
  if (!existing) {
    throw new ServiceError(ErrorCode.NOT_FOUND, '코트를 찾을 수 없습니다.')
  }

  if (!data.name || data.name.trim() === '') {
    throw new ServiceError(ErrorCode.VALIDATION_ERROR, '코트 이름은 필수입니다.')
  }

  return await modifyCourt(data)
}

/**
 * 코트 삭제
 */
export async function deleteCourt(courtId: number): Promise<void> {
  const existing = await findCourtById(courtId)
  if (!existing) {
    throw new ServiceError(ErrorCode.NOT_FOUND, '코트를 찾을 수 없습니다.')
  }

  await removeCourt(courtId)
}
