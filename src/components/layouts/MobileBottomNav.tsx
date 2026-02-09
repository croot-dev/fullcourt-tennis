'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LuLayoutDashboard, LuCalendar, LuBookPlus } from 'react-icons/lu'
import { useUserInfo } from '@/hooks/useAuth'

const navItems = [
  { label: '대시보드', href: '/dashboard', icon: LuLayoutDashboard },
  { label: '일정', href: '/schedule', icon: LuCalendar },
  { label: '예약', href: '/reservation', icon: LuBookPlus },
  // { label: '회원목록', href: '/member', icon: LuUsers },
]

export default function MobileBottomNav() {
  const { data: user } = useUserInfo()
  const pathname = usePathname()

  if (!user) return null

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <Box h={16} />

      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTopWidth="1px"
        borderColor="gray.200"
        zIndex={10}
        pb="env(safe-area-inset-bottom)"
      >
        <Flex justify="space-around" align="center" h={16}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  px={4}
                  py={2}
                  color={isActive ? 'teal.500' : 'gray.500'}
                  _hover={{ color: 'teal.500' }}
                >
                  <Icon size={24} />
                  <Text
                    fontSize="xs"
                    mt={1}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {item.label}
                  </Text>
                </Flex>
              </Link>
            )
          })}
        </Flex>
      </Box>
    </>
  )
}
