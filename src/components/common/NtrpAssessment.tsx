'use client'

import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaTrophy } from 'react-icons/fa'
import { useMemo, useState } from 'react'
import { levelQuestion, ntrpScale } from '@/constants/ntrp-assessment'

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

export default function NtrpAssessment({
  showTitle = true,
}: {
  showTitle?: boolean
}) {
  const questions = levelQuestion
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const answeredCount = Object.keys(answers).length
  const canSubmit = answeredCount === questions.length
  const progressValue = (answeredCount / questions.length) * 100

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
  }

  return (
    <Card.Root>
      {showTitle && (
        <Card.Header>
          <HStack>
            <FaTrophy color="var(--chakra-colors-fullcourt-pointBlue)" />
            <Heading size="md">실력 레벨 측정</Heading>
          </HStack>
        </Card.Header>
      )}
      <Card.Body p={{ base: 4, md: 6 }}>
        {result ? (
          <VStack
            align="stretch"
            justify="center"
            py={4}
            textAlign="center"
            gap={4}
          >
            <Text fontSize="sm" color="gray.600">
              자가 진단 예상 레벨
            </Text>
            <Heading size="2xl" color="fullcourt.pointBlue">
              NTRP {result.ntrp.grade}
            </Heading>
            <Text color="gray.700">{result.ntrp.summary}</Text>
            <Button
              width="full"
              minH="48px"
              mt={2}
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
                setCurrentIndex(0)
              }}
            >
              다시 진단하기
            </Button>
          </VStack>
        ) : (
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="gray.600">
              질문 {currentIndex + 1} / {questions.length}
            </Text>
            <Progress.Root
              value={progressValue}
              aria-label="진단 응답 진행률"
              size="sm"
              colorPalette="blue"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>

            <Box>
              <Text as="h2" fontSize="lg" fontWeight="bold" mb={2}>
                {currentQuestion.title}
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
                      aria-pressed={isSelected}
                      justifyContent="flex-start"
                      whiteSpace="normal"
                      h="auto"
                      minH="52px"
                      fontSize="sm"
                      lineHeight="tall"
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

            <HStack gap={3} pt={2}>
              <Button
                flex={1}
                minH="48px"
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                이전
              </Button>
              <Button
                flex={2}
                minH="48px"
                bg="fullcourt.buttonPrimaryBg"
                color="fullcourt.buttonPrimaryText"
                _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
                disabled={
                  answers[currentIndex] === undefined ||
                  (currentIndex === questions.length - 1 && !canSubmit)
                }
                onClick={() => {
                  if (currentIndex === questions.length - 1) {
                    setSubmitted(true)
                  } else {
                    setCurrentIndex((prev) => prev + 1)
                  }
                }}
              >
                {currentIndex === questions.length - 1 ? '결과 보기' : '다음'}
              </Button>
            </HStack>
          </VStack>
        )}
        <Text fontSize="xs" color="gray.500" textAlign="center" mt={5}>
          참고용 자가 진단이며, 공식 NTRP 등급이 아닙니다.
        </Text>
      </Card.Body>
    </Card.Root>
  )
}
