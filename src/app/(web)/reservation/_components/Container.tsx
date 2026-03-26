'use client'

import { useState, useCallback } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
import Calendar from './Calendar'
import CourtList from './CourtList'
import CourtReservation from './CourtReservation'
import { useCourts } from '@/hooks/useCourt'

export default function ScheduleContainer() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const [selectedDate, setSelectedDate] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
  )
  const [calendarKey, setCalendarKey] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [indoorFilter, setIndoorFilter] = useState<boolean | undefined>(
    undefined,
  )
  const { data, isLoading, isError } = useCourts(currentPage, 10, indoorFilter)

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
              <Calendar
                key={calendarKey}
                onMonthChange={handleMonthChange}
                onDateSelect={handleDateSelect}
              />
            </Box>
            <Box flex={1}>
              <ButtonGroup mt={3} size="sm">
                <Button
                  onClick={() => setIndoorFilter(undefined)}
                  colorPalette={indoorFilter === undefined ? 'blue' : 'gray'}
                  variant={indoorFilter === undefined ? 'solid' : 'outline'}
                >
                  전체
                </Button>
                <Button
                  onClick={() => setIndoorFilter(true)}
                  colorPalette={indoorFilter === true ? 'blue' : 'gray'}
                  variant={indoorFilter === true ? 'solid' : 'outline'}
                >
                  실내
                </Button>
                <Button
                  onClick={() => setIndoorFilter(false)}
                  colorPalette={indoorFilter === false ? 'blue' : 'gray'}
                  variant={indoorFilter === false ? 'solid' : 'outline'}
                >
                  실외
                </Button>
              </ButtonGroup>
              <CourtList
                courts={courts}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
              />
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
