// 매일 만료된 게시글 이미지 정리 API 호출
// 필요 환경변수 (Netlify 사이트 설정): CRON_SECRET
// URL 은 Netlify가 자동으로 제공하는 사이트 주소
const cleanupPostImages = async () => {
  const response = await fetch(
    `${process.env.URL}/api/cron/cleanup-post-images`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }
  )

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`게시글 이미지 정리 실패 (${response.status}): ${body}`)
  }

  console.log('게시글 이미지 정리 완료:', body)
}

export default cleanupPostImages

export const config = {
  schedule: '@daily',
}
