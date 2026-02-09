'use client'

import { useState, useCallback } from 'react'
import { Box, Container, Flex, Tabs, Text } from '@chakra-ui/react'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
import type { CalendarEvent } from '@/hooks/useEvent'
import Calendar from './Calendar'
import CourtList from './CourtList'
import CourtReservation from './CourtReservation'
import { useCourts } from '@/hooks/useCourt'

interface ContainerProps {
  initialEvents: CalendarEvent[]
}

export default function ScheduleContainer({ initialEvents }: ContainerProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const [selectedDate, setSelectedDate] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  )
  const [calendarKey, setCalendarKey] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading, isError } = useCourts(currentPage, 10)

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month })
  }, [])

  const handleDateSelect = useCallback((dateStr: string) => {
    setSelectedDate(dateStr)
  }, [])

  const handleTabChange = (details: { value: string }) => {
    if (details.value === 'schedule') {
      setCalendarKey((prev) => prev + 1)
    }
  }

  if (isError) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text color="red.500">
          코트 목록을 불러오는 중 오류가 발생했습니다.
        </Text>
      </Container>
    )
  }

  const { courts, total, totalPages } = data || {
    courts: [],
    total: 0,
    totalPages: 0,
  }

  return (
    <Box p={4}>
      <Tabs.Root
        defaultValue="schedule"
        variant="line"
        lazyMount
        unmountOnExit
        onValueChange={handleTabChange}
      >
        <Tabs.List mb={4}>
          <Tabs.Trigger value="schedule">
            <LuCalendar />
            예약현황
          </Tabs.Trigger>
          <Tabs.Trigger value="court">
            <LuMapPin />
            코트지도
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="schedule">
          <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
            <Box flex={3}>
              <Calendar key={calendarKey} onMonthChange={handleMonthChange} onDateSelect={handleDateSelect} />
            </Box>
            <Box flex={1}>
              <CourtList courts={courts} currentMonth={currentMonth} selectedDate={selectedDate} />
            </Box>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="court">
          <CourtReservation />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
