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
import { useId, useMemo, useState } from 'react'
import { questions } from '@/constants/ntrp-assessment'
import { calculateResult, type Answers } from '@/lib/ntrp-scoring'

export default function NtrpAssessment({
  showTitle = true,
}: {
  showTitle?: boolean
}) {
  const questionTitleId = useId()
  const [answers, setAnswers] = useState<Answers>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const coreQuestions = questions.filter((question) => question.weight > 0)
  const answeredCount = coreQuestions.filter(
    (question) => answers[question.id] !== undefined,
  ).length
  const calculatedResult = useMemo(() => calculateResult(answers), [answers])
  const canSubmit = calculatedResult !== null
  const progressValue = (answeredCount / coreQuestions.length) * 100
  const result = submitted ? calculatedResult : null

  const currentQuestion = questions[currentIndex]

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
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
      <Card.Body p={4}>
        {result ? (
          <VStack
            align="stretch"
            justify="center"
            py={0}
            textAlign="center"
            gap={3}
          >
            <Heading size="2xl" color="fullcourt.pointBlue">
              예상 NTRP {result.level.grade}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              평균 {result.average.toFixed(2)} / 5
            </Text>
            <VStack align="stretch" gap={3} textAlign="left">
              <Heading size="md">영역별 평가</Heading>
              {result.skills.map((skill) => (
                <Box key={skill.category}>
                  <HStack justify="space-between" gap={3}>
                    <Text fontSize="sm">{skill.category}</Text>
                    <Text fontSize="sm" whiteSpace="nowrap">
                      {skill.score.toFixed(2)} / 5
                    </Text>
                  </HStack>
                  <Progress.Root
                    value={skill.score * 20}
                    aria-label={`${skill.category} ${skill.score.toFixed(2)}점 / 5점`}
                    size="sm"
                    colorPalette="blue"
                    mt={2}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </VStack>
            <HStack gap={2}>
              <Button
                flex={1}
                minH="44px"
                variant="outline"
                onClick={() => {
                  setSubmitted(false)
                  setAnswers({})
                  setCurrentIndex(0)
                }}
              >
                다시 진단하기
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack align="stretch" gap={3}>
            {currentIndex === 0 && (
              <Text fontSize="sm" color="gray.600">
                최근 3개월, 비슷하거나 더 높은 수준의 상대와 꾸준히 보여준
                실력을 골라주세요.
              </Text>
            )}
            <Text fontSize="sm" color="gray.600">
              질문 {currentIndex + 1} / {questions.length} ·{' '}
              {currentQuestion.category}
              {currentQuestion.weight === 0 ? ' (선택 · 점수 제외)' : ''}
            </Text>
            <Progress.Root
              value={progressValue}
              aria-label={`핵심 문항 ${answeredCount} / ${coreQuestions.length} 응답 완료`}
              size="sm"
              colorPalette="blue"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>

            <Box role="group" aria-labelledby={questionTitleId}>
              <Text
                id={questionTitleId}
                aria-live="polite"
                as="h2"
                fontSize="lg"
                fontWeight="bold"
                mb={2}
              >
                {currentQuestion.title}
              </Text>

              <VStack align="stretch" gap={2}>
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    answers[currentQuestion.id] === option.value
                  return (
                    <Button
                      key={option.value}
                      aria-pressed={isSelected}
                      justifyContent="flex-start"
                      whiteSpace="normal"
                      h="auto"
                      minH="44px"
                      fontSize="sm"
                      lineHeight="moderate"
                      py={2}
                      px={3}
                      textAlign="left"
                      variant={isSelected ? 'solid' : 'outline'}
                      colorPalette={isSelected ? 'blue' : 'gray'}
                      onClick={() => handleSelect(option.value)}
                    >
                      {isSelected ? '✓ ' : ''}
                      {option.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>

            <HStack gap={3} pt={2}>
              <Button
                flex={1}
                minH="44px"
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                이전
              </Button>
              <Button
                flex={2}
                minH="44px"
                bg="fullcourt.buttonPrimaryBg"
                color="fullcourt.buttonPrimaryText"
                _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
                disabled={
                  (currentQuestion.weight > 0 &&
                    answers[currentQuestion.id] === undefined) ||
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
                {currentIndex === questions.length - 1
                  ? '결과 보기'
                  : currentQuestion.weight === 0 &&
                      answers[currentQuestion.id] === undefined
                    ? '건너뛰기'
                    : '다음'}
              </Button>
            </HStack>
            {currentQuestion.weight === 0 &&
              answers[currentQuestion.id] !== undefined && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    setAnswers((previous) => {
                      const next = { ...previous }
                      delete next[currentQuestion.id]
                      return next
                    })
                  }
                >
                  선택 취소
                </Button>
              )}
            {canSubmit && currentIndex < questions.length - 1 && (
              <Button
                variant="outline"
                minH="44px"
                onClick={() => setSubmitted(true)}
              >
                결과 보기
              </Button>
            )}
          </VStack>
        )}
        <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
          참고용 자가진단이며, 공식 NTRP 등급이 아닙니다.
        </Text>
      </Card.Body>
    </Card.Root>
  )
}
