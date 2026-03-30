'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  Badge,
  Separator,
} from '@chakra-ui/react'
import {
  useEventDetail,
  useJoinEvent,
  useCancelEvent,
  useDeleteEvent,
} from '@/hooks/useEvent'
import { useUserInfo } from '@/hooks/useAuth'
import { toaster } from '@/components/ui/toaster'
import type { EventParticipantStatusType } from '@/domains/event/event.model'
import Link from 'next/link'
import { MEMBER_ROLE } from '@/constants'
import EventEditDialog from './_components/EventEditDialog'
import ParticipantItem from './_components/ParticipantItem'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const eventId = parseInt(id)
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data, isLoading, error } = useEventDetail(eventId)
  const { data: userInfo } = useUserInfo()
  const joinEvent = useJoinEvent()
  const cancelEvent = useCancelEvent()
  const deleteEvent = useDeleteEvent()

  const isJoined = data?.participants.some(
    (p) => p.member_seq === userInfo?.seq && p.status === 'JOIN',
  )
  const isOperator =
    userInfo?.role_code === MEMBER_ROLE.ADMIN ||
    userInfo?.role_code === MEMBER_ROLE.OPER
  const isEventStarted = data
    ? new Date(data.event.start_datetime) <= new Date()
    : false

  const handleJoin = async () => {
    try {
      await joinEvent.mutateAsync(eventId)
      toaster.success({ title: '참여 신청이 완료되었습니다.' })
    } catch {
      toaster.error({ title: '참여 신청에 실패했습니다.' })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelEvent.mutateAsync(eventId)
      toaster.success({ title: '참여가 취소되었습니다.' })
    } catch {
      toaster.error({ title: '참여 취소에 실패했습니다.' })
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteEvent.mutateAsync(eventId)
      toaster.success({ title: '일정이 삭제되었습니다.' })
      router.push('/schedule')
    } catch {
      toaster.error({ title: '삭제에 실패했습니다.' })
    }
  }

  if (isLoading) {
    return (
      <Container maxW="container.md" py={10}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container maxW="container.md" py={10}>
        <Text color="red.500">일정을 불러오는 중 오류가 발생했습니다.</Text>
        <Button mt={4} onClick={() => router.push('/schedule')}>
          목록으로
        </Button>
      </Container>
    )
  }

  const { event, participants, comments } = data

  const getStatusBadge = (status: EventParticipantStatusType) => {
    switch (status) {
      case 'JOIN':
        return <Badge colorPalette="green">참여</Badge>
      case 'WAIT':
        return <Badge colorPalette="yellow">대기</Badge>
      case 'CANCEL':
        return <Badge colorPalette="gray">취소</Badge>
      default:
        return null
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <Stack gap={6}>
        {/* 헤더 */}
        <Flex justify="space-between" align="start">
          <Box>
            <Heading size="xl">{event.title}</Heading>
            <Text color="gray.500" mt={2}>
              주최: {event.host_nickname}
            </Text>
          </Box>
          <Badge colorPalette="blue" fontSize="md" p={2}>
            {event.current_participants}/{event.max_participants}명
          </Badge>
        </Flex>

        <Separator />

        {/* 일정 정보 */}
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Flex gap={8}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">
                    날짜/시간
                  </Text>
                  <Text fontSize="lg">
                    {Intl.DateTimeFormat('ko-KR', {
                      dateStyle: 'short',
                    }).format(new Date(event.start_datetime))}{' '}
                    {Intl.DateTimeFormat('ko-KR', {
                      timeStyle: 'short',
                    }).format(new Date(event.start_datetime))}{' '}
                    ~{' '}
                    {Intl.DateTimeFormat('ko-KR', {
                      timeStyle: 'short',
                    }).format(new Date(event.end_datetime))}{' '}
                  </Text>
                </Box>
              </Flex>

              {event.location_name && (
                <Box>
                  <Text fontWeight="bold" color="gray.600">
                    장소
                  </Text>
                  <Text fontSize="lg">{event.location_name}</Text>
                  {event.location_url && (
                    <Link href={event.location_url} target="_blank">
                      <Text color="blue.500" fontSize="sm">
                        지도 보기
                      </Text>
                    </Link>
                  )}
                </Box>
              )}

              {event.description && (
                <Box>
                  <Text fontWeight="bold" color="gray.600">
                    설명
                  </Text>
                  <Text whiteSpace="pre-wrap">{event.description}</Text>
                </Box>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* 참여자 목록 */}
        <Box>
          <Heading size="md" mb={4}>
            참여자 ({participants.filter((p) => p.status === 'JOIN').length}명)
          </Heading>
          <Stack gap={2}>
            {participants.length === 0 ? (
              <Text color="gray.500">아직 참여자가 없습니다.</Text>
            ) : (
              participants
                .filter((p) => p.status !== 'CANCEL')
                .map((participant) => (
                  <Card.Root key={participant.id} size="sm">
                    <Card.Body py={3}>
                      <Flex justify="space-between" align="center">
                        <ParticipantItem
                          nickname={participant.nickname}
                          gender={participant.gender}
                        />
                        <Flex align="center" gap={2}>
                          {participant.status === 'WAIT' && (
                            <Text fontSize="sm" color="gray.500">
                              대기 {participant.wait_order}번
                            </Text>
                          )}
                          {getStatusBadge(participant.status)}
                        </Flex>
                      </Flex>
                    </Card.Body>
                  </Card.Root>
                ))
            )}
          </Stack>
        </Box>

        {/* 댓글 */}
        <Box>
          <Heading size="md" mb={4}>
            댓글 ({comments.length})
          </Heading>
          <Stack gap={2}>
            {comments.length === 0 ? (
              <Text color="gray.500">댓글이 없습니다.</Text>
            ) : (
              comments.map((comment) => (
                <Card.Root key={comment.id} size="sm">
                  <Card.Body py={3}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontWeight="bold" fontSize="sm">
                        {comment.member_nickname}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(comment.created_at).toLocaleString('ko-KR')}
                      </Text>
                    </Flex>
                    <Text>{comment.content}</Text>
                  </Card.Body>
                </Card.Root>
              ))
            )}
          </Stack>
        </Box>

        <Separator />

        {/* 액션 버튼 */}
        <Flex justify="space-between">
          <Button variant="ghost" onClick={() => router.push('/schedule')}>
            목록으로
          </Button>
          <Flex gap={2}>
            {isOperator && !isEventStarted && (
              <>
                <Button
                  colorPalette="red"
                  variant="outline"
                  onClick={handleDelete}
                  loading={deleteEvent.isPending}
                >
                  삭제
                </Button>
                <Button
                  colorPalette="gray"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  수정
                </Button>
              </>
            )}
            {!isEventStarted &&
              (isJoined ? (
                <Button
                  colorPalette="gray"
                  variant="outline"
                  onClick={handleCancel}
                  loading={cancelEvent.isPending}
                >
                  참여 취소
                </Button>
              ) : (
                <Button
                  colorPalette="blue"
                  onClick={handleJoin}
                  loading={joinEvent.isPending}
                >
                  참여 신청
                </Button>
              ))}
          </Flex>
        </Flex>
      </Stack>

      {isOperator && (
        <EventEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          event={event}
        />
      )}
    </Container>
  )
}
