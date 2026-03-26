/**
 * Post 모델
 * 게시글 테이블 스키마 정의
 */

import { Member } from '../member'

export interface PostDto {
  post_id: number
  bbs_type_id: number
  title: string
  content?: string
  writer_seq: number  // member.seq (내부 PK)
  view_count: number
  created_at: string
  updated_at: string
}

/**
 * 게시글 생성 DTO
 */
export interface CreatePostDto {
  bbs_type_id: number
  title: string
  content: string
  writer_seq: number  // member.seq (내부 PK)
}

/**
 * 게시글 수정 DTO
 */
export interface UpdatePostDto {
  title?: string
  content?: string
}

/**
 * 게시글 목록 응답
 */
export interface PostListItem extends PostDto {
  writer_name: Member['nickname']
}

/**
 * 게시판 타입
 */
export enum BbsType {
  NOTICE = 1,
  COMMUNITY = 2,
  FAQ = 3,
}

export interface PostListFilter {
  memberId?: string
}
