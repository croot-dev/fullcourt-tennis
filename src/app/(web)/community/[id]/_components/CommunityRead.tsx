import { Field, Stack, Button, Input, Box, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { getPostById, addViewCount } from '@/domains/post'
import CommunityActions from './CommunityActions'
import { BBS_TYPE } from '@/constants'

interface CommunityReadProps {
  postId: number
}

export default async function CommunityRead({ postId }: CommunityReadProps) {
  const post = await getPostById(postId, BBS_TYPE.COMMUNITY)

  if (!post) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.600">
          게시글을 찾을 수 없습니다.
        </Text>
        <Link href="/community">
          <Button mt={4} variant="outline">
            목록으로
          </Button>
        </Link>
      </Box>
    )
  }

  addViewCount(postId, 1)

  return (
    <Stack gap={6}>
      {/* 게시글 정보 */}
      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>
          작성자: {post.writer_name} | 작성일:{' '}
          {new Date(post.created_at).toLocaleDateString('ko-KR')} | 조회수:{' '}
          {post.view_count}
        </Text>
      </Box>

      {/* 제목 */}
      <Field.Root>
        <Field.Label>제목</Field.Label>
        <Input value={post.title} readOnly bg="gray.50" />
      </Field.Root>

      {/* 내용 */}
      <Field.Root>
        <Field.Label>내용</Field.Label>
        <Box
          minH="300px"
          width="full"
          p={4}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
          css={{
            '& p': { marginBottom: '1em' },
            '& ul, & ol': { marginLeft: '1.5em', marginBottom: '1em' },
            '& h1, & h2, & h3': { fontWeight: 'bold', marginBottom: '0.5em' },
          }}
        />
      </Field.Root>

      {/* 버튼 */}
      <Box display="flex" gap={3} justifyContent="space-between">
        <Link href="/community">
          <Button variant="outline">목록으로</Button>
        </Link>

        <NoticeActions postId={post.post_id} writerId={post.writer_seq} />
      </Box>
    </Stack>
  )
}
