'use client'

import { useState, useMemo } from 'react'
import { Box, Text, Stack, IconButton, Spinner, Flex } from '@chakra-ui/react'
import { LuCalendarCheck2 } from 'react-icons/lu'
import NaverMap from '@/components/common/NaverMap'
import CourtCard from '@/components/common/CourtCard'
import { useCourts } from '@/hooks/useCourt'
import type { TennisCourt } from '@/domains/court/court.model'
import ReservationModal from './ReservationModal'

export default function CourtReservation() {
  const [selectedCourt, setSelectedCourt] = useState<TennisCourt | null>(null)
  const [reservationCourt, setReservationCourt] = useState<TennisCourt | null>(
    null
  )
  const { data, isLoading } = useCourts(1, 100)

  const courts = useMemo(() => {
    if (!data?.courts) return []
    return data.courts
  }, [data?.courts])

  const indoorCourts = courts.filter((c) => c.is_indoor === true)
  const outdoorCourts = courts.filter((c) => c.is_indoor !== true)

  const handleSelect = (court: TennisCourt) => {
    if (selectedCourt?.court_id === court.court_id) {
      setSelectedCourt(null)
    } else {
      setSelectedCourt(court)
    }
  }

  const renderReservationAction = (court: TennisCourt) => {
    console.log(court.naver_business_id)
    if (!court.naver_business_id) return null
    return (
      <IconButton
        variant="ghost"
        size="sm"
        color="gray.500"
        _hover={{ color: 'teal.600' }}
        aria-label="예약"
        onClick={(e) => {
          e.stopPropagation()
          setReservationCourt(court)
        }}
      >
        <LuCalendarCheck2 />
      </IconButton>
    )
  }

  return (
    <Stack gap={6}>
      <Box>
        <NaverMap courts={courts} selectedCourt={selectedCourt} />
      </Box>

      {isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {indoorCourts.length > 0 && (
            <Stack gap={3}>
              <Text fontWeight="bold" color="gray.700">
                실내 코트
              </Text>
              <Stack gap={2}>
                {indoorCourts.map((court) => (
                  <CourtCard
                    key={court.court_id}
                    court={court}
                    isSelected={selectedCourt?.court_id === court.court_id}
                    onSelect={() => handleSelect(court)}
                    renderActions={renderReservationAction}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {outdoorCourts.length > 0 && (
            <Stack gap={3}>
              <Text fontWeight="bold" color="gray.700">
                야외 코트
              </Text>
              <Stack gap={2}>
                {outdoorCourts.map((court) => (
                  <CourtCard
                    key={court.court_id}
                    court={court}
                    isSelected={selectedCourt?.court_id === court.court_id}
                    onSelect={() => handleSelect(court)}
                    renderActions={renderReservationAction}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {courts.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">등록된 코트가 없습니다.</Text>
            </Box>
          )}
        </>
      )}

      {reservationCourt && (
        <ReservationModal
          open={!!reservationCourt}
          onOpenChange={(open) => {
            if (!open) setReservationCourt(null)
          }}
          courtName={reservationCourt.name}
          businessId={reservationCourt.naver_business_id!}
        />
      )}
    </Stack>
  )
}
