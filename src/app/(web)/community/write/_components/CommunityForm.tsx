'use client'

import { Field, Stack, Button, Input, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import { BBS_TYPE } from '@/constants'

// Quill 에디터를 동적으로 로드 (SSR 방지)
const QuillEditor = dynamic(() => import('./QuillEditor'), {
  ssr: false,
  loading: () => <Box minH="300px" bg="gray.100" borderRadius="md" />,
})

interface CommunityFormProps {
  mode?: 'create' | 'edit'
  postId?: number
  initialTitle?: string
  initialContent?: string
}

export default function CommunityForm({
  mode = 'create',
  postId,
  initialTitle = '',
  initialContent = '',
}: CommunityFormProps) {
  const router = useRouter()
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()

  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    if (mode === 'edit' && postId) {
      updatePost.mutate(
        {
          id: postId,
          bbs_type_id: BBS_TYPE.COMMUNITY,
          title,
          content,
        },
        {
          onSuccess: (result) => {
            router.push(`/community/${result.post_id}`)
            setIsSubmitting(false)
          },
          onError: (error) => {
            console.error('글 수정 에러:', error)
            alert('글 수정 중 오류가 발생했습니다.')
          },
          onSettled: () => {
            setIsSubmitting(false)
          },
        }
      )
      return
    }

    createPost.mutate(
      {
        bbs_type_id: BBS_TYPE.COMMUNITY + '',
        title,
        content,
      },
      {
        onSuccess: (result) => {
          router.push(`/community/${result.post_id}`)
          setIsSubmitting(false)
        },
        onError: (error) => {
          console.error('글 작성 에러:', error)
          alert('글 작성 중 오류가 발생했습니다.')
        },
        onSettled: () => {
          setIsSubmitting(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={6}>
        <Field.Root required>
          <Field.Label>제목</Field.Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            size="lg"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>내용</Field.Label>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요..."
          />
        </Field.Root>

        <Box display="flex" gap={3} justifyContent="flex-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            colorScheme="teal"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'edit' ? '수정하기' : '작성하기'}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
