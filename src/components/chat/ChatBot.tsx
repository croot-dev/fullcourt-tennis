'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Input,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react'
import { LuMessageCircle, LuX, LuSend, LuTrash2 } from 'react-icons/lu'
import { useChat } from '@/hooks/useChat'
import { useUserInfo } from '@/hooks/useAuth'
import ChatMessageBubble from './ChatMessageBubble'

export default function ChatBot() {
  const { data: user } = useUserInfo()
  const { messages, isLoading, toolStatus, sendMessage, clearMessages } =
    useChat()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, toolStatus])

  if (!user) return null

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <IconButton
          aria-label="AI 챗봇 열기"
          position="fixed"
          bottom={{ base: '80px', md: '24px' }}
          right="24px"
          zIndex={20}
          rounded="full"
          size="lg"
          colorPalette="teal"
          shadow="lg"
          onClick={() => setIsOpen(true)}
        >
          <LuMessageCircle size={24} />
        </IconButton>
      )}

      {isOpen && (
        <Box
          position="fixed"
          bottom={{ base: '80px', md: '24px' }}
          right={{ base: '0', md: '24px' }}
          width={{ base: '100%', md: '400px' }}
          height={{ base: 'calc(100vh - 144px)', md: '500px' }}
          bg="white"
          borderRadius={{ base: '0', md: 'xl' }}
          shadow="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          zIndex={20}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="fullcourt.buttonPrimaryBg"
            color="white"
            borderTopRadius={{ base: '0', md: 'xl' }}
          >
            <HStack gap={2}>
              <LuMessageCircle size={20} />
              <Text fontWeight="bold" fontSize="sm">
                풀코트 AI 어시스턴트
              </Text>
            </HStack>
            <HStack gap={1}>
              <IconButton
                aria-label="대화 초기화"
                variant="ghost"
                color="white"
                size="sm"
                onClick={clearMessages}
                _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
              >
                <LuTrash2 size={16} />
              </IconButton>
              <IconButton
                aria-label="챗봇 닫기"
                variant="ghost"
                color="white"
                size="sm"
                onClick={() => setIsOpen(false)}
                _hover={{ bg: 'fullcourt.buttonPrimaryHover' }}
              >
                <LuX size={20} />
              </IconButton>
            </HStack>
          </Flex>

          {/* Messages */}
          <VStack
            flex={1}
            overflowY="auto"
            px={4}
            py={3}
            gap={3}
            align="stretch"
          >
            {messages.length === 0 && (
              <Box textAlign="center" py={8} color="gray.400">
                <Text fontSize="sm">안녕하세요! 일정 관리를 도와드릴게요.</Text>
                <Text fontSize="xs" mt={1}>
                  예: &quot;3월 15일 오후 2시에 고양체육관 일정 만들어줘&quot;
                </Text>
              </Box>
            )}
            {messages.map((msg, idx) => (
              <ChatMessageBubble key={idx} message={msg} />
            ))}
            {toolStatus && (
              <HStack gap={2} px={3} py={2} color="gray.500">
                <Spinner size="xs" />
                <Text fontSize="xs">{toolStatus}</Text>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Input */}
          <Flex px={3} py={3} borderTop="1px" borderColor="gray.100" gap={2}>
            <Input
              placeholder="메시지를 입력하세요..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              size="sm"
              flex={1}
            />
            <IconButton
              aria-label="전송"
              colorPalette="teal"
              size="sm"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? <Spinner size="xs" /> : <LuSend size={16} />}
            </IconButton>
          </Flex>
        </Box>
      )}
    </>
  )
}
