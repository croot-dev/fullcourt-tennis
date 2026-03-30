import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth.server'
import { MEMBER_ROLE } from '@/constants'

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()
  if (!session) {
    redirect('/auth/sign-in')
  }

  if (
    session.roleCode !== MEMBER_ROLE.ADMIN &&
    session.roleCode !== MEMBER_ROLE.OPER
  ) {
    redirect('/')
  }

  return <>{children}</>
}
