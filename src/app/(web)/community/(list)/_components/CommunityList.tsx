import { Box, Table, Stack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { getPostList } from '@/domains/post'
import { BBS_TYPE } from '@/constants'

interface CommunityListProps {
  currentPage: number
}

export default async function CommunityList({
  currentPage,
}: CommunityListProps) {
  const {
    list: posts,
    total,
    totalPages,
  } = await getPostList(BBS_TYPE.COMMUNITY, currentPage, 10)

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <Box display={{ base: 'block', md: 'none' }}>
        {posts.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Text color="gray.600">게시글이 없습니다.</Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {posts.map((post, index) => (
              <Link
                key={post.post_id}
                href={`/notice/${post.post_id}`}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  _hover={{ bg: 'gray.50', borderColor: 'teal.500' }}
                  cursor="pointer"
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      color="gray.900"
                      flex="1"
                      mr={2}
                    >
                      {post.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                      #{total - (currentPage - 1) * 10 - index}
                    </Text>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text fontSize="sm" color="gray.600">
                      {post.writer_name}
                    </Text>
                    <Box display="flex" gap={3} fontSize="xs" color="gray.500">
                      <Text>조회 {post.view_count}</Text>
                      <Text>
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Link>
            ))}
          </Stack>
        )}
      </Box>

      {/* 데스크톱 테이블 뷰 */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader width="80px" textAlign="center">
                번호
              </Table.ColumnHeader>
              <Table.ColumnHeader>제목</Table.ColumnHeader>
              <Table.ColumnHeader width="120px" textAlign="center">
                작성자
              </Table.ColumnHeader>
              <Table.ColumnHeader width="100px" textAlign="center">
                조회수
              </Table.ColumnHeader>
              <Table.ColumnHeader width="150px" textAlign="center">
                작성일
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {posts.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py={10}>
                  게시글이 없습니다.
                </Table.Cell>
              </Table.Row>
            ) : (
              posts.map((post, index) => (
                <Table.Row key={post.post_id}>
                  <Table.Cell textAlign="center">
                    {total - (currentPage - 1) * 10 - index}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/notice/${post.post_id}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <Box
                        _hover={{
                          textDecoration: 'underline',
                          color: 'teal.500',
                        }}
                        cursor="pointer"
                      >
                        {post.title}
                      </Box>
                    </Link>
                  </Table.Cell>
                  <Table.Cell textAlign="center">{post.writer_name}</Table.Cell>
                  <Table.Cell textAlign="center">{post.view_count}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
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
            <Link href={`/notice?page=${currentPage - 1}`}>
              <Box
                as="button"
                px={{ base: 3, md: 4 }}
                py={2}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                이전
              </Box>
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Link key={pageNum} href={`/notice?page=${pageNum}`}>
                <Box
                  as="button"
                  px={{ base: 3, md: 4 }}
                  py={2}
                  border="1px solid"
                  borderColor={
                    pageNum === currentPage ? 'teal.500' : 'gray.300'
                  }
                  borderRadius="md"
                  bg={pageNum === currentPage ? 'teal.500' : 'white'}
                  color={pageNum === currentPage ? 'white' : 'inherit'}
                  _hover={{
                    bg: pageNum === currentPage ? 'teal.600' : 'gray.50',
                  }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  minW={{ base: '36px', md: '40px' }}
                >
                  {pageNum}
                </Box>
              </Link>
            )
          )}

          {currentPage < totalPages && (
            <Link href={`/notice?page=${currentPage + 1}`}>
              <Box
                as="button"
                px={{ base: 3, md: 4 }}
                py={2}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                다음
              </Box>
            </Link>
          )}
        </Box>
      )}
    </>
  )
}
