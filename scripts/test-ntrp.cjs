const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join, resolve } = require('node:path')
const { execFileSync } = require('node:child_process')
const output = mkdtempSync(join(tmpdir(), 'ntrp-test-'))
try {
  execFileSync(
    process.execPath,
    [
      require.resolve('typescript/bin/tsc'),
      'src/lib/ntrp-scoring.ts',
      '--outDir',
      output,
      '--module',
      'commonjs',
      '--target',
      'ES2017',
      '--skipLibCheck',
      '--strict',
    ],
    { cwd: resolve(__dirname, '..'), stdio: 'inherit' },
  )
  const { questions, categories } = require(
    join(output, 'constants/ntrp-assessment.js'),
  )
  const { calculateResult, getLevel } = require(
    join(output, 'lib/ntrp-scoring.js'),
  )
  const core = questions.filter((q) => q.weight > 0)
  const answers = (value) => Object.fromEntries(core.map((q) => [q.id, value]))
  assert.equal(questions.length, 12)
  assert.equal(core.length, 12)
  assert.equal(
    core.reduce((sum, q) => sum + q.weight, 0),
    18,
  )
  assert.ok(core.every((q) => q.options.length === 5))
  assert.equal(calculateResult({}), null)
  for (const q of core) {
    const incomplete = answers(3)
    delete incomplete[q.id]
    assert.equal(calculateResult(incomplete), null)
    for (const invalid of [0, 6, 2.5, NaN, '3'])
      assert.equal(calculateResult({ ...answers(3), [q.id]: invalid }), null)
  }
  for (const value of [1, 5])
    assert.equal(calculateResult(answers(value)).average, value)
  for (const [boundary, before, after] of [
    [2.5, '2.5 이하', '3.0'],
    [3.5, '3.0', '3.5'],
    [4.0, '3.5', '4.0'],
    [4.7, '4.0', '4.5 이상'],
  ]) {
    assert.equal(getLevel(boundary - 0.001).grade, before)
    assert.equal(getLevel(boundary).grade, after)
    assert.equal(getLevel(boundary + 0.001).grade, after)
  }
  for (const [value, grade] of [[1, '2.5 이하'], [2, '2.5 이하'], [3, '3.0'], [4, '4.0'], [5, '4.5 이상']]) {
    assert.equal(calculateResult(answers(value)).level.grade, grade)
  }
  const balanced = { ...answers(3), 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 }
  assert.equal(calculateResult(balanced).average, 3.5)
  assert.equal(calculateResult(balanced).level.grade, '3.5')
  // Integer answers can reach 84/18 or 85/18 around the new 4.7 threshold.
  assert.equal(calculateResult({ ...answers(5), 1: 2 }).level.grade, '4.0')
  assert.equal(calculateResult({ ...answers(5), 1: 3, 4: 4 }).level.grade, '4.5 이상')
  assert.deepEqual(
    calculateResult({ ...answers(3), 13: 4, 14: 2, 15: 5 }),
    calculateResult(answers(3)),
  )
  const mixed = { ...answers(3), 1: 5, 4: 1, 5: 2 }
  const result = calculateResult(mixed)
  assert.equal(result.average, 3)
  assert.equal(result.skills[0].score, 22 / 6)
  assert.equal(result.skills[1].score, 11 / 5)
  assert.deepEqual(
    result.strengths.map((s) => s.category),
    [categories[0]],
  )
  assert.deepEqual(
    result.weaknesses.map((s) => s.category),
    [categories[1]],
  )
  assert.deepEqual(
    result.training.map((q) => q.id),
    [4, 5, 2],
  )
  assert.equal(calculateResult(answers(3)).strengths.length, 5)
  assert.equal(calculateResult(answers(3)).weaknesses.length, 5)
  assert.equal(calculateResult(answers(5)).training.length, 0)
  assert.notEqual(
    calculateResult({ ...answers(3), 1: 1 }).average,
    calculateResult(answers(3)).average,
  )
  console.log(
    'NTRP checks passed: questions, weights, required answers, unscored answers, conservative boundaries, domain scores, ties, recommendations, answer edits.',
  )
} finally {
  rmSync(output, { recursive: true, force: true })
}
