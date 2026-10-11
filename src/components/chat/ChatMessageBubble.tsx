'use client'

import { Box, Text } from '@chakra-ui/react'
import type { ChatMessage } from '@/hooks/useChat'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <Box alignSelf={isUser ? 'flex-end' : 'flex-start'} maxW="85%">
      <Box
        bg={isUser ? 'fullcourt.buttonPrimaryBg' : 'gray.100'}
        color={isUser ? 'white' : 'gray.800'}
        px={3}
        py={2}
        borderRadius="lg"
        borderBottomRightRadius={isUser ? '2px' : 'lg'}
        borderBottomLeftRadius={isUser ? 'lg' : '2px'}
      >
        <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.5">
          {message.content}
        </Text>
      </Box>
    </Box>
  )
}
