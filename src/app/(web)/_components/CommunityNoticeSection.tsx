import { Box, Card, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
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

interface SectionCardHeaderProps {
  title: string
  href: string
  linkLabel: string
}

// 카드 제목 + 우측 전체보기 링크
function SectionCardHeader({ title, href, linkLabel }: SectionCardHeaderProps) {
  return (
    <Card.Header>
      <HStack justify="space-between" align="center">
        <Heading size="md">{title}</Heading>
        <Link href={href} aria-label={linkLabel}>
          <HStack
            gap={1}
            fontSize="sm"
            fontWeight="medium"
            color="fullcourt.pointBlue"
            _hover={{ textDecoration: 'underline' }}
          >
            <Text>전체보기</Text>
            <FaChevronRight size={10} />
          </HStack>
        </Link>
      </HStack>
    </Card.Header>
  )
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
        <SectionCardHeader
          title="커뮤니티 분위기"
          href="/community"
          linkLabel="커뮤니티 전체보기"
        />
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
      </Card.Root>

      <Card.Root>
        <SectionCardHeader
          title="공지 / 이벤트"
          href="/notice"
          linkLabel="공지사항 전체보기"
        />
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
      </Card.Root>
    </SimpleGrid>
  )
}
