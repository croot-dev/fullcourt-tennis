'use client'

import {
  Box,
  Container,
  Flex,
  Button,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import LogoutDialog from '@/components/common/LogoutDialog'
import { MEMBER_ROLE } from '@/constants'
import { useUserInfo } from '@/hooks/useAuth'

export default function Header() {
  const { data: user } = useUserInfo()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const isLoggedIn = useMemo(() => !!user, [user])
  const isAdmin = useMemo(() => user?.role_code === MEMBER_ROLE.ADMIN, [user])

  // 로그인 페이지 URL (현재 경로를 redirect_url로 포함)
  const signInUrl = useMemo(() => {
    // 이미 로그인 관련 페이지면 redirect_url 없이
    if (pathname.startsWith('/auth')) return '/auth/sign-in'
    return `/auth/sign-in?redirect_url=${encodeURIComponent(pathname)}`
  }, [pathname])

  const menuItems = [
    { label: '공지사항', href: '/notice' },
    ...(!!isLoggedIn
      ? [
          { label: '블라인드', href: '/blind' },
          {
            ...(isAdmin
              ? { label: '관리', href: '/management' }
              : { label: '회원', href: '/member' }),
          },
        ]
      : []),
  ]

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
    setIsOpen(false)
  }

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex h={16} align="center" justify="space-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="이테모"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  fontWeight="medium"
                  color="gray.700"
                >
                  {item.label}
                </Box>
              </Link>
            ))}
          </HStack>

          {/* Auth Buttons (Desktop) */}
          <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
            {isLoggedIn ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  {user?.nickname}님
                </Text>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutClick}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Link href={signInUrl}>
                <Button colorScheme="teal" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            aria-label="Open menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </IconButton>
        </Flex>

        {/* Mobile Navigation */}
        {isOpen && (
          <Box pb={4} display={{ md: 'none' }}>
            <Flex direction="column" gap={2}>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Box
                    px={3}
                    py={2}
                    rounded="md"
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    fontWeight="medium"
                    color="gray.700"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
              {isLoggedIn ? (
                <Box mt={2}>
                  <Text fontSize="sm" color="gray.600" mb={2} px={3}>
                    {user?.nickname}님
                  </Text>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    size="sm"
                    width="full"
                    onClick={handleLogoutClick}
                  >
                    로그아웃
                  </Button>
                </Box>
              ) : (
                <Box mt={2}>
                  <Link href={signInUrl}>
                    <Button
                      colorScheme="teal"
                      size="sm"
                      width="full"
                      onClick={() => setIsOpen(false)}
                    >
                      로그인
                    </Button>
                  </Link>
                </Box>
              )}
            </Flex>
          </Box>
        )}
      </Container>

      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </Box>
  )
}
