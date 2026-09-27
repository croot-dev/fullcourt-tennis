import {
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaCheckCircle, FaUsers } from 'react-icons/fa'
import NtrpAssessment from '@/components/common/NtrpAssessment'

export default function IntroGuideSection() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
      <Card.Root>
        <Card.Header>
          <HStack>
            <FaUsers color="var(--chakra-colors-fullcourt-pointBlue)" />
            <Heading size="md">모임 소개</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack align="start" gap={3}>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>정기 모임: 일요일 (주 1회)</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>번개 게임: 주말 및 주중 저녁 수시 오픈</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>회비: 미정</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>준비물: 운동화, 라켓, 음료, 열정 🔥</Text>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      <NtrpAssessment />
    </SimpleGrid>
  )
}
