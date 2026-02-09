'use client'

import { useState, useCallback } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { useEvents, toCalendarEvent } from '@/hooks/useEvent'
import type { CalendarEvent } from '@/hooks/useEvent'
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleList from './ScheduleList'

interface ScheduleContainerProps {
  initialEvents: CalendarEvent[]
}

export default function ScheduleContainer({
  initialEvents,
}: ScheduleContainerProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data: fetchedEvents } = useEvents(1, 100, currentMonth)
  const events = fetchedEvents
    ? fetchedEvents.map(toCalendarEvent)
    : initialEvents

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month })
  }, [])

  return (
    <Box p={4}>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
        <Box flex={3}>
          <ScheduleCalendar
            initialEvents={events}
            onMonthChange={handleMonthChange}
          />
        </Box>
        <Box flex={1}>
          <ScheduleList events={events} currentMonth={currentMonth} />
        </Box>
      </Flex>
    </Box>
  )
}
