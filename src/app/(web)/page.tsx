import { Box, Container, Stack } from '@chakra-ui/react'
import { BBS_TYPE } from '@/constants'
import { getUpcomingEvents } from '@/domains/event'
import { getRecentPosts } from '@/domains/post'
import { getRecentPostImages } from '@/domains/image'
import BottomCtaSection from './_components/BottomCtaSection'
import CommunityNoticeSection from './_components/CommunityNoticeSection'
import FaqSection from './_components/FaqSection'
import HeroSection from './_components/HeroSection'
import IntroGuideSection from './_components/IntroGuideSection'

// 다음 일정은 현재 시각과 등록 내용에 따라 달라지므로 요청마다 조회한다.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [heroEvents, notices, communityPosts, communityImages] =
    await Promise.all([
      getUpcomingEvents(2),
      getRecentPosts(BBS_TYPE.NOTICE, 3),
      getRecentPosts(BBS_TYPE.COMMUNITY, 3),
      getRecentPostImages(BBS_TYPE.COMMUNITY, 6),
    ])

  return (
    <Box bg="fullcourt.pageBg">
      <HeroSection heroEvents={heroEvents} />

      <Container maxW="container.xl" py={{ base: 12, md: 16 }}>
        <Stack gap={14}>
          <IntroGuideSection />
          <CommunityNoticeSection
            notices={notices}
            communityPosts={communityPosts}
            communityImages={communityImages}
          />
          <FaqSection />
        </Stack>
      </Container>

      <BottomCtaSection />
    </Box>
  )
}
