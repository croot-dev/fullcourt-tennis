/**
 * Netlify Blobs 스토어 접근
 * - Netlify 런타임: 환경에서 자동 인증
 * - 로컬(next dev): NETLIFY_SITE_ID / NETLIFY_BLOBS_TOKEN 으로 인증
 */

import 'server-only'
import { getStore } from '@netlify/blobs'

const POST_IMAGE_STORE_NAME = 'post-images'

export function getPostImageStore() {
  const siteID = process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN

  // 업로드 직후 에디터에서 바로 조회하므로 strong consistency 사용
  if (siteID && token) {
    return getStore({
      name: POST_IMAGE_STORE_NAME,
      siteID,
      token,
      consistency: 'strong',
    })
  }

  return getStore({ name: POST_IMAGE_STORE_NAME, consistency: 'strong' })
}
