import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import CommunityRead from './_components/CommunityRead'
import { getAuthSession } from '@/lib/auth.server'
import AccessDenied from '@/components/common/AccessDenied'

export const metadata = {
  title: '커뮤니티 상세 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임 커뮤니티 상세내용을 조회합니다.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

function CommunityReadFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="300px" mb={4} />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="space-between">
        <Skeleton height="40px" width="100px" />
        <Box display="flex" gap={3}>
          <Skeleton height="40px" width="80px" />
          <Skeleton height="40px" width="80px" />
        </Box>
      </Box>
    </Stack>
  )
}

export default async function NoticeReadPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id)

  const session = await getAuthSession()
  if (!session) {
    return (
      <AccessDenied
        title="접근 권한이 없습니다"
        message="회원만 조회할 수 있습니다."
        showBackButton
        backUrl="/community"
      />
    )
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">커뮤니티</Heading>

        <Suspense fallback={<CommunityReadFallback />}>
          <CommunityRead postId={postId} />
        </Suspense>
      </Stack>
    </Container>
  )
}
