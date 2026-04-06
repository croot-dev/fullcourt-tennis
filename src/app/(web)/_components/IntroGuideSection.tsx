'use client'

import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaCheckCircle, FaTrophy, FaUsers } from 'react-icons/fa'
import { useMemo, useState } from 'react'
import { levelQuestion, ntrpScale } from './home.constants'

function getNtrpByScore(score: number) {
  const normalized = (score - 1) / 3
  const index = Math.max(
    0,
    Math.min(
      ntrpScale.length - 1,
      Math.round(normalized * (ntrpScale.length - 1)),
    ),
  )
  return ntrpScale[index]
}

export default function IntroGuideSection() {
  const questions = levelQuestion
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const answeredCount = Object.keys(answers).length
  const canSubmit = answeredCount === questions.length
  const progressValue = ((currentIndex + 1) / questions.length) * 100

  const result = useMemo(() => {
    if (!submitted || !canSubmit) return null
    const total = Object.values(answers).reduce((sum, value) => sum + value, 0)
    const average = total / questions.length
    const ntrp = getNtrpByScore(average)
    return { average, ntrp }
  }, [answers, canSubmit, questions.length, submitted])

  const currentQuestion = questions[currentIndex]

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }))
    setSubmitted(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

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

      <Card.Root>
        <Card.Header>
          <HStack>
            <FaTrophy color="var(--chakra-colors-fullcourt-pointBlue)" />
            <Heading size="md">실력 레벨 측정</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          {result ? (
            <VStack
              align="stretch"
              justify="center"
              border="1px solid"
              borderColor="fullcourt.border"
              bg="fullcourt.sectionBg"
              borderRadius="md"
              p={6}
              gap={4}
            >
              <Text fontSize="sm" color="gray.600">
                실력 진단 결과
              </Text>
              <Heading size="2xl" color="fullcourt.pointBlue">
                NTRP {result.ntrp.grade}
              </Heading>
              <Text color="gray.700">{result.ntrp.summary}</Text>
              <Button
                alignSelf="flex-start"
                mt={2}
                variant="outline"
                onClick={() => {
                  setSubmitted(false)
                  setCurrentIndex(0)
                }}
              >
                다시 진단하기
              </Button>
            </VStack>
          ) : (
            <VStack align="stretch" gap={5}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  간단 진단 ({questions.length}문항)
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {currentIndex + 1} / {questions.length}
                </Text>
              </HStack>
              <Progress.Root
                value={progressValue}
                size="sm"
                colorPalette="blue"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  {currentIndex + 1}. {currentQuestion.title}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  {currentQuestion.description}
                </Text>

                <VStack align="stretch" gap={2}>
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentIndex] === option.value
                    return (
                      <Button
                        key={option.value}
                        justifyContent="flex-start"
                        whiteSpace="normal"
                        h="auto"
                        py={3}
                        px={4}
                        textAlign="left"
                        variant={isSelected ? 'solid' : 'outline'}
                        colorPalette={isSelected ? 'blue' : 'gray'}
                        onClick={() => handleSelect(option.value)}
                      >
                        {option.label}
                      </Button>
                    )
                  })}
                </VStack>
              </Box>

              <HStack justify="space-between" align="center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentIndex === 0}
                >
                  이전
                </Button>
                <HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1),
                      )
                    }
                    disabled={currentIndex === questions.length - 1}
                  >
                    다음
                  </Button>
                  <Button
                    size="sm"
                    bg="fullcourt.buttonPrimaryBg"
                    color="fullcourt.buttonPrimaryText"
                    _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
                    disabled={!canSubmit}
                    onClick={() => setSubmitted(true)}
                  >
                    레벨 진단하기
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          )}
        </Card.Body>
      </Card.Root>
    </SimpleGrid>
  )
}
