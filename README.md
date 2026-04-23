# 풀코트 테니스 모임 (Noname Tennis Group)

[![Netlify Status](https://api.netlify.com/api/v1/badges/efee58a8-ed4f-40cd-b3d2-915fe62cb668/deploy-status)](https://app.netlify.com/projects/
noname-tennis/deploys)

**서비스 URL**: https://fctennis.netlify.app/

## 프로젝트 개요

풀코트 테니스 모임(이하 fctennis)은 테니스 동호회 회원 관리 및 커뮤니티 웹 애플리케이션입니다.

### 주요 기능

- **회원 인증**: 카카오 소셜 로그인, JWT 기반 인증
- **회원 관리**: 프로필 조회/수정, NTRP 등급 관리
- **공지사항**: 게시글 작성/조회/수정/삭제 (WYSIWYG 에디터)
- **대시보드**: 회원 정보, 최근 공지사항, 코트 예약 바로가기
- **일정 관리**: 캘린더 기반 일정 관리 (FullCalendar)

---

## 환경 정보

### 기술 스택

| 구분                 | 기술                          |
| -------------------- | ----------------------------- |
| **Framework**        | Next.js 15 (App Router)       |
| **Language**         | TypeScript 5                  |
| **Runtime**          | Node.js 24.5.0                |
| **UI Library**       | Chakra UI v3, Tailwind CSS v4 |
| **State Management** | TanStack React Query          |
| **Database**         | Neon (PostgreSQL Serverless)  |
| **Authentication**   | JWT (jose), 카카오 OAuth      |
| **Editor**           | Quill                         |
| **Calendar**         | FullCalendar                  |
| **Form**             | React Hook Form               |
| **Deployment**       | Netlify                       |

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 `.env.sample` 파일을 참고하여 설정하세요.

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.sample .env
# .env 파일을 열어 실제 값으로 수정
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

### 5. 배포 (Netlify)

```bash
npm install -g netlify-cli
netlify login
netlify build
netlify deploy --prod
```

---

## AI 코드리뷰 자동화

PR 생성/수정 시 GitHub Actions에서 AI 코드리뷰가 자동으로 실행됩니다.

### 점검 항목

- 커밋 메시지 템플릿 적합성
- 코딩 컨벤션 준수 여부 (`CONVENSIONS.md` 기준)
- 보안 점검 (`npm audit` 결과 포함)
- 성능 점검 (변경 코드 기준 정적 리뷰)

### 설정 방법

1. GitHub 저장소 `Settings > Secrets and variables > Actions`에서 `ANTHROPIC_API_KEY` 시크릿을 추가합니다.
2. PR을 생성하거나 업데이트하면 `.github/workflows/ai-code-review.yml`가 실행됩니다.
3. 리뷰 결과는 PR 코멘트에 `<!-- ai-pr-review -->` 마커로 자동 생성/갱신됩니다.

### 관련 파일

- `.github/workflows/ai-code-review.yml`
- `.github/scripts/ai-pr-review.mjs`
- `.gitmessage.txt`
- `.github/ai-review/review-rules.md`

---

## 디렉토리 구조

```
src/
├── app/                          # Next.js App Router 페이지
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 API
│   │   ├── bbs/                  # 게시판 API
│   │   └── member/               # 회원 API
│   │
│   ├── tanstackProvider.tsx      # TanStack Query Provider
│   └── [page]/                   # 각 페이지
│       └── _components/          # 페이지 전용 컴포넌트
│
├── components/                   # 공통 컴포넌트
│   ├── common/                   # 공통 UI
│   ├── layouts/                  # 레이아웃
│   └── ui/                       # Chakra UI 커스텀 컴포넌트
│
├── domains/                      # 도메인 레이어 (서버 비즈니스 로직)
│   └── [domain]/                 # 도메인명
│       ├── [domain].model.ts     # 도메인 타입 정의
│       ├── [domain].query.ts     # 도메인 DB 접근
│       └── [domain].service.ts   # 도메인 비즈니스 로직
│
├── hooks/                        # TanStack Query 커스텀 훅
│   ├── useAuth.ts                # 인증 관련 (useUserInfo, useLogout 등)
│   ├── useMember.ts              # 회원 관련 (useMember, useUpdateMember)
│   ├── usePosts.ts               # 게시글 관련 (usePostList, useCreatePost 등)
│   └── useEvent.ts               # 일정 관련 (useEvents, useCreateEvent)
│
├── lib/                          # 유틸리티 및 공통 라이브러리
│   ├── api.client.ts             # API 요청 래퍼 (request, ApiError, authenticatedFetch)
│   ├── auth.client.ts            # 클라이언트 인증
│   ├── *.server.ts               # 서버 전용 유틸
│   └── error.ts                  # 에러 처리
│
├── constants/                    # 상수 정의
│
└── styles/                       # 전역 스타일
```

### 주요 컨벤션

- **`_components/`**: 해당 페이지에서만 사용되는 단독 컴포넌트
- **`domains/`**: Repository-Service 패턴으로 서버 비즈니스 로직 분리
- **`hooks/`**: TanStack Query 기반 데이터 페칭/캐싱 훅
- **`.server.ts`**: 서버에서만 실행되는 코드
- **`.client.ts`**: 클라이언트에서만 실행되는 코드

---

## 아키텍처

### Layered Architecture

```
* Client (Browser)
  > react-query hooks
|
| request()
▼
* API Client (api.client.ts)
  > 요청 Wrapper, 에러처리 토큰 갱신 등
|
| request()
▼
* API Layer (route.ts) :
  > HTTP 처리, 인증 미들웨어, 에러→HTTP 상태 매핑
|
| HTTP Request
▼
* Service Layer (\*.service.ts)
  > 비즈니스 로직, 권한 검증
|
| Function Call
▼
* *Repository Layer (\*.repository.ts)
  > Entity 저장/조회 실행
|
| Function Call
▼
* Query Layer (\*.query.ts)
  > 순수 SQL 쿼리 실행
|
| SQL
▼
Database (PostgreSQL)
```

### 레이어별 책임

| 레이어          | 파일              | 책임                                            |
| --------------- | ----------------- | ----------------------------------------------- |
| **Client**      | React 컴포넌트    | UI 렌더링, 사용자 입력                          |
| **Query Hooks** | `hooks/useXxx.ts` | TanStack Query 기반 데이터 페칭, 캐싱, 뮤테이션 |
| **API Client**  | `api.client.ts`   | 공통 요청 래퍼, 에러 처리, 자동 토큰 갱신       |
| **API**         | `route.ts`        | HTTP 요청/응답 처리, 인증 미들웨어, 쿠키 설정   |
| **Service**     | `*.service.ts`    | 비즈니스 로직, 유효성 검증, 권한 검증           |
| **Query**       | `*.query.ts`      | SQL 쿼리 실행, 데이터 반환                      |
| **DB**          | PostgreSQL        | 데이터 저장                                     |

### TanStack Query 구조

클라이언트 상태 관리는 TanStack Query를 사용하여 서버 상태와 동기화합니다.

```typescript
// Query Key Factory 패턴
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [postKeys.all, 'list'] as const,
  list: (bbsTypeId: number, page: number, limit: number) =>
    [postKeys.lists(), { bbsTypeId, page, limit }] as const,
  details: () => [postKeys.all, 'detail'] as const,
  detail: (id: number) => [postKeys.details(), id] as const,
}

// Query Hook
export function usePostList({ bbsTypeId, page, limit }) {
  return useQuery({
    queryKey: postKeys.list(bbsTypeId, page, limit),
    queryFn: () =>
      request(`/api/bbs/post?type=${bbsTypeId}&page=${page}&limit=${limit}`),
  })
}

// Mutation Hook
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => request('/api/bbs/post', { body: data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: postKeys.lists() }),
  })
}
```

**주요 훅**

| 훅                  | 용도                         |
| ------------------- | ---------------------------- |
| `useUserInfo()`     | 현재 로그인 사용자 정보 조회 |
| `useLogout()`       | 로그아웃 처리                |
| `useMemberJoin()`   | 회원가입 (프로필 생성)       |
| `useUpdateMember()` | 회원정보 수정                |
| `usePostList()`     | 게시글 목록 조회             |
| `usePost()`         | 단일 게시글 조회             |
| `useCreatePost()`   | 게시글 작성                  |
| `useUpdatePost()`   | 게시글 수정                  |
| `useDeletePost()`   | 게시글 삭제                  |
| `useEvents()`       | 일정 목록 조회               |
| `useCreateEvent()`  | 일정 생성                    |

### API Client

공통 API 요청 래퍼 (`api.client.ts`)를 통해 일관된 에러 처리와 자동 토큰 갱신을 제공합니다.

```typescript
// 공통 request 함수
const data = await request<Member>('/api/auth/me')

// 옵션 지정
await request('/api/member/123', {
  method: 'PUT',
  body: { name: '홍길동' },
  auth: true, // 인증 필요 여부 (기본값: true)
})

// ApiError로 일관된 에러 처리
try {
  await request('/api/protected')
} catch (error) {
  if (error instanceof ApiError && error.status === 401) {
    // 인증 만료 처리
  }
}
```

**자동 토큰 갱신 흐름**:

```
1. API 요청 → 401 Unauthorized
2. /api/auth/refresh 호출
3. 토큰 갱신 성공 → 원래 요청 자동 재시도
4. 토큰 갱신 실패 → 인증 플래그 제거, 로그아웃 처리
```

### 에러 처리 구조

Service 레이어에서 발생하는 에러는 `ServiceError` 클래스를 통해 정의되고, API 레이어에서 `handleApiError()`를 통해 HTTP 응답으로 변환됩니다.

```typescript
// Service Layer: 비즈니스 에러 발생
throw new ServiceError(ErrorCode.NOT_OWNER, '본인의 정보만 수정할 수 있습니다.')

// API Layer: 공통 에러 핸들러로 HTTP 응답 변환
return handleApiError(error, '기본 에러 메시지')
// → { error: '본인의 정보만 수정할 수 있습니다.', code: 'NOT_OWNER' }, status: 403
```

**에러 코드 → HTTP 상태 매핑**

| 에러 코드                               | HTTP 상태 |
| --------------------------------------- | --------- |
| `UNAUTHORIZED`, `TOKEN_EXPIRED`         | 401       |
| `FORBIDDEN`, `NOT_OWNER`                | 403       |
| `NOT_FOUND`, `MEMBER_NOT_FOUND`         | 404       |
| `DUPLICATE_EMAIL`, `DUPLICATE_NICKNAME` | 409       |
| `VALIDATION_ERROR`, `INVALID_INPUT`     | 400       |
| `INTERNAL_ERROR`                        | 500       |

### 데이터 흐름 예시

**회원정보 수정 요청**

```
1. Component: useUpdateMember().mutate({ member_id, name })
2. API Client: request('/api/member/123', { method: 'PUT', body })
3. authenticatedFetch: 쿠키 포함 요청 (401 시 자동 갱신)
4. API Route: withAuth()로 인증 확인 → modifyMember() 호출
5. Service: 권한 검증 (본인 확인) → 중복 체크 → updateMember() 호출
6. Query: UPDATE SQL 실행
7. DB: 데이터 수정
8. 역순으로 결과 반환 → onSuccess에서 queryClient.setQueryData로 캐시 갱신
```

---

## 사이트맵

```
/                           # 메인 페이지 (랜딩)
│
├── /auth                   # 인증
│   └── /sign-in            # 로그인 (카카오 OAuth)
│       └── /complete       # 로그인 완료 처리
│
├── /dashboard              # 대시보드 (로그인 후 메인)
│                           # - 회원 정보 요약
│                           # - 참여 예정 일정
│                           # - 최근 공지사항
│                           # - 코트 예약 바로가기
│
├── /notice                 # 공지사항
│   ├── /                   # 목록
│   ├── /write              # 작성 (관리자)
│   └── /[id]               # 상세 / 수정
│
├── /schedule               # 일정 관리
│   ├── /                   # 캘린더 (FullCalendar)
│   └── /event/[id]         # 일정 상세
│                           # - 참여자 목록
│                           # - 참여 신청/취소
│                           # - 수정/삭제 (관리자)
│
├── /member                 # 회원 관리
│   ├── /                   # 회원 목록 (관리자)
│   └── /[id]               # 회원 상세 (프로필)
│                           # - 기본 정보 탭
│                           # - 지각/불참 기록 탭
│
└── /reservation            # 코트 예약 (외부 링크)
```

---

## 기타

### 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

### 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI v3](https://www.chakra-ui.com/)
- [Neon Database](https://neon.tech/)
- [카카오 로그인 API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
