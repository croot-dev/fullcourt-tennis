import nextEnv from '@next/env'
import { neon } from '@neondatabase/serverless'
import { performance } from 'node:perf_hooks'
import { readQuery } from './query-source.mjs'

nextEnv.loadEnvConfig(process.cwd())
const sql = neon(process.env.DATABASE_URL)
const options = { readOnly: true, isolationLevel: 'RepeatableRead' }
const upcoming = readQuery('src/domains/event/event.query.ts', 'selectUpcomingEvents', { limit: 2 })
const recent = readQuery('src/domains/post/post.query.ts', 'selectRecentPosts', { bbsTypeId: 1, limit: 3 })
const queries = {
  eventsBefore: 'SELECT e.*, m.name AS host_name, m.nickname AS host_nickname FROM events e JOIN member m ON e.host_member_seq = m.seq ORDER BY e.start_datetime DESC, e.end_datetime DESC LIMIT 100',
  eventsAfter: upcoming,
  noticesAfter: recent,
  eventCount: 'SELECT COUNT(*) AS total FROM events',
  notices: 'SELECT p.post_id, p.bbs_type_id, p.title, p.writer_seq, p.view_count, p.created_at, p.updated_at, m.nickname AS writer_name FROM bbs_post p LEFT JOIN member m ON p.writer_seq = m.seq WHERE p.bbs_type_id = 1 AND (p.display_start_at IS NULL OR p.display_start_at <= NOW()) AND (p.display_end_at IS NULL OR p.display_end_at >= NOW()) ORDER BY p.created_at DESC LIMIT 3',
  noticeCount: 'SELECT COUNT(*) AS total FROM bbs_post WHERE bbs_type_id = 1 AND (display_start_at IS NULL OR display_start_at <= NOW()) AND (display_end_at IS NULL OR display_end_at >= NOW())',
}
const round = n => Math.round(n * 100) / 100
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
async function read(text) {
  return sql.query(typeof text === 'string' ? text : text.text, typeof text === 'string' ? [] : text.params, { fetchOptions: { signal: AbortSignal.timeout(10000) } })
}
async function measure(run) {
  const start = performance.now()
  const rows = await run()
  return { ms: round(performance.now() - start), bytes: Buffer.byteLength(JSON.stringify(rows)) }
}
async function main() {
  const cold = await measure(() => read('SELECT 1'))
  console.log(JSON.stringify({ firstRequestMs: cold.ms }))
  for (const [name, text] of Object.entries(queries)) {
    const [, result] = await sql.transaction([
      sql`SELECT set_config('statement_timeout', '5000', true)`,
      sql.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${typeof text === 'string' ? text : text.text}`, typeof text === 'string' ? [] : text.params),
    ], { ...options, fetchOptions: { signal: AbortSignal.timeout(10000) } })
    const plan = result[0]['QUERY PLAN'][0]
    console.log(JSON.stringify({ query: name, planningMs: plan['Planning Time'], executionMs: plan['Execution Time'], rows: plan.Plan['Actual Rows'], sharedHits: plan.Plan['Shared Hit Blocks'], sharedReads: plan.Plan['Shared Read Blocks'] }))
  }
  const cases = {
    homeBefore: () => Promise.all(Object.entries(queries).filter(([name]) => !name.endsWith('After')).map(([, text]) => read(text))),
    homeAfter: () => Promise.all([read(queries.eventsAfter), read(queries.noticesAfter)]),
    noticesParallel: () => Promise.all([read(queries.notices), read(queries.noticeCount)]),
    noticesBatched: () => sql.transaction([sql.query(queries.notices), sql.query(queries.noticeCount)], { ...options, fetchOptions: { signal: AbortSignal.timeout(10000) } }),
  }
  const samples = Object.fromEntries(Object.keys(cases).map(name => [name, []]))
  // Warm up every variant, then alternate order to reduce connection warm-up bias.
  for (const [name, run] of Object.entries(cases)) {
    console.log(JSON.stringify({ warmup: name }))
    await run()
  }
  for (let i = 0; i < 7; i++) {
    const entries = Object.entries(cases)
    if (i % 2) entries.reverse()
    for (const [name, run] of entries) samples[name].push(await measure(run))
  }
  for (const [name, values] of Object.entries(samples)) {
    console.log(JSON.stringify({ scenario: name, medianMs: median(values.map(v => v.ms)), minMs: Math.min(...values.map(v => v.ms)), maxMs: Math.max(...values.map(v => v.ms)), responseJsonBytes: values[0].bytes, samples: values.length }))
  }
}
main().catch(error => {
  // Never print connection URLs, query results, or server error details.
  console.error(JSON.stringify({ error: 'DB performance read failed', name: error.name, code: error.code ?? error.cause?.code ?? 'UNKNOWN' }))
  process.exitCode = 1
})
