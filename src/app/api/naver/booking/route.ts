import { NextRequest, NextResponse } from 'next/server'

const GRAPHQL_URL =
  'https://m.booking.naver.com/graphql?opName=hourlySchedule'

const HOURLY_SCHEDULE_QUERY = `query hourlySchedule($scheduleParams: ScheduleParams) {
  schedule(input: $scheduleParams) {
    bizItemSchedule {
      hourly {
        id
        slotId
        unitStartDateTime
        unitStartTime
        unitBookingCount
        unitStock
        bookingCount
        isBusinessDay
        isSaleDay
        isUnitSaleDay
        isUnitBusinessDay
        isHoliday
        duration
        minBookingCount
        maxBookingCount
        prices {
          price
          name
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`

/**
 * 네이버 예약 시간 조회
 * GET /api/naver/booking?businessId=xxx&bizItemId=xxx&year=2026&month=2
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    const bizItemId = searchParams.get('bizItemId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!businessId || !bizItemId || !year || !month) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 },
      )
    }

    const y = parseInt(year)
    const m = parseInt(month)
    const startDateTime = `${y}-${String(m).padStart(2, '0')}-01T00:00:00`
    const lastDay = new Date(y, m, 0).getDate()
    const endDateTime = `${y}-${String(m).padStart(2, '0')}-${lastDay}T23:59:59`

    const response = await fetch(GRAPHQL_URL, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'hourlySchedule',
        variables: {
          scheduleParams: {
            businessTypeId: 10,
            businessId,
            bizItemId,
            startDateTime,
            endDateTime,
            fixedTime: true,
            includesHolidaySchedules: true,
          },
        },
        query: HOURLY_SCHEDULE_QUERY,
      }),
      method: 'POST',
    })

    const data = await response.json()
    const slots = data?.data?.schedule?.bizItemSchedule?.hourly ?? []

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('네이버 예약 조회 에러:', error)
    return NextResponse.json(
      { error: '예약 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
