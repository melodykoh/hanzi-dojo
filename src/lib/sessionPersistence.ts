import { supabase } from './supabase'

const SESSION_COOKIE_NAME = 'hanzi_dojo_session'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function writeSessionCookie(value: string, maxAge: number) {
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`
}

function readSessionCookie(): string | null {
  const cookie = document.cookie
    .split('; ')
    .find(entry => entry.startsWith(`${SESSION_COOKIE_NAME}=`))

  if (!cookie) return null
  const [, value] = cookie.split('=')
  return value || null
}

function clearSessionCookie() {
  writeSessionCookie('', 0)
}

export async function restoreSessionFromCookie() {
  if (typeof window === 'undefined') return

  const encoded = readSessionCookie()
  if (!encoded) return

  try {
    const payload = JSON.parse(atob(encoded)) as {
      access_token?: string
      refresh_token?: string
    }

    if (!payload.access_token || !payload.refresh_token) {
      clearSessionCookie()
      return
    }

    const { error } = await supabase.auth.setSession({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token
    })

    if (error) {
      console.error('[sessionPersistence] Failed to restore session:', error.message)
      clearSessionCookie()
    }
  } catch (err) {
    console.error('[sessionPersistence] Invalid session cookie:', err)
    clearSessionCookie()
  }
}

export function initSessionPersistence() {
  if (typeof window === 'undefined') return

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.access_token && session?.refresh_token) {
      const encoded = btoa(
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
      )

      writeSessionCookie(encoded, COOKIE_MAX_AGE_SECONDS)
    } else {
      clearSessionCookie()
    }
  })
}
