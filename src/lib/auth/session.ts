import "server-only"

import { cookies } from "next/headers"
import { delasoftApi } from "@/lib/delasoft/api"

// Sesión del cliente en cookies httpOnly: el navegador nunca ve los tokens de Delasoft.
export const ACCESS_COOKIE = "vs_access"
export const REFRESH_COOKIE = "vs_refresh"
export const USER_COOKIE = "vs_user"

// El token de acceso de Delasoft dura 15 min; la cookie vence un poco antes para refrescarlo a tiempo.
export const ACCESS_MAX_AGE = 14 * 60
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

export type SessionUser = { id: number; name: string; email: string }

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function setSession(tokens: { token: string; refreshToken: string }, user: SessionUser) {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, tokens.token, { ...cookieOptions, maxAge: ACCESS_MAX_AGE })
  jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE })
  jar.set(USER_COOKIE, JSON.stringify(user), { ...cookieOptions, maxAge: REFRESH_MAX_AGE })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
  jar.delete(USER_COOKIE)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies()
  if (!jar.has(REFRESH_COOKIE)) return null
  try {
    return JSON.parse(jar.get(USER_COOKIE)?.value ?? "null") as SessionUser | null
  } catch {
    return null
  }
}

/** Pide un token de acceso nuevo a Delasoft con el token de refresco. */
export async function refreshAccessToken(refreshToken: string) {
  const result = await delasoftApi<{ accessToken: string }>("/auth/refresh", {
    method: "POST",
    json: { refreshToken },
  })
  return result.ok ? result.data.accessToken : null
}

/**
 * Token de acceso vigente. En Server Functions renueva y guarda la cookie si venció;
 * en páginas, `proxy.ts` ya lo renovó antes de renderizar.
 */
export async function getAccessToken({ canRefresh = false } = {}) {
  const jar = await cookies()
  const access = jar.get(ACCESS_COOKIE)?.value
  if (access) return access
  const refresh = jar.get(REFRESH_COOKIE)?.value
  if (!refresh || !canRefresh) return null
  const renewed = await refreshAccessToken(refresh)
  if (renewed) jar.set(ACCESS_COOKIE, renewed, { ...cookieOptions, maxAge: ACCESS_MAX_AGE })
  return renewed
}
