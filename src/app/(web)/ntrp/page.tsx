import type { Metadata } from 'next'
import { Container, Heading, Stack } from '@chakra-ui/react'
import NtrpAssessment from '@/components/common/NtrpAssessment'

export const metadata: Metadata = {
  title: 'NTRP 실력 레벨 측정 | 풀코트 테니스 모임',
  description:
    '테니스 실력에 관한 문항에 답하고 나의 예상 NTRP 레벨을 확인해보세요.',
}

export default function NtrpPage() {
  return (
    <Container maxW="xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
      <Stack gap={3}>
        <Stack gap={2}>
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }}>
            NTRP 레벨 측정
          </Heading>
        </Stack>
        <NtrpAssessment showTitle={false} />
      </Stack>
    </Container>
  )
}
