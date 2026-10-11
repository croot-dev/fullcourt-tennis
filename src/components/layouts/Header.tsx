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
  const { data: user, isLoading: isAuthLoading } = useUserInfo()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const isLoggedIn = useMemo(() => !!user, [user])
  const isOperator = useMemo(
    () =>
      user?.role_code === MEMBER_ROLE.ADMIN ||
      user?.role_code === MEMBER_ROLE.OPER,
    [user],
  )

  // 로그인 페이지 URL (현재 경로를 redirect_url로 포함)
  const signInUrl = useMemo(() => {
    // 이미 로그인 관련 페이지면 redirect_url 없이
    if (pathname.startsWith('/auth')) return '/auth/sign-in'
    return `/auth/sign-in?redirect_url=${encodeURIComponent(pathname)}`
  }, [pathname])

  const menuItems = [
    { label: '공지사항', href: '/notice' },
    { label: '커뮤니티', href: '/community' },
    { label: '블라인드', href: '/blind' },
    {
      ...(isOperator
        ? { label: '관리', href: '/management' }
        : { label: '회원', href: '/member' }),
    },
  ]

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
    setIsOpen(false)
  }

  return (
    <Box
      as="header"
      bg="fullcourt.cardBg"
      borderBottomWidth="1px"
      borderColor="fullcourt.border"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex h={16} align="center" justify="space-between">
          {/* Logo */}
          <Link href="/" aria-label="풀코트 홈">
            <HStack gap={3}>
              <Image
                src="/logo.png"
                alt="풀코트 테니스 클럽"
                width={48}
                height={48}
                style={{ objectFit: 'contain' }}
              />
              <Box>
                <Text fontSize="sm" fontWeight="bold" letterSpacing="0.12em">
                  FULL COURT
                </Text>
                <Text
                  fontSize="10px"
                  color="fullcourt.pointAmber"
                  letterSpacing="0.16em"
                >
                  TENNIS CLUB
                </Text>
              </Box>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: 'fullcourt.sectionBg' }}
                  cursor="pointer"
                  fontWeight="medium"
                  color="fullcourt.text"
                >
                  {item.label}
                </Box>
              </Link>
            ))}
          </HStack>

          {/* Auth Buttons (Desktop) */}
          <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
            {isAuthLoading ? null : isLoggedIn ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  {user?.nickname}님
                </Text>
                <Button
                  colorPalette="blue"
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutClick}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Link href={signInUrl}>
                <Button colorPalette="blue" size="sm">
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
            aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isOpen}
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
                    _hover={{ bg: 'fullcourt.sectionBg' }}
                    cursor="pointer"
                    fontWeight="medium"
                    color="fullcourt.text"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
              {isAuthLoading ? null : isLoggedIn ? (
                <Box mt={2}>
                  <Text fontSize="sm" color="gray.600" mb={2} px={3}>
                    {user?.nickname}님
                  </Text>
                  <Button
                    colorPalette="blue"
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
                      colorPalette="blue"
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
