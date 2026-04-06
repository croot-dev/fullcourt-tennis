import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import type { EventWithHost } from '@/domains/event/event.model'
import { formatDate, formatTimeRange } from './home.utils'

interface HeroSectionProps {
  heroEvents: EventWithHost[]
}

export default function HeroSection({ heroEvents }: HeroSectionProps) {
  return (
    <Box
      bg="fullcourt.sectionBg"
      color="fullcourt.text"
      py={{ base: 16, md: 24 }}
    >
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 16 }}>
          <VStack align="start" gap={6}>
            <Badge
              bg="fullcourt.accentBg"
              color="fullcourt.accentText"
              px={3}
              py={1}
            >
              New Season 2026
            </Badge>
            <Heading
              size={{ base: 'xl', md: '3xl' }}
              lineHeight={1.2}
              fontFamily="Poppins, sans-serif"
            >
              코트 전체를 열정으로 가득 채우는
              <br />
              풀코트 (Full Court) 테니스 모임
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'xl' }}
              maxW="xl"
              color="fullcourt.textSoft"
            >
              풀코트는 테니스를 막 시작한 20~30대 테린이들이 함께 배우고, 함께
              즐기며 꾸준히 성장하는 테니스 모임입니다.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Link href="/schedule">
                <Button
                  size="lg"
                  bg="fullcourt.buttonPrimaryBg"
                  color="fullcourt.buttonPrimaryText"
                  _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
                >
                  전체 일정 보기
                </Button>
              </Link>
              <Link href="/notice">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="fullcourt.buttonOutlineBorder"
                  color="fullcourt.text"
                  _hover={{ bg: 'fullcourt.buttonOutlineHover' }}
                >
                  공지사항 보기
                </Button>
              </Link>
            </HStack>
          </VStack>

          <Card.Root bg="fullcourt.cardBg" borderColor="fullcourt.border">
            <Card.Header>
              <HStack color="fullcourt.text">
                <FaCalendarAlt />
                <Heading size="md">다음 일정</Heading>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack align="stretch" gap={4}>
                {heroEvents.length === 0 && (
                  <Text color="fullcourt.textMuted">
                    등록된 예정 일정이 없습니다.
                  </Text>
                )}
                {heroEvents.map((event) => (
                  <Box
                    key={event.id}
                    bg="fullcourt.sectionBg"
                    p={4}
                    borderRadius="md"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">
                        {formatDate(event.start_datetime)}
                      </Text>
                      <Link href={`/schedule/event/${event.id}`}>
                        <Button
                          size="xs"
                          variant="outline"
                          color="fullcourt.pointBlue"
                          borderColor="fullcourt.buttonOutlineBorder"
                          _hover={{ bg: 'fullcourt.buttonOutlineHover' }}
                        >
                          상세보기
                        </Button>
                      </Link>
                    </HStack>
                    <Text fontSize="sm">
                      {formatTimeRange(
                        event.start_datetime,
                        event.end_datetime,
                      )}
                    </Text>
                    <HStack fontSize="sm" color="fullcourt.textMuted">
                      <FaMapMarkerAlt />
                      <Text>{event.location_name || '장소 미정'}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
