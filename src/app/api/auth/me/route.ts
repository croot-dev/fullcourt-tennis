import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getMemberBySeq } from '@/domains/member'
import type { MemberWithRole } from '@/domains/member'
import { createAccessToken } from '@/lib/jwt.server'

const AUTH_ME_CACHE_TTL_MS = 30 * 1000
const AUTH_ME_CACHE_MAX_SIZE = 500

type AuthMeCacheEntry = {
  member: MemberWithRole
  cachedAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __authMeCache__: Map<string, AuthMeCacheEntry> | undefined
}

function getAuthMeCache() {
  if (!globalThis.__authMeCache__) {
    globalThis.__authMeCache__ = new Map<string, AuthMeCacheEntry>()
  }
  return globalThis.__authMeCache__
}

function getCachedMember(memberId: string): MemberWithRole | null {
  const cache = getAuthMeCache()
  const entry = cache.get(memberId)
  if (!entry) return null

  if (Date.now() - entry.cachedAt > AUTH_ME_CACHE_TTL_MS) {
    cache.delete(memberId)
    return null
  }

  return entry.member
}

function setCachedMember(memberId: string, member: MemberWithRole) {
  const cache = getAuthMeCache()

  // 크기 초과 시 가장 오래된 항목부터 제거
  if (cache.size >= AUTH_ME_CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }

  cache.set(memberId, {
    member,
    cachedAt: Date.now(),
  })
}

/**
 * 현재 로그인한 사용자 정보 조회 API
 * GET /api/auth/me
 *
 * DB 조회 결과와 토큰 값이 다르면 토큰을 갱신하여 동기화
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (_authenticatedReq, user) => {
    const cacheKey = String(user.memberSeq)
    const cachedMember = getCachedMember(cacheKey)
    const memberWithRole = cachedMember ?? (await getMemberBySeq(user.memberSeq))

    if (!memberWithRole) {
      return NextResponse.json(
        { error: '회원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!cachedMember) {
      setCachedMember(cacheKey, memberWithRole)
    }

    // DB 값과 토큰 값이 다르면 토큰 갱신
    const needsTokenRefresh =
      user.roleCode !== memberWithRole.role_code ||
      user.roleName !== memberWithRole.role_name ||
      user.email !== memberWithRole.email

    if (needsTokenRefresh) {
      const newPayload = {
        memberId: user.memberId,
        memberSeq: user.memberSeq,
        roleCode: memberWithRole.role_code,
        roleName: memberWithRole.role_name,
        email: memberWithRole.email,
      }

      // accessToken만 갱신 (refreshToken은 유효기간이 길어 갱신 불필요)
      const accessToken = await createAccessToken(newPayload)

      // accessToken만 쿠키에 설정
      const response = NextResponse.json(memberWithRole)
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15, // 15분
        path: '/',
      })
      return response
    }

    return NextResponse.json(memberWithRole)
  })
}
