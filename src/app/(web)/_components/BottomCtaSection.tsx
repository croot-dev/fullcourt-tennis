import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function BottomCtaSection() {
  return (
    <Box
      bg="fullcourt.footerBg"
      py={{ base: 12, md: 16 }}
      color="fullcourt.ivory"
    >
      <Container maxW="container.md" textAlign="center">
        <VStack gap={5}>
          <Heading size="xl">이번 주 코트에서 만나요</Heading>
          <Text opacity={0.9}>
            일정 상세와 공지사항을 확인하고, 다음 게임 준비를 시작해보세요.
          </Text>
          <HStack gap={3} flexWrap="wrap" justify="center">
            <Link href="/schedule">
              <Button
                size="lg"
                bg="fullcourt.gold"
                color="fullcourt.text"
                _hover={{ bg: 'fullcourt.ivory' }}
              >
                일정 확인하기
              </Button>
            </Link>
            <Link href="/notice">
              <Button
                size="lg"
                variant="outline"
                color="fullcourt.ivory"
                borderColor="fullcourt.gold"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                공지사항 보기
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
