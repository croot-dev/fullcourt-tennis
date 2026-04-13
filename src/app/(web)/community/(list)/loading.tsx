import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'

export default function NoticeListLoading() {
  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">커뮤니티</Heading>
        </Box>

        <Box>
          <Stack gap={3}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} height="60px" />
            ))}
          </Stack>
        </Box>

        <Box display="flex" justifyContent="center" gap={2} mt={6}>
          <Skeleton height="40px" width="200px" />
        </Box>
      </Stack>
    </Container>
  )
}
