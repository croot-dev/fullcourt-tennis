import { NextRequest, NextResponse } from 'next/server'
import { createAccessToken, createRefreshToken } from '@/lib/jwt.server'
import { KakaoUserInfo } from '@/domains/auth'
import { getMemberById } from '@/domains/member'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const redirectUri = req.nextUrl.searchParams.get('redirect_uri') // ✅ 쿼리에서 가져오기

  if (!code) {
    return NextResponse.json({ error: 'No code' }, { status: 400 })
  }
  if (!redirectUri) {
    return NextResponse.json({ error: 'No redirect_uri' }, { status: 400 })
  }

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_RESTAPI_KEY!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!, // secret 안 쓰면 제거
      redirect_uri: redirectUri, // ✅ 쿼리에서 받은 값 사용
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error) {
    return NextResponse.json(tokenData, { status: 400 })
  }

  // 사용자 정보 요청
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })

  const userData: KakaoUserInfo = await userRes.json()
  const member_id = userData.id.toString()

  // 기존 사용자 확인
  let existingUser = null
  if (member_id) {
    const users = await getMemberById(member_id)
    existingUser = users ?? null
  }

  // 기존 사용자인 경우 JWT 토큰 생성 및 쿠키 설정
  if (existingUser) {
    const tokenPayload = {
      memberId: existingUser.member_id,
      memberSeq: existingUser.seq,
      email: existingUser.email,
      roleName: existingUser.role_name,
      roleCode: existingUser.role_code,
    }
    const accessToken = await createAccessToken(tokenPayload)
    const refreshToken = await createRefreshToken(tokenPayload)

    const response = NextResponse.json({
      token: tokenData,
      user: userData,
      existingUser,
      isNewUser: false,
      accessToken,
    })

    // HttpOnly 쿠키로 JWT 토큰 설정
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  }

  // 신규 사용자인 경우 토큰 없이 반환
  return NextResponse.json({
    token: tokenData,
    user: userData,
    existingUser: null,
    isNewUser: true,
  })
}
