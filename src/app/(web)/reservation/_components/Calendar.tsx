'use client'

import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { Box } from '@chakra-ui/react'
import '@/styles/fullcalendar.css'

interface ScheduleCalendarProps {
  onMonthChange?: (year: number, month: number) => void
  onDateSelect?: (dateStr: string) => void
}

export default function ScheduleCalendar({
  onMonthChange,
  onDateSelect,
}: ScheduleCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const handleDateClick = (arg: { dateStr: string; jsEvent: MouseEvent }) => {
    setSelectedDate(arg.dateStr)
    onDateSelect?.(arg.dateStr)
  }

  const dayCellClassNames = useCallback(
    (arg: { date: Date }) => {
      const d = arg.date
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return dateStr === selectedDate ? ['fc-day-selected'] : []
    },
    [selectedDate]
  )
  const handleEventClick = (arg: { event: { id: string } }) => {
    router.push(`/schedule/event/${arg.event.id}`)
  }

  const handleDatesSet = useCallback(
    (arg: { view: { currentStart: Date } }) => {
      const date = arg.view.currentStart
      onMonthChange?.(date.getFullYear(), date.getMonth() + 1)
    },
    [onMonthChange]
  )

  return (
    <Box>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        dayCellClassNames={dayCellClassNames}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        locale="ko"
        buttonText={{
          today: '오늘',
          month: '월',
          week: '주',
        }}
      />
    </Box>
  )
}
