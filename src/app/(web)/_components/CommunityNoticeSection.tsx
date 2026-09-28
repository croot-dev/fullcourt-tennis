import { Box, Button, Card, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'
import type { PostListItem } from '@/domains/post'
import type { RecentPostImageDto } from '@/domains/image/image.model'

interface CommunityNoticeSectionProps {
  notices: PostListItem[]
  communityPosts: PostListItem[]
  communityImages: RecentPostImageDto[]
}

export default function CommunityNoticeSection({
  notices,
  communityPosts,
  communityImages,
}: CommunityNoticeSectionProps) {
  const isCommunityEmpty =
    communityPosts.length === 0 && communityImages.length === 0

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
      <Card.Root>
        <Card.Header>
          <Heading size="md">커뮤니티 분위기</Heading>
        </Card.Header>
        <Card.Body>
          {isCommunityEmpty && (
            <Text color="gray.600">아직 등록된 커뮤니티 글이 없습니다.</Text>
          )}
          {communityImages.length > 0 && (
            <SimpleGrid columns={3} gap={3} mb={4}>
              {communityImages.map((image, index) => (
                <Link
                  key={image.url}
                  href={`/community/${image.post_id}`}
                  aria-label={`커뮤니티 게시글 사진 ${index + 1}`}
                >
                  <Box
                    aspectRatio={1}
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                    transition="opacity 0.15s"
                    _hover={{ opacity: 0.85 }}
                  >
                    <Image
                      src={image.url}
                      alt={`커뮤니티 게시글 사진 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 30vw, 140px"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}
          <VStack align="stretch" gap={2}>
            {communityPosts.map((post) => (
              <Link key={post.post_id} href={`/community/${post.post_id}`}>
                <HStack
                  justify="space-between"
                  color="gray.700"
                  _hover={{ color: 'fullcourt.pointBlue' }}
                >
                  <Text lineClamp={1}>“{post.title}”</Text>
                  <Text fontSize="sm" color="gray.500" flexShrink={0}>
                    {post.writer_name}
                  </Text>
                </HStack>
              </Link>
            ))}
          </VStack>
        </Card.Body>
        <Card.Footer>
          <Link href="/community">
            <Button
              variant="ghost"
              color="fullcourt.pointBlue"
              _hover={{ bg: 'fullcourt.buttonOutlineHover' }}
            >
              커뮤니티 전체보기
            </Button>
          </Link>
        </Card.Footer>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">공지 / 이벤트</Heading>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" gap={3}>
            {notices.length === 0 && <Text color="gray.600">등록된 공지사항이 없습니다.</Text>}
            {notices.map((notice) => (
              <Link key={notice.post_id} href={`/notice/${notice.post_id}`}>
                <HStack justify="space-between" _hover={{ color: 'fullcourt.pointBlue' }}>
                  <Text lineClamp={1}>{notice.title}</Text>
                  <FaChevronRight color="#4a5568" />
                </HStack>
              </Link>
            ))}
          </VStack>
        </Card.Body>
        <Card.Footer>
          <Link href="/notice">
            <Button variant="ghost" color="fullcourt.pointBlue" _hover={{ bg: 'fullcourt.buttonOutlineHover' }}>
              공지사항 전체보기
            </Button>
          </Link>
        </Card.Footer>
      </Card.Root>
    </SimpleGrid>
  )
}
