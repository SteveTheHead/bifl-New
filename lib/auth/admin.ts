import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Admin session = a SIGNED token, not plain JSON.
 *
 * Format: `<base64url(JSON payload)>.<hmac-sha256 hex>` signed with ADMIN_SECRET_KEY.
 * The signature is verified on every read, so the cookie can no longer be forged
 * by hand-crafting `{"role":"admin"}`. Everything here is Edge-safe (Web Crypto,
 * btoa/atob, TextEncoder) because the middleware imports it.
 */

export const ADMIN_SESSION_COOKIE = 'admin-session'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
  loginTime: number
}

function getSecret(): string | null {
  return process.env.ADMIN_SECRET_KEY || process.env.BETTER_AUTH_SECRET || null
}

// --- Edge-safe base64url + HMAC (Web Crypto) ---

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecodeToBytes(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const bytes = new Uint8Array(sig)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

/** Sign an admin session into a tamper-evident cookie value. */
export async function signAdminSession(session: AdminSession): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_SECRET_KEY is not set; cannot sign admin session')
  const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify(session)))
  const sig = await hmacHex(payload, secret)
  return `${payload}.${sig}`
}

/** Verify a signed admin cookie value. Returns the session only if the signature, role, and age all check out. Fails closed. */
export async function verifyAdminToken(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null
  const secret = getSecret()
  if (!secret) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  let expected: string
  try {
    expected = await hmacHex(payload, secret)
  } catch {
    return null
  }
  if (!timingSafeEqual(sig, expected)) return null

  try {
    const session = JSON.parse(new TextDecoder().decode(b64urlDecodeToBytes(payload))) as AdminSession
    if (session.role !== 'admin') return null
    if (typeof session.loginTime !== 'number' || Date.now() - session.loginTime > MAX_AGE_MS) return null
    return session
  } catch {
    return null
  }
}

// --- Middleware (Edge): verify from a NextRequest ---

export async function getAdminSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  return verifyAdminToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  return (await getAdminSessionFromRequest(request)) !== null
}

// --- Route handlers / server components: verify from next/headers cookies() ---
// next/headers is imported dynamically so this module stays usable in the Edge middleware.

export async function getAdminSession(): Promise<AdminSession | null> {
  const { cookies } = await import('next/headers')
  const store = await cookies()
  return verifyAdminToken(store.get(ADMIN_SESSION_COOKIE)?.value)
}

/**
 * Guard for route handlers. Returns a 401 NextResponse if the caller is not a
 * valid admin, or null if they are. Usage:
 *   const unauthorized = await requireAdmin()
 *   if (unauthorized) return unauthorized
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}
