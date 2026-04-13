'use client'

import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useAuth'

export default function CommunityWriteButton() {
  const { data } = useUserInfo()

  if (!data) {
    return null
  }

  return (
    <Link href="/community/write">
      <Button colorScheme="teal">글쓰기</Button>
    </Link>
  )
}
