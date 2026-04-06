import { Box, Button, Card, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'
import type { PostListItem } from '@/domains/post'

interface CommunityNoticeSectionProps {
  notices: PostListItem[]
}

const communityImages = [
  '/images/community_1.jpg',
  '/images/community_2.jpg',
  '/images/community_3.jpg',
  '/images/community_4.jpg',
  '/images/community_5.jpg',
  '/images/community_6.jpg',
] as const

export default function CommunityNoticeSection({ notices }: CommunityNoticeSectionProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
      <Card.Root>
        <Card.Header>
          <Heading size="md">커뮤니티 분위기</Heading>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={3} gap={3} mb={4}>
            {communityImages.map((src, index) => (
              <Box key={src} aspectRatio={1} borderRadius="md" overflow="hidden" position="relative">
                <Image
                  src={src}
                  alt={`커뮤니티 활동 사진 ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 30vw, 140px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            ))}
          </SimpleGrid>
          <Text color="gray.700" mb={2}>
            “첫 참여였는데 분위기가 정말 편하고, 게임도 재밌었어요.”
          </Text>
          <Text color="gray.700">“레벨 맞춰서 매칭해줘서 부담 없이 계속 나오게 됩니다.”</Text>
        </Card.Body>
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
