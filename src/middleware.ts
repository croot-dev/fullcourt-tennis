import { MEMBER_ROLE } from '@/constants'
import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
)

// Edge Runtime 호환: request.cookies 직접 사용 (next/headers 사용 불가)
async function getSessionFromRequest(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET)
      if (payload && typeof payload.memberId === 'string') return payload
    } catch {}
  }

  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, JWT_SECRET)
      if (payload && typeof payload.memberId === 'string') return payload
    } catch {}
  }

  return null
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/member/:path*',
    '/blind/:path*',
    '/schedule/:path*',
    '/notice/write/:path*',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getSessionFromRequest(request)

  // 로그인 페이지로 리다이렉트 (현재 경로를 redirect_url로 포함)
  const redirectToSignIn = () => {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/member')) {
    if (!session) {
      return redirectToSignIn()
    }

    // ADMIN이 아니고, 본인 프로필 경로가 아닌 경우에만 리다이렉트
    if (
      session.roleCode !== MEMBER_ROLE.ADMIN &&
      session.roleCode !== MEMBER_ROLE.OPER &&
      !pathname.startsWith(`/member/${session.memberId}`)
    ) {
      return NextResponse.redirect(
        new URL(`/member/${session.memberId}`, request.url),
      )
    }
  }

  if (pathname.startsWith('/blind')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  if (pathname.startsWith('/schedule')) {
    if (!session) {
      return redirectToSignIn()
    }
  }

  return NextResponse.next()
}
