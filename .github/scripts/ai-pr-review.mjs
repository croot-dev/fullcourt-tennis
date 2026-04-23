import fs from 'node:fs'
import { execSync } from 'node:child_process'

const MARKER = '<!-- ai-pr-review -->'

function run(command, options = {}) {
  try {
    return execSync(command, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      ...options,
    }).trim()
  } catch (error) {
    return (error?.stdout || error?.stderr || '').toString().trim()
  }
}

function readFileIfExists(path, fallback = '') {
  if (!fs.existsSync(path)) return fallback
  return fs.readFileSync(path, 'utf8')
}

function truncate(label, text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}\n\n[${label} truncated: ${text.length - maxLength} chars omitted]`
}

async function githubRequest({ method = 'GET', path, token, body }) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'fullcourt-ai-review-bot',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub API failed (${response.status}): ${errorText}`)
  }

  if (response.status === 204) return null
  return response.json()
}

function parseResponseText(payload) {
  const chunks = []
  for (const block of payload?.content || []) {
    if (block?.type === 'text' && block?.text) {
      chunks.push(block.text)
    }
  }
  return chunks.join('\n').trim()
}

async function main() {
  const githubToken = process.env.GITHUB_TOKEN
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  const eventPath = process.env.GITHUB_EVENT_PATH
  const repository = process.env.GITHUB_REPOSITORY
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  if (!githubToken) throw new Error('GITHUB_TOKEN is required')
  if (!anthropicApiKey) throw new Error('ANTHROPIC_API_KEY is required')
  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required')
  if (!repository) throw new Error('GITHUB_REPOSITORY is required')

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const pullRequest = event.pull_request

  if (!pullRequest) {
    console.log('No pull_request payload found. Skipping.')
    return
  }

  const [owner, repo] = repository.split('/')
  const prNumber = pullRequest.number
  const baseSha = pullRequest.base.sha
  const headSha = pullRequest.head.sha

  const changedFiles = run(`git diff --name-only ${baseSha}...${headSha}`)
  const commits = run(
    `git log --reverse --pretty=format:"%h%x09%s" ${baseSha}..${headSha}`,
  )
  const diff = run(`git diff --unified=3 ${baseSha}...${headSha}`)

  const conventions = readFileIfExists('CONVENSIONS.md', 'CONVENSIONS.md not found')
  const commitTemplate = readFileIfExists('.gitmessage.txt', 'commit template not found')
  const reviewRules = readFileIfExists('.github/ai-review/review-rules.md', 'review rules not found')
  const lintResult = readFileIfExists('.github/artifacts/lint.txt', 'lint result not found')
  const auditSummary = readFileIfExists(
    '.github/artifacts/audit-summary.txt',
    'audit summary not found',
  )

  const prompt = `아래 정보를 기반으로 PR 코드리뷰를 한국어로 작성해줘.

[반드시 점검할 항목]
1. 커밋메시지 template 적합성
2. 코딩 컨벤션 준수 여부
3. 보안 점검
4. 성능 점검

[출력 형식]
- 제목: "## 🤖 AI 코드 리뷰"
- 먼저 전체 요약 3~5줄
- 그 다음, 이슈가 있으면 심각도 순서(Critical > High > Medium > Low)로 나열
- 각 이슈는 다음 포맷 사용:
  - [심각도] 영역
  - 문제
  - 영향
  - 개선 제안
  - 관련 파일/커밋
- 이슈가 없으면 "중대한 이슈 없음" 명시
- 마지막에 "추가 확인이 필요한 항목"을 짧게 제시

[주의]
- 불확실한 내용은 반드시 "추정"이라고 표시
- 과도한 일반론보다 실제 diff/로그 근거를 우선
- 컨벤션 검사는 반드시 CONVENSIONS.md 기준으로 판단

[Commit Message Template]
${truncate('commit template', commitTemplate, 6000)}

[Review Rules]
${truncate('review rules', reviewRules, 6000)}

[Project Conventions]
${truncate('conventions', conventions, 14000)}

[Changed Files]
${truncate('changed files', changedFiles || 'No changed files', 5000)}

[Commits]
${truncate('commits', commits || 'No commits', 7000)}

[Lint Result]
${truncate('lint', lintResult, 12000)}

[Audit Summary]
${truncate('audit', auditSummary, 10000)}

[Diff]
${truncate('diff', diff || 'No diff', 100000)}
`

  const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system:
        'You are a senior software reviewer. You provide concrete, actionable, evidence-based code review comments in Korean.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!claudeResponse.ok) {
    const errorText = await claudeResponse.text()
    throw new Error(`Anthropic API failed (${claudeResponse.status}): ${errorText}`)
  }

  const claudePayload = await claudeResponse.json()
  const reviewBody = parseResponseText(claudePayload)

  if (!reviewBody) {
    throw new Error('Claude response did not contain review text')
  }

  const finalBody = `${MARKER}\n${reviewBody}\n\n---\n자동 생성 리뷰입니다. 중요한 변경은 사람이 최종 확인하세요.`

  const comments = await githubRequest({
    path: `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
    token: githubToken,
  })

  const previous = comments.find(
    (comment) => comment?.body?.includes(MARKER) && comment?.user?.type === 'Bot',
  )

  if (previous) {
    await githubRequest({
      method: 'PATCH',
      path: `/repos/${owner}/${repo}/issues/comments/${previous.id}`,
      token: githubToken,
      body: { body: finalBody },
    })
    console.log(`Updated existing AI review comment: ${previous.id}`)
    return
  }

  await githubRequest({
    method: 'POST',
    path: `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    token: githubToken,
    body: { body: finalBody },
  })

  console.log('Created new AI review comment')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
