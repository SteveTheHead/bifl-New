import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  // Server-side authentication check
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin-session')

  if (!sessionCookie) {
    redirect('/admin/signin')
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - session.loginTime
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in ms

    if (sessionAge > maxAge || session.role !== 'admin') {
      redirect('/admin/signin')
    }

    return <AdminDashboardClient session={session} />
  } catch (error) {
    redirect('/admin/signin')
  }
}
