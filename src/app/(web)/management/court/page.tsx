'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Stack,
  Button,
  Table,
  Badge,
  Text,
  Spinner,
  Flex,
} from '@chakra-ui/react'
import { useCourts, useDeleteCourt } from '@/hooks/useCourt'
import { COURT_TYPE_LABEL, type CourtType } from '@/constants'
import CourtFormDialog from './_components/CourtFormDialog'
import CourtCard from '@/components/common/CourtCard'
import type { TennisCourt } from '@/domains/court/court.model'

export default function ManagementCourtPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<TennisCourt | null>(null)

  const { data, isLoading, isError } = useCourts(currentPage, 10)
  const deleteMutation = useDeleteCourt()

  const handleCreate = () => {
    setEditingCourt(null)
    setIsFormOpen(true)
  }

  const handleEdit = (court: TennisCourt) => {
    setEditingCourt(court)
    setIsFormOpen(true)
  }

  const handleDelete = async (courtId: number) => {
    if (window.confirm('정말로 이 코트를 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync(courtId)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCourt(null)
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
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
    <Container maxW="container.xl" py={10}>
      <Stack gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">코트 관리</Heading>
          <Button colorPalette="teal" onClick={handleCreate}>
            코트 추가
          </Button>
        </Box>

        {/* 모바일 카드 뷰 */}
        <Box display={{ base: 'block', md: 'none' }}>
          {courts.length === 0 ? (
            <Box
              textAlign="center"
              py={10}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Text color="gray.600">등록된 코트가 없습니다.</Text>
            </Box>
          ) : (
            <Stack gap={3}>
              {courts.map((court) => (
                <CourtCard
                  key={court.court_id}
                  court={court}
                  editable
                  isDeletePending={deleteMutation.isPending}
                  onEdit={() => handleEdit(court)}
                  onDelete={() => handleDelete(court.court_id)}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* 데스크톱 테이블 뷰 */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Table.Root variant="outline" size="lg">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>번호</Table.ColumnHeader>
                <Table.ColumnHeader>이름</Table.ColumnHeader>
                <Table.ColumnHeader>실내/외</Table.ColumnHeader>
                <Table.ColumnHeader>코트타입</Table.ColumnHeader>
                <Table.ColumnHeader>코트수</Table.ColumnHeader>
                <Table.ColumnHeader>관리</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {courts.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py={10}>
                    등록된 코트가 없습니다.
                  </Table.Cell>
                </Table.Row>
              ) : (
                courts.map((court, index) => (
                  <Table.Row key={court.court_id}>
                    <Table.Cell>
                      {total - (currentPage - 1) * 10 - index}
                    </Table.Cell>
                    <Table.Cell fontWeight="medium">{court.name}</Table.Cell>
                    <Table.Cell>
                      {court.is_indoor !== null ? (
                        <Badge
                          colorPalette={court.is_indoor ? 'blue' : 'green'}
                        >
                          {court.is_indoor ? '실내' : '실외'}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {court.court_type ? (
                        <Badge colorPalette="purple">
                          {COURT_TYPE_LABEL[court.court_type as CourtType]}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>{court.court_count ?? '-'}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(court)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorPalette="red"
                          onClick={() => handleDelete(court.court_id)}
                          loading={deleteMutation.isPending}
                        >
                          삭제
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box
            display="flex"
            justifyContent="center"
            gap={2}
            mt={6}
            flexWrap="wrap"
          >
            {currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </Button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'solid' : 'outline'}
                  colorPalette={pageNum === currentPage ? 'teal' : 'gray'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ),
            )}

            {currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                다음
              </Button>
            )}
          </Box>
        )}
      </Stack>

      <CourtFormDialog
        open={isFormOpen}
        court={editingCourt}
        onClose={handleFormClose}
      />
    </Container>
  )
}
