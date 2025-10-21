import { NextRequest } from 'next/server'

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
  loginTime: number
}

export function getAdminSession(request: NextRequest): AdminSession | null {
  try {
    const sessionCookie = request.cookies.get('admin-session')
      cookieExists: !!sessionCookie,
      cookieValue: sessionCookie?.value?.substring(0, 50) + '...',
      path: request.nextUrl.pathname
    })

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as AdminSession

    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - session.loginTime
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in ms

    if (sessionAge > maxAge) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error parsing admin session:', error)
    return null
  }
}

export function isAdminRequest(request: NextRequest): boolean {
  const session = getAdminSession(request)
  return session !== null && session.role === 'admin'
}

export function requireAdminAuth(request: NextRequest): AdminSession {
  const session = getAdminSession(request)
  if (!session) {
    throw new Error('Admin authentication required')
  }
  return session
}