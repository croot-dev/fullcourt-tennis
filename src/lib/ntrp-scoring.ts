import { categories, questions } from '../constants/ntrp-assessment'

export type Answers = Partial<Record<number, number>>
// Conservative survey estimates, not a validated Korean or official USTA conversion.
// Compare the raw weighted average against these lower bounds before display rounding.
export const levels = [
  {
    min: 1,
    grade: '2.5 이하',
    summary:
      '기본 타점과 공을 안정적으로 넘기는 능력을 다져가는 수준으로 추정됩니다.',
  },
  {
    min: 2.5,
    grade: '3.0',
    summary:
      '중간 속도의 공으로 랠리를 이어가지만 방향과 깊이 조절은 제한적인 수준으로 추정됩니다.',
  },
  {
    min: 3.5,
    grade: '3.5',
    summary:
      '중간 속도의 공에서 안정성과 방향 조절 능력을 갖추며 깊이와 다양한 샷을 발전시키는 수준으로 추정됩니다.',
  },
  {
    min: 4.0,
    grade: '4.0',
    summary:
      '샷의 방향과 깊이를 조절하며 안정적인 경기 운영이 가능한 수준으로 추정됩니다.',
  },
  {
    min: 4.7,
    grade: '4.5 이상',
    summary:
      '빠른 공에도 대응하며 다양한 샷과 전술을 활용하는 수준으로 추정됩니다.',
  },
]
export const disclaimer =
  '자체 설문과 임시 점수 모델에 기반한 참고용 추정치이며, USTA 공식 NTRP 판정이 아닙니다.'
export function getLevel(average: number) {
  return (
    [...levels].reverse().find((level) => average >= level.min) ?? levels[0]
  )
}
export function validAnswer(id: number, value: unknown): value is number {
  return (
    questions
      .find((q) => q.id === id)
      ?.options.some((o) => o.value === value) ?? false
  )
}
export function calculateResult(answers: Answers) {
  const core = questions.filter((q) => q.weight > 0)
  if (!core.every((q) => validAnswer(q.id, answers[q.id]))) return null
  const averageOf = (items: typeof core) =>
    items.reduce((sum, q) => sum + answers[q.id]! * q.weight, 0) /
    items.reduce((sum, q) => sum + q.weight, 0)
  const average = averageOf(core)
  const skills = categories.map((category) => {
    const items = core.filter((q) => q.category === category)
    return { category, score: averageOf(items), items }
  })
  const high = Math.max(...skills.map((s) => s.score))
  const low = Math.min(...skills.map((s) => s.score))
  return {
    average,
    level: getLevel(average),
    skills,
    strengths: skills.filter((s) => Math.abs(s.score - high) < 1e-9),
    weaknesses: skills.filter((s) => Math.abs(s.score - low) < 1e-9),
    training: [...core]
      .filter((q) => answers[q.id]! < 5)
      .sort(
        (a, b) =>
          answers[a.id]! - answers[b.id]! || b.weight - a.weight || a.id - b.id,
      )
      .slice(0, 3),
  }
}
export type AssessmentResult = NonNullable<ReturnType<typeof calculateResult>>
