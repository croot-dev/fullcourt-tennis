'use client'

import { useState } from 'react'
import { Badge, Box, Button, Flex, IconButton, Stack } from '@chakra-ui/react'
import { TennisCourt } from '@/domains/court'
import CourtCard from '@/components/common/CourtCard'
import { LuBookPlus } from 'react-icons/lu'
import TimeSlotGrid from './TimeSlotGrid'
import GyTennisTimeSlotGrid from './GyTennisTimeSlotGrid'

interface CourtListProps {
  courts: TennisCourt[]
  currentMonth: { year: number; month: number }
  selectedDate: string
}

export default function CourtList({ courts, selectedDate }: CourtListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const isGyTennisUrl = (url: string | null) => {
    if (!url) return false
    try {
      const parsed = new URL(url)
      return /(^|\.)gytennis\.or\.kr$/i.test(parsed.hostname)
    } catch {
      return false
    }
  }

  const toggleExpand = (courtId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(courtId)) {
        next.delete(courtId)
      } else {
        next.add(courtId)
      }
      return next
    })
  }

  const renderActions = (court: TennisCourt) => {
    return (
      <IconButton
        variant="ghost"
        size="sm"
        color="gray.500"
        _hover={{ color: 'teal.600' }}
        aria-label="예약"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <LuBookPlus />
      </IconButton>
    )
  }

  const renderTimeSlots = (court: TennisCourt) => {
    if (!expandedIds.has(court.court_id)) return null

    if (court.naver_business_id) {
      return (
        <Box mt={1} onClick={(e) => e.stopPropagation()}>
          <TimeSlotGrid
            businessId={court.naver_business_id}
            date={selectedDate}
          />
        </Box>
      )
    }

    if (isGyTennisUrl(court.rsv_url)) {
      return (
        <Box mt={1} onClick={(e) => e.stopPropagation()}>
          <GyTennisTimeSlotGrid rsvUrl={court.rsv_url!} date={selectedDate} />
        </Box>
      )
    }

    return null
  }

  const expandableIds = courts
    .filter((c) => c.naver_business_id || isGyTennisUrl(c.rsv_url))
    .map((c) => c.court_id)

  const expandAll = () => setExpandedIds(new Set(expandableIds))
  const collapseAll = () => setExpandedIds(new Set())

  const isAllExpanded =
    expandableIds.length > 0 && expandableIds.every((id) => expandedIds.has(id))

  return (
    <Box display={{ base: 'block' }}>
      <Flex gap={2} mb={3} flexWrap="wrap" justify="space-between" align="center">
        <Flex gap={2} flexWrap="wrap">
          <Badge colorPalette="teal" variant="subtle">
            예약가능
          </Badge>
          <Badge colorPalette="red" variant="subtle">
            예약완료
          </Badge>
          <Badge variant="subtle">이용불가</Badge>
        </Flex>
        {expandableIds.length > 0 && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="teal"
            onClick={isAllExpanded ? collapseAll : expandAll}
          >
            {isAllExpanded ? '전체 닫기' : '전체 펼침'}
          </Button>
        )}
      </Flex>

      <Stack gap={3}>
        {courts.map((court) => (
          <CourtCard
            key={court.court_id}
            court={court}
            onSelect={() => toggleExpand(court.court_id)}
            isSelected={expandedIds.has(court.court_id)}
            renderActions={renderActions}
            renderAppend={renderTimeSlots}
          />
        ))}
      </Stack>
    </Box>
  )
}
