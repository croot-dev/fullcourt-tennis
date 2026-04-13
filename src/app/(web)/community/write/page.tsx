import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { Suspense } from 'react'
import CommunityForm from './_components/CommunityForm'
import Link from 'next/link'
import { getPostById } from '@/domains/post'
import { BBS_TYPE } from '@/constants'

export const metadata = {
  title: '커뮤니티 작성 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임 커뮤니티를 작성합니다.',
}

function CommunityFormFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="flex-end">
        <Skeleton height="40px" width="80px" />
        <Skeleton height="40px" width="100px" />
      </Box>
    </Stack>
  )
}

interface CommunityWritePageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function CommunityWritePage({
  searchParams,
}: CommunityWritePageProps) {
  const { edit } = await searchParams
  const editPostId = Number(edit)
  const isEditMode = Number.isInteger(editPostId) && editPostId > 0

  const post = isEditMode
    ? await getPostById(editPostId, BBS_TYPE.COMMUNITY)
    : null

  if (isEditMode && !post) {
    return (
      <Container maxW="container.lg" py={10}>
        <Stack gap={6} align="center">
          <Heading size="xl">커뮤니티 수정</Heading>
          <Text color="gray.600">수정할 게시글을 찾을 수 없습니다.</Text>
          <Link href="/community">
            <Button variant="outline">커뮤니티 목록으로</Button>
          </Link>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">
          {isEditMode ? '커뮤니티 수정' : '커뮤니티 작성'}
        </Heading>

        <Suspense fallback={<CommunityFormFallback />}>
          <CommunityForm
            mode={isEditMode ? 'edit' : 'create'}
            postId={isEditMode ? editPostId : undefined}
            initialTitle={post?.title || ''}
            initialContent={post?.content || ''}
          />
        </Suspense>
      </Stack>
    </Container>
  )
}
