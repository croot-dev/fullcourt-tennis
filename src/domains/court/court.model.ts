/**
 * TennisCourt 모델
 * 테니스 코트 테이블 스키마 정의
 */

import type { CourtType, CourtAmenity } from '@/constants'

export interface TennisCourt {
  court_id: number
  name: string
  naver_place_id: string | null
  naver_business_id: string | null
  rsv_url: string | null
  address: string | null
  is_indoor: boolean | null
  court_type: CourtType | null
  court_count: number | null
  amenities: CourtAmenity[] | null
  tags: string[] | null
  memo: string | null
  created_at: string
  updated_at: string
}

/**
 * 코트 생성 DTO
 */
export type CreateCourtDto = Pick<TennisCourt, 'name'> &
  Partial<Omit<TennisCourt, 'court_id' | 'name' | 'created_at' | 'updated_at'>>

/**
 * 코트 수정 DTO
 */
export type UpdateCourtDto = Pick<TennisCourt, 'court_id' | 'name'> &
  Partial<Omit<TennisCourt, 'court_id' | 'name' | 'created_at' | 'updated_at'>>

/**
 * 코트 목록 응답
 */
export interface CourtListResult {
  courts: TennisCourt[]
  total: number
  totalPages: number
}
