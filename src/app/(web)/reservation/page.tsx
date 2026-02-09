import { getEventList } from '@/domains/event'
import type { EventWithHost } from '@/domains/event/event.model'
import type { CalendarEvent } from '@/hooks/useEvent'
import Container from './_components/Container'

function toCalendarEvent(event: EventWithHost): CalendarEvent {
  return {
    id: String(event.id),
    title: event.title,
    start: `${new Date(event.start_datetime).toISOString()}`,
    end: `${new Date(event.end_datetime).toISOString()}`,
    extendedProps: {
      description: event.description || undefined,
      location_name: event.location_name || undefined,
      max_participants: event.max_participants,
      current_participants: event.current_participants,
      host_nickname: event.host_nickname,
    },
  }
}

export default async function SchedulePage() {
  const now = new Date()
  const result = await getEventList(1, 100, {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const events = result.events.map(toCalendarEvent)

  return <Container initialEvents={events} />
}
