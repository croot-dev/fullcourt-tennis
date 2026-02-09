'use client'

import { useMemo } from 'react'
import { Box, Text, Flex, Spinner, Badge } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { request } from '@/lib/api.client'
import dayjs from 'dayjs'
import type { HourlySlot } from './ReservationModal'

interface BizItem {
  bizItemId: string
  name: string
}

interface TimeSlotGridProps {
  businessId: string
  /** YYYY-MM-DD */
  date?: string
}

type SlotStatus = 'available' | 'booked' | 'unavailable'

function getSlotStatus(slot: HourlySlot): SlotStatus {
  if (!slot.isSaleDay || !slot.isUnitSaleDay) return 'unavailable'
  if (!slot.isUnitBusinessDay) return 'unavailable'
  if (slot.unitBookingCount >= slot.unitStock) return 'booked'
  return 'available'
}

const STATUS_STYLES: Record<
  SlotStatus,
  { bg: string; color: string; borderColor: string }
> = {
  available: { bg: 'teal.50', color: 'teal.700', borderColor: 'teal.200' },
  booked: { bg: 'red.50', color: 'red.500', borderColor: 'red.200' },
  unavailable: { bg: 'gray.50', color: 'gray.400', borderColor: 'gray.200' },
}

function renderSlotGrid(slots: HourlySlot[]) {
  return (
    <Flex overflow="auto" width="full" gap={1}>
      {slots.map((slot) => {
        const status = getSlotStatus(slot)
        const style = STATUS_STYLES[status]
        const time = dayjs(slot.unitStartTime, 'YYYY-MM-DD HH:mm:ss').format(
          'H시'
        )
        const price = slot.prices?.[0]?.price

        return (
          <Box
            key={slot.id}
            bg={style.bg}
            color={style.color}
            borderWidth="1px"
            borderColor={style.borderColor}
            py={0.5}
            px={0.5}
            width={10}
            flex="none"
            textAlign="center"
          >
            <Text fontSize="xs" fontWeight="medium">
              {time}
            </Text>
            {status === 'available' && price != null && price > 0 && (
              <Text fontSize="2xs" opacity={0.8}>
                ₩{(price / 10000).toLocaleString()}
              </Text>
            )}
            {status === 'booked' && <Text fontSize="2xs">마감</Text>}
          </Box>
        )
      })}
    </Flex>
  )
}

function BizItemSlots({
  businessId,
  bizItemId,
  targetDate,
  label,
}: {
  businessId: string
  bizItemId: string
  targetDate: string
  label: string
}) {
  const year = dayjs(targetDate).year()
  const month = dayjs(targetDate).month() + 1

  const { data, isLoading } = useQuery({
    queryKey: ['naver-booking', businessId, bizItemId, year, month],
    queryFn: () =>
      request<{ slots: HourlySlot[] }>(
        `/api/naver/booking?businessId=${businessId}&bizItemId=${bizItemId}&year=${year}&month=${month}`,
        { auth: false }
      ),
    enabled: !!businessId && !!bizItemId,
  })

  const daySlots = useMemo(() => {
    if (!data?.slots) return []
    return data.slots.filter((slot) =>
      slot.unitStartTime.startsWith(targetDate)
    )
  }, [data?.slots, targetDate])

  if (isLoading) {
    return (
      <Flex justify="center" py={4}>
        <Spinner size="sm" />
      </Flex>
    )
  }

  if (daySlots.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
        예약 정보가 없습니다.
      </Text>
    )
  }

  const amSlots = daySlots.filter((slot) => {
    const hour = dayjs(slot.unitStartTime, 'YYYY-MM-DD HH:mm:ss').hour()
    return hour < 12
  })
  const pmSlots = daySlots.filter((slot) => {
    const hour = dayjs(slot.unitStartTime, 'YYYY-MM-DD HH:mm:ss').hour()
    return hour >= 12
  })

  const counts = daySlots.reduce(
    (acc, slot) => {
      const status = getSlotStatus(slot)
      acc[status]++
      return acc
    },
    { available: 0, booked: 0, unavailable: 0 } as Record<SlotStatus, number>
  )

  return (
    <Box>
      <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
        {label}
      </Text>

      {/*
      <Flex gap={2} mb={3} flexWrap="wrap">
        <Badge colorPalette="teal" variant="subtle">
          예약가능 {counts.available}
        </Badge>
        <Badge colorPalette="red" variant="subtle">
          예약완료 {counts.booked}
        </Badge>
        <Badge variant="subtle">이용불가 {counts.unavailable}</Badge>
      </Flex>
      */}

      {amSlots.length > 0 && <Box mb={3}>{renderSlotGrid(amSlots)}</Box>}

      {pmSlots.length > 0 && <Box>{renderSlotGrid(pmSlots)}</Box>}
    </Box>
  )
}

export default function TimeSlotGrid({ businessId, date }: TimeSlotGridProps) {
  const targetDate = date ?? dayjs().format('YYYY-MM-DD')

  const { data: bizItemsData, isLoading: isBizItemsLoading } = useQuery({
    queryKey: ['naver-biz-items', businessId],
    queryFn: () =>
      request<{ bizItems: BizItem[] }>(
        `/api/naver/booking/biz-items?businessId=${businessId}`,
        { auth: false }
      ),
    enabled: !!businessId,
  })

  const bizItems = bizItemsData?.bizItems ?? []

  if (isBizItemsLoading) {
    return (
      <Flex justify="center" py={4}>
        <Spinner size="sm" />
      </Flex>
    )
  }

  if (bizItems.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
        예약 정보가 없습니다.
      </Text>
    )
  }

  return (
    <Box>
      {bizItems.map((item, idx) => (
        <Box key={item.bizItemId} mt={idx > 0 ? 4 : 0}>
          <BizItemSlots
            businessId={businessId}
            bizItemId={item.bizItemId}
            targetDate={targetDate}
            label={item.name}
          />
        </Box>
      ))}
    </Box>
  )
}
