import { NextRequest, NextResponse } from 'next/server'

const GRAPHQL_URL = 'https://m.booking.naver.com/graphql?opName=bizItems'

const BIZ_ITEMS_QUERY = `query bizItems($input: BizItemsParams) {
  bizItems(input: $input) {
    businessId
    bizItemId
    name
    desc
    price
    bizItemType
    minBookingTime
    maxBookingTime
    resources {
      resourceUrl
      __typename
    }
    __typename
  }
}`

/**
 * 네이버 예약 상품(bizItem) 목록 조회
 * GET /api/naver/booking/biz-items?businessId=767366
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId 파라미터가 필요합니다.' },
        { status: 400 }
      )
    }

    const response = await fetch(GRAPHQL_URL, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'bizItems',
        variables: {
          withTypeValues: false,
          withReviewStat: false,
          withBookedCount: false,
          withBizItemDetail: false,
          input: {
            businessId,
            lang: 'ko',
            projections: 'RESOURCE',
          },
        },
        query: BIZ_ITEMS_QUERY,
      }),
      method: 'POST',
    })

    const data = await response.json()
    const bizItems = data?.data?.bizItems ?? []

    return NextResponse.json({ bizItems })
  } catch (error) {
    console.error('네이버 예약 상품 조회 에러:', error)
    return NextResponse.json(
      { error: '예약 상품 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
