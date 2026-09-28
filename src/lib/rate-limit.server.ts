/**
 * 메모리 기반 고정 윈도우 요청 제한
 * 서버리스 인스턴스별로 카운트되므로 best-effort 보호용 (로그인 회원 대상 남용 방지)
 */

import 'server-only'

interface RateLimitWindow {
  count: number
  resetAt: number
}

export interface RateLimiter {
  /** 요청을 기록하고 허용 여부를 반환 */
  consume: (key: string) => boolean
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const windows = new Map<string, RateLimitWindow>()

  const pruneExpired = (now: number) => {
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key)
    }
  }

  return {
    consume(key) {
      const now = Date.now()
      const current = windows.get(key)

      if (!current || current.resetAt <= now) {
        pruneExpired(now)
        windows.set(key, { count: 1, resetAt: now + windowMs })
        return true
      }

      if (current.count >= limit) return false

      windows.set(key, { ...current, count: current.count + 1 })
      return true
    },
  }
}
