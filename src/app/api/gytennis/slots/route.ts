import { NextRequest, NextResponse } from 'next/server'

type SlotStatus = 'available' | 'booked' | 'unavailable'

interface GyTennisSlot {
  id: string
  timeLabel: string
  status: SlotStatus
}

interface GyTennisCourtSlots {
  courtLabel: string
  slots: GyTennisSlot[]
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTimeLabel(cellHtml: string): string {
  return stripTags(cellHtml).replace(/\s*~\s*/g, ' ~ ')
}

function buildTargetUrl(rawUrl: string, date: string): string {
  const parsed = new URL(rawUrl)

  if (!/(^|\.)gytennis\.or\.kr$/i.test(parsed.hostname)) {
    throw new Error('gytennis 도메인만 허용됩니다.')
  }

  const match = parsed.pathname.match(
    /^\/daily\/(\d+)(?:\/\d{4}-\d{2}-\d{2})?\/?$/,
  )
  if (!match) {
    return parsed.toString()
  }

  parsed.pathname = `/daily/${match[1]}/${date}`
  parsed.search = ''
  parsed.hash = ''
  return parsed.toString()
}

function parseStatus(cellHtml: string): SlotStatus {
  const hasYxjorg = /name="yxjorg\[\]"/i.test(cellHtml)
  const hasIsvkrr = /name="isvkrr\[\]"/i.test(cellHtml)

  if (
    /title="예약불가"/i.test(cellHtml) ||
    /<input[^>]*type="checkbox"[^>]*disabled/i.test(cellHtml)
  ) {
    return 'unavailable'
  }

  if (hasYxjorg && hasIsvkrr) {
    return 'available'
  }

  // 예약자명이 렌더링된 툴팁이 있거나, ctooltip-trigger 패턴인데 isvkrr가 없으면 예약완료로 본다.
  if (
    /<div[^>]*class="[^"]*ctooltip[^"]*"[^>]*>\s*[^<\s][\s\S]*?<\/div>/i.test(
      cellHtml,
    ) ||
    (/class="[^"]*ctooltip-trigger[^"]*"/i.test(cellHtml) && !hasIsvkrr)
  ) {
    return 'booked'
  }

  const tooltipMatch = cellHtml.match(/data-ctooltip="([01])\|/i)
  if (tooltipMatch?.[1] === '0') return 'available'
  if (tooltipMatch?.[1] === '1') return 'booked'

  return 'unavailable'
}

function parseFrmHtml(html: string): {
  sourceDate: string
  courts: GyTennisCourtSlots[]
} {
  const frmMatch = html.match(/<form[^>]*id="frm"[^>]*>([\s\S]*?)<\/form>/i)
  if (!frmMatch) {
    return { sourceDate: '', courts: [] }
  }

  const frmHtml = frmMatch[1]
  const dateMatch = frmHtml.match(/name="cdate"\s+value="(\d{4}-\d{2}-\d{2})"/i)
  const sourceDate = dateMatch?.[1] ?? ''

  const timeCells = Array.from(
    frmHtml.matchAll(/<td\s+class="wide">([\s\S]*?)<\/td>/gi),
    (m) => normalizeTimeLabel(m[1]),
  )

  const courts: GyTennisCourtSlots[] = []
  const courtTables = frmHtml.matchAll(
    /<table\s+class="innerCustom innerTop">([\s\S]*?)<\/table>/gi,
  )

  for (const tableMatch of courtTables) {
    const tableHtml = tableMatch[1]
    const courtLabelMatch = tableHtml.match(
      /<td\s+class="courtTag">\s*([^<]+?)\s*<span/is,
    )
    const courtNo = stripTags(courtLabelMatch?.[1] ?? '').trim()
    if (!courtNo) continue

    const slotCells = Array.from(
      tableHtml.matchAll(/<td\s+class="resTag">([\s\S]*?)<\/td>/gi),
      (m) => m[1],
    )

    const slots: GyTennisSlot[] = slotCells
      .slice(0, timeCells.length)
      .map((cell, idx) => ({
        id: `${courtNo}-${idx}`,
        timeLabel: timeCells[idx],
        status: parseStatus(cell),
      }))

    courts.push({
      courtLabel: `${courtNo}코트`,
      slots,
    })
  }

  return { sourceDate, courts }
}

/**
 * gytennis 예약 시간 조회
 * GET /api/gytennis/slots?rsvUrl=https://www.gytennis.or.kr/daily/1&date=2026-02-14
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rsvUrl = searchParams.get('rsvUrl')
    const date = searchParams.get('date')

    if (!rsvUrl) {
      return NextResponse.json(
        { error: 'rsvUrl 파라미터가 필요합니다.' },
        { status: 400 },
      )
    }

    const targetDate =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : new Date().toISOString().slice(0, 10)

    const targetUrl = buildTargetUrl(rsvUrl, targetDate)
    const response = await fetch(targetUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'gytennis 페이지를 불러오지 못했습니다.' },
        { status: response.status },
      )
    }

    const html = await response.text()
    const { sourceDate, courts } = parseFrmHtml(html)

    return NextResponse.json({
      sourceDate: sourceDate || targetDate,
      courts,
    })
  } catch (error) {
    console.error('gytennis 예약 조회 에러:', error)
    return NextResponse.json(
      { error: '예약 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
