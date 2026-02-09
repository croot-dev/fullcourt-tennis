'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Box,
  Text,
  Stack,
  Button,
  Dialog,
  Portal,
  Grid,
  Flex,
  Spinner,
  IconButton,
} from '@chakra-ui/react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useQuery } from '@tanstack/react-query'
import { request } from '@/lib/api.client'
import dayjs from 'dayjs'

export interface HourlySlot {
  id: string
  slotId: string | null
  unitStartDateTime: string
  unitStartTime: string
  unitBookingCount: number
  unitStock: number
  bookingCount: number
  isBusinessDay: boolean
  isSaleDay: boolean
  isUnitSaleDay: boolean
  isUnitBusinessDay: boolean
  isHoliday: boolean
  duration: number
  minBookingCount: number
  maxBookingCount: number
  prices: { price: number; name: string | null }[]
}

interface BizItem {
  bizItemId: string
  name: string
}

interface ReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courtName: string
  businessId: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildCalendarDays(year: number, month: number) {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const daysInMonth = firstDay.daysInMonth()
  const startDayOfWeek = firstDay.day()

  const days: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return days
}

export default function ReservationModal({
  open,
  onOpenChange,
  courtName,
  businessId,
}: ReservationModalProps) {
  const [currentYear, setCurrentYear] = useState(dayjs().year())
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1)
  const [selectedDay, setSelectedDay] = useState(dayjs().date())
  const [startSlotId, setStartSlotId] = useState<string | null>(null)
  const [endSlotId, setEndSlotId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const now = dayjs()
      setCurrentYear(now.year())
      setCurrentMonth(now.month() + 1)
      setSelectedDay(now.date())
      setStartSlotId(null)
      setEndSlotId(null)
    }
  }, [open])

  const { data: bizItemsData } = useQuery({
    queryKey: ['naver-biz-items', businessId],
    queryFn: () =>
      request<{ bizItems: BizItem[] }>(
        `/api/naver/booking/biz-items?businessId=${businessId}`,
        { auth: false },
      ),
    enabled: open && !!businessId,
  })

  const bizItemId = bizItemsData?.bizItems?.[0]?.bizItemId ?? null

  const { data, isLoading } = useQuery({
    queryKey: [
      'naver-booking',
      businessId,
      bizItemId,
      currentYear,
      currentMonth,
    ],
    queryFn: () =>
      request<{ slots: HourlySlot[] }>(
        `/api/naver/booking?businessId=${businessId}&bizItemId=${bizItemId}&year=${currentYear}&month=${currentMonth}`,
        { auth: false },
      ),
    enabled: open && !!businessId && !!bizItemId,
  })

  const allSlots = data?.slots ?? []

  const selectedDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`

  const daySlots = useMemo(() => {
    return allSlots.filter((slot) =>
      slot.unitStartTime.startsWith(selectedDateStr),
    )
  }, [allSlots, selectedDateStr])

  const calendarDays = useMemo(
    () => buildCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  )

  const navigateMonth = (direction: -1 | 1) => {
    let newYear = currentYear
    let newMonth = currentMonth + direction
    if (newMonth === 0) {
      newYear -= 1
      newMonth = 12
    } else if (newMonth === 13) {
      newYear += 1
      newMonth = 1
    }
    setCurrentYear(newYear)
    setCurrentMonth(newMonth)

    const now = dayjs()
    setSelectedDay(
      now.year() === newYear && now.month() + 1 === newMonth
        ? now.date()
        : 1,
    )
    setStartSlotId(null)
    setEndSlotId(null)
  }

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    setStartSlotId(null)
    setEndSlotId(null)
  }

  const handleTimeSelect = useCallback(
    (slot: HourlySlot) => {
      if (!slot.isSaleDay) return

      if (!startSlotId) {
        setStartSlotId(slot.id)
        setEndSlotId(null)
      } else if (startSlotId === slot.id) {
        setStartSlotId(null)
        setEndSlotId(null)
      } else {
        const startSlot = daySlots.find((s) => s.id === startSlotId)
        if (startSlot && slot.unitStartTime > startSlot.unitStartTime) {
          setEndSlotId(slot.id)
        } else {
          setStartSlotId(slot.id)
          setEndSlotId(null)
        }
      }
    },
    [startSlotId, daySlots],
  )

  const isToday = (day: number) => {
    const now = dayjs()
    return (
      now.year() === currentYear &&
      now.month() + 1 === currentMonth &&
      now.date() === day
    )
  }

  const getSlotState = (slot: HourlySlot) => {
    if (!slot.isSaleDay) return 'disabled'
    if (slot.id === startSlotId) return 'start'
    if (slot.id === endSlotId) return 'end'

    if (startSlotId && endSlotId) {
      const startSlot = daySlots.find((s) => s.id === startSlotId)
      const endSlot = daySlots.find((s) => s.id === endSlotId)
      if (
        startSlot &&
        endSlot &&
        slot.unitStartTime > startSlot.unitStartTime &&
        slot.unitStartTime < endSlot.unitStartTime
      ) {
        return 'inRange'
      }
    }

    return 'default'
  }

  const getSelectedTimeSummary = () => {
    if (!startSlotId) return null
    const startSlot = daySlots.find((s) => s.id === startSlotId)
    if (!startSlot) return null

    const startTime = dayjs(
      startSlot.unitStartTime,
      'YYYY-MM-DD HH:mm:ss',
    ).format('HH:mm')

    if (endSlotId) {
      const endSlot = daySlots.find((s) => s.id === endSlotId)
      if (endSlot) {
        const endTime = dayjs(endSlot.unitStartTime, 'YYYY-MM-DD HH:mm:ss')
          .add(endSlot.duration, 'minute')
          .format('HH:mm')
        return `${startTime} ~ ${endTime}`
      }
    }

    const endTime = dayjs(startSlot.unitStartTime, 'YYYY-MM-DD HH:mm:ss')
      .add(startSlot.duration, 'minute')
      .format('HH:mm')
    return `${startTime} ~ ${endTime}`
  }

  const getTotalPrice = () => {
    if (!startSlotId) return null
    const startIdx = daySlots.findIndex((s) => s.id === startSlotId)
    if (startIdx === -1) return null

    const endIdx = endSlotId
      ? daySlots.findIndex((s) => s.id === endSlotId)
      : startIdx
    if (endIdx === -1) return null

    let total = 0
    for (let i = startIdx; i <= endIdx; i++) {
      const price = daySlots[i]?.prices?.[0]?.price
      if (price != null) total += price
    }
    return total > 0 ? total : null
  }

  const bookingUrl = bizItemId
    ? `https://m.booking.naver.com/booking/10/bizes/${businessId}/items/${bizItemId}?startDate=${selectedDateStr}`
    : null

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="full"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header borderBottomWidth="1px">
              <Dialog.Title fontSize="lg">{courtName} 예약</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body overflow="auto" p={4}>
              {/* Calendar */}
              <Box mb={6}>
                <Flex justify="space-between" align="center" mb={3}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                    aria-label="이전 달"
                  >
                    <LuChevronLeft />
                  </IconButton>
                  <Text fontWeight="bold" fontSize="md">
                    {currentYear}년 {currentMonth}월
                  </Text>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                    aria-label="다음 달"
                  >
                    <LuChevronRight />
                  </IconButton>
                </Flex>

                <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
                  {WEEKDAYS.map((day, i) => (
                    <Box key={day} textAlign="center" py={1}>
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color={
                          i === 0
                            ? 'red.500'
                            : i === 6
                              ? 'blue.500'
                              : 'gray.500'
                        }
                      >
                        {day}
                      </Text>
                    </Box>
                  ))}
                </Grid>

                <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                  {calendarDays.map((day, idx) => (
                    <Box key={idx} textAlign="center">
                      {day ? (
                        <Button
                          variant={selectedDay === day ? 'solid' : 'ghost'}
                          colorPalette={
                            selectedDay === day ? 'teal' : undefined
                          }
                          size="sm"
                          w="100%"
                          h="36px"
                          onClick={() => handleDaySelect(day)}
                          position="relative"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight={isToday(day) ? 'bold' : 'normal'}
                          >
                            {day}
                          </Text>
                          {isToday(day) && selectedDay !== day && (
                            <Box
                              position="absolute"
                              bottom="2px"
                              w="4px"
                              h="4px"
                              borderRadius="full"
                              bg="teal.500"
                            />
                          )}
                        </Button>
                      ) : (
                        <Box h="36px" />
                      )}
                    </Box>
                  ))}
                </Grid>
              </Box>

              {/* Time Slots */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  {currentMonth}월 {selectedDay}일 시간 선택
                </Text>

                {isLoading ? (
                  <Flex justify="center" py={6}>
                    <Spinner />
                  </Flex>
                ) : daySlots.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={6}>
                    예약 가능한 시간이 없습니다.
                  </Text>
                ) : (
                  <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                    {daySlots.map((slot) => {
                      const state = getSlotState(slot)
                      const time = dayjs(
                        slot.unitStartTime,
                        'YYYY-MM-DD HH:mm:ss',
                      ).format('HH:mm')
                      const price = slot.prices?.[0]?.price

                      return (
                        <Button
                          key={slot.id}
                          size="sm"
                          h="auto"
                          py={2}
                          variant={
                            state === 'start' || state === 'end'
                              ? 'solid'
                              : state === 'inRange'
                                ? 'subtle'
                                : 'outline'
                          }
                          colorPalette={
                            state === 'start' ||
                            state === 'end' ||
                            state === 'inRange'
                              ? 'teal'
                              : undefined
                          }
                          disabled={state === 'disabled'}
                          opacity={state === 'disabled' ? 0.4 : 1}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          <Stack gap={0} align="center">
                            <Text fontSize="sm" fontWeight="medium">
                              {time}
                            </Text>
                            {price != null && (
                              <Text fontSize="xs" opacity={0.8}>
                                {price.toLocaleString()}원
                              </Text>
                            )}
                          </Stack>
                        </Button>
                      )
                    })}
                  </Grid>
                )}
              </Box>
            </Dialog.Body>

            {startSlotId && (
              <Dialog.Footer borderTopWidth="1px">
                <Stack w="100%" gap={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.600">
                      {getSelectedTimeSummary()}
                    </Text>
                    {getTotalPrice() != null && (
                      <Text fontWeight="bold">
                        {getTotalPrice()!.toLocaleString()}원
                      </Text>
                    )}
                  </Flex>
                  <Button
                    colorPalette="teal"
                    w="100%"
                    disabled={!bookingUrl}
                    onClick={() => bookingUrl && window.open(bookingUrl, '_blank')}
                  >
                    네이버 예약하기
                  </Button>
                </Stack>
              </Dialog.Footer>
            )}

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
