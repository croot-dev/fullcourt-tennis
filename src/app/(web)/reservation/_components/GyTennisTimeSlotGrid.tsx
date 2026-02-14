'use client'

import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { request } from '@/lib/api.client'

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

interface GyTennisSlotsResponse {
  sourceDate: string
  courts: GyTennisCourtSlots[]
}

interface GyTennisTimeSlotGridProps {
  rsvUrl: string
  /** YYYY-MM-DD */
  date?: string
}

const STATUS_STYLES: Record<
  SlotStatus,
  { bg: string; color: string; borderColor: string; text: string }
> = {
  available: {
    bg: 'teal.50',
    color: 'teal.700',
    borderColor: 'teal.200',
    text: '가능',
  },
  booked: {
    bg: 'red.50',
    color: 'red.500',
    borderColor: 'red.200',
    text: '예약',
  },
  unavailable: {
    bg: 'gray.50',
    color: 'gray.400',
    borderColor: 'gray.200',
    text: '불가',
  },
}

function renderSlotGrid(slots: GyTennisSlot[]) {
  return (
    <Flex overflow="auto" width="full" gap={1}>
      {slots.map((slot) => {
        const style = STATUS_STYLES[slot.status]
        const start = slot.timeLabel.split('~')[0]?.trim() ?? slot.timeLabel
        const hourMatch = start.match(/(\d{1,2})\s*:/)
        const hour = hourMatch ? `${Number(hourMatch[1])}시` : start

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
              {hour}
            </Text>
            <Text fontSize="2xs">{style.text}</Text>
          </Box>
        )
      })}
    </Flex>
  )
}

export default function GyTennisTimeSlotGrid({
  rsvUrl,
  date,
}: GyTennisTimeSlotGridProps) {
  const targetDate = date ?? new Date().toISOString().slice(0, 10)

  const { data, isLoading } = useQuery({
    queryKey: ['gytennis-slots', rsvUrl, targetDate],
    queryFn: () =>
      request<GyTennisSlotsResponse>(
        `/api/gytennis/slots?rsvUrl=${encodeURIComponent(rsvUrl)}&date=${targetDate}`,
        { auth: false },
      ),
    enabled: !!rsvUrl,
  })

  if (isLoading) {
    return (
      <Flex justify="center" py={4}>
        <Spinner size="sm" />
      </Flex>
    )
  }

  const courts = data?.courts ?? []

  if (courts.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
        예약 정보가 없습니다.
      </Text>
    )
  }

  return (
    <Box>
      {courts.map((court, idx) => (
        <Box key={court.courtLabel} mt={idx > 0 ? 4 : 0}>
          <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
            {court.courtLabel}
          </Text>
          {renderSlotGrid(court.slots)}
        </Box>
      ))}
    </Box>
  )
}
