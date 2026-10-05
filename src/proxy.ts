import { NextResponse, type NextRequest } from "next/server"

// Protege las páginas que requieren sesión y renueva el token de acceso de Delasoft
// antes de renderizar (las páginas no pueden escribir cookies por sí mismas).

const ACCESS_COOKIE = "vs_access"
const REFRESH_COOKIE = "vs_refresh"
const ACCESS_MAX_AGE = 14 * 60

async function refresh(refreshToken: string) {
  const base = (process.env.DELASOFT_PUBLIC_API_URL || "https://delasoft-back.onrender.com/public-api/v1").replace(/\/$/, "")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": process.env.DELASOFT_PUBLIC_API_KEY ?? "",
  }
  if (process.env.DELASOFT_STORE_ORIGIN) headers.Origin = process.env.DELASOFT_STORE_ORIGIN
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(45_000),
    })
    const body = await res.json().catch(() => null)
    return res.ok ? (body?.data?.accessToken as string | undefined) ?? null : null
  } catch {
    return null
  }
}

function toLogin(request: NextRequest) {
  const url = new URL("/ingresar", request.url)
  url.searchParams.set("next", request.nextUrl.pathname)
  const response = NextResponse.redirect(url)
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)
  response.cookies.delete("vs_user")
  return response
}

export async function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE)) return NextResponse.next()

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return toLogin(request)

  const accessToken = await refresh(refreshToken)
  if (!accessToken) return toLogin(request)

  // La página de esta misma petición ya recibe el token nuevo...
  request.cookies.set(ACCESS_COOKIE, accessToken)
  const response = NextResponse.next({ request: { headers: request.headers } })
  // ...y el navegador lo guarda para las siguientes.
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  })
  return response
}

export const config = {
  matcher: ["/checkout", "/cuenta/:path*"],
}
