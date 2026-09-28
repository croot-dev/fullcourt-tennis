'use client'

import { Box, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/hooks/useAuth'
import { useDeletePost } from '@/hooks/usePosts'
import { BBS_TYPE } from '@/constants'

interface NoticeActionsProps {
  postId: number
  writerId: number
}

export default function NoticeActions({
  postId,
  writerId,
}: NoticeActionsProps) {
  const router = useRouter()
  const { data: user } = useUserInfo()
  const deletePost = useDeletePost()
  const isAuthor = user?.seq === writerId

  if (!isAuthor) {
    return null
  }

  const handleDelete = () => {
    if (!confirm('게시글을 삭제하시겠습니까?\n삭제한 글은 복구할 수 없습니다.')) {
      return
    }

    deletePost.mutate(
      { id: postId, bbsTypeId: BBS_TYPE.NOTICE },
      {
        onSuccess: () => {
          router.replace('/notice')
          router.refresh()
        },
        onError: (error) => {
          console.error('글 삭제 에러:', error)
          alert('글 삭제 중 오류가 발생했습니다.')
        },
      }
    )
  }

  return (
    <Box display="flex" gap={3}>
      <Link href={`/notice/write?edit=${postId}`}>
        <Button colorScheme="blue">수정</Button>
      </Link>
      <Button
        colorScheme="red"
        variant="outline"
        onClick={handleDelete}
        loading={deletePost.isPending}
        disabled={deletePost.isPending}
      >
        삭제
      </Button>
    </Box>
  )
}
