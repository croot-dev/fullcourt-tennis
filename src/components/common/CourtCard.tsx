'use client'

import { Text, Card, Badge, Button, Flex, Stack } from '@chakra-ui/react'
import { LuMapPin } from 'react-icons/lu'
import { COURT_TYPE_LABEL, type CourtType } from '@/constants'
import type { TennisCourt } from '@/domains/court/court.model'

export interface CourtCardProps {
  court: TennisCourt
  isSelected?: boolean
  editable?: boolean
  isDeletePending?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  renderActions?: (court: TennisCourt) => React.ReactNode
  renderAppend?: (court: TennisCourt) => React.ReactNode
}

function IndoorBadge({ isIndoor }: { isIndoor: boolean | null }) {
  if (isIndoor === null) return null
  return (
    <Badge colorPalette={isIndoor ? 'blue' : 'green'}>
      {isIndoor ? '실내' : '실외'}
    </Badge>
  )
}

function CourtTypeBadge({ courtType }: { courtType: CourtType | null }) {
  if (!courtType) return null
  return <Badge colorPalette="purple">{COURT_TYPE_LABEL[courtType]}</Badge>
}

export default function CourtCard({
  court,
  isSelected,
  editable,
  isDeletePending,
  onSelect,
  onEdit,
  onDelete,
  renderActions,
  renderAppend,
}: CourtCardProps) {
  return (
    <Card.Root
      borderColor={isSelected ? 'teal.500' : undefined}
      borderWidth={isSelected ? '2px' : '1px'}
      _hover={onSelect ? { shadow: 'md', borderColor: 'teal.500' } : undefined}
      transition="all 0.2s"
      cursor={onSelect ? 'pointer' : undefined}
      onClick={onSelect}
    >
      <Card.Body padding={3}>
        <Stack gap={2}>
          <Flex justify="space-between" align="start">
            <Stack direction="row" align="center" gap={1}>
              {onSelect && (
                <LuMapPin
                  color={
                    isSelected ? 'var(--chakra-colors-teal-500)' : undefined
                  }
                />
              )}
              <Text fontWeight="medium">{court.name}</Text>
            </Stack>
            <Flex gap={2} align="center">
              <IndoorBadge isIndoor={court.is_indoor} />
              <CourtTypeBadge courtType={court.court_type as CourtType} />
              {renderActions?.(court)}
            </Flex>
          </Flex>
          {court.address && (
            <Text fontSize="sm" color="gray.600">
              {court.address}
            </Text>
          )}
          {court.court_count && (
            <Text fontSize="sm" color="gray.500">
              코트 {court.court_count}면
            </Text>
          )}
          {editable && (
            <Flex gap={2} mt={1}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                수정
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.()
                }}
                loading={isDeletePending}
              >
                삭제
              </Button>
            </Flex>
          )}
          {renderAppend?.(court)}
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
