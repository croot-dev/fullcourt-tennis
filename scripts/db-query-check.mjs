import assert from 'node:assert/strict'
import nextEnv from '@next/env'
import { neon } from '@neondatabase/serverless'
import { readQuery } from './query-source.mjs'

nextEnv.loadEnvConfig(process.cwd())
const sql = neon(process.env.DATABASE_URL)
const upcoming = readQuery('src/domains/event/event.query.ts', 'selectUpcomingEvents', { limit: 2 })
const recent = readQuery('src/domains/post/post.query.ts', 'selectRecentPosts', { bbsTypeId: 1, limit: 3 })
const members = "member AS (SELECT 1 AS seq, 'fixture'::text AS name, 'fixture'::text AS nickname)"
async function check(label, fixtures, query, key, expected) {
  const [, rows] = await sql.transaction([
    sql`SELECT set_config('statement_timeout', '5000', true)`,
    sql.query(`WITH ${members}, ${fixtures} ${query.text}`, query.params),
  ], { readOnly: true, fetchOptions: { signal: AbortSignal.timeout(10000) } })
  assert.deepEqual(rows.map(row => row[key]), expected, label)
  console.log(`PASS ${label}`)
}
async function main() {
  // Fixtures shadow real tables through CTEs; no writes or private data are needed.
  await check('ongoing and earliest events, even with more than 100 future events', `events AS (
    SELECT n AS id, 1 AS host_member_seq, NOW() + n * INTERVAL '1 day' AS start_datetime,
      NOW() + (n + 1) * INTERVAL '1 day' AS end_datetime FROM generate_series(1, 120) n
    UNION ALL SELECT 1001, 1, NOW() - INTERVAL '1 hour', NOW()
    UNION ALL SELECT 1002, 1, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
  )`, upcoming, 'id', [1001, 1])
  await check('empty event results', `events AS (
    SELECT 1 AS id, 1 AS host_member_seq, NOW() - INTERVAL '2 days' AS start_datetime,
      NOW() - INTERVAL '1 day' AS end_datetime
  )`, upcoming, 'id', [])
  await check('equal event start times have stable ordering', `events AS (
    SELECT n AS id, 1 AS host_member_seq, NOW() AS start_datetime, NOW() AS end_datetime
    FROM generate_series(3, 1, -1) n
  )`, upcoming, 'id', [1, 2])
  await check('public notices only, inclusive boundaries, stable order and missing writer', `bbs_post AS (
    SELECT n AS post_id, CASE WHEN n = 6 THEN 2 ELSE 1 END AS bbs_type_id,
      'fixture'::text AS title, CASE WHEN n = 2 THEN NULL ELSE 1 END AS writer_seq,
      0 AS view_count, NOW() AS created_at, NOW() AS updated_at,
      CASE WHEN n = 4 THEN NOW() + INTERVAL '1 day' WHEN n = 3 THEN NOW() ELSE NULL END AS display_start_at,
      CASE WHEN n = 5 THEN NOW() - INTERVAL '1 day' WHEN n = 3 THEN NOW() ELSE NULL END AS display_end_at
    FROM generate_series(1, 6) n
  )`, recent, 'post_id', [3, 2, 1])
  await check('notice limit is applied', `bbs_post AS (
    SELECT n AS post_id, 1 AS bbs_type_id, 'fixture'::text AS title, 1 AS writer_seq,
      0 AS view_count, NOW() AS created_at, NOW() AS updated_at,
      NULL::timestamptz AS display_start_at, NULL::timestamptz AS display_end_at
    FROM generate_series(1, 10) n
  )`, recent, 'post_id', [10, 9, 8])
}
main().catch(error => {
  console.error(JSON.stringify({ error: 'Query regression check failed', name: error.name, code: error.code ?? 'UNKNOWN' }))
  process.exitCode = 1
})
