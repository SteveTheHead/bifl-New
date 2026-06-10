import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  // Server-side authentication check (verifies the signed admin session)
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/signin')
  }

  return <AdminDashboardClient session={session} />
}
