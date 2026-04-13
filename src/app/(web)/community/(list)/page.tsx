import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import CommunityList from './_components/CommunityList'
import CommunityWriteButton from './_components/CommunityWriteButton'

export const metadata = {
  title: '커뮤니티 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임의 커뮤니티를 확인하세요.',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

function CommunityListFallback() {
  return (
    <>
      <Box>
        <Stack gap={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height="60px" />
          ))}
        </Stack>
      </Box>
      <Box display="flex" justifyContent="center" gap={2} mt={6}>
        <Skeleton height="40px" width="200px" />
      </Box>
    </>
  )
}

export default async function NoticeListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1

  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">커뮤니티</Heading>
          <CommunityWriteButton />
        </Box>

        <Suspense key={currentPage} fallback={<CommunityListFallback />}>
          <CommunityList currentPage={currentPage} />
        </Suspense>
      </Stack>
    </Container>
  )
}
