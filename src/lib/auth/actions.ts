"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { delasoftApi } from "@/lib/delasoft/api"
import { REFRESH_COOKIE, clearSession, getAccessToken, setSession } from "./session"

export type FormState = {
  error?: string
  fieldErrors?: Record<string, string>
  message?: string
  values?: Record<string, string>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Misma regla que exige Delasoft al registrar.
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

/** Solo rutas internas, para no redirigir a otros sitios. */
function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/cuenta"
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(text(formData, "next"))
  const values = { email }

  if (!EMAIL.test(email) || !password) {
    return { error: "Escribe tu correo y contraseña.", values }
  }

  const result = await delasoftApi<never>("/auth/login", { method: "POST", json: { email, password } })
  if (!result.ok) {
    if (result.code === "EMAIL_NOT_VERIFIED" || /verific/i.test(result.message)) {
      redirect(`/verificar?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`)
    }
    return { error: result.message, values }
  }

  const body = result.body as { token: string; refreshToken: string; user: { id: number; name: string; email: string } }
  await setSession(
    { token: body.token, refreshToken: body.refreshToken },
    { id: body.user.id, name: body.user.name, email: body.user.email },
  )
  redirect(next)
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: text(formData, "name"),
    cedula: text(formData, "cedula").replace(/\D/g, ""),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone").replace(/\D/g, ""),
  }
  const password = String(formData.get("password") ?? "")
  const next = safeNext(text(formData, "next"))

  const fieldErrors: Record<string, string> = {}
  if (values.name.length < 3) fieldErrors.name = "Escribe tu nombre completo."
  if (values.cedula.length < 5) fieldErrors.cedula = "Escribe tu número de cédula."
  if (!EMAIL.test(values.email)) fieldErrors.email = "Escribe un correo válido."
  if (values.phone.length !== 10) fieldErrors.phone = "Escribe un celular de 10 dígitos."
  if (!STRONG_PASSWORD.test(password)) {
    fieldErrors.password = "Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo."
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values }

  const result = await delasoftApi("/auth/register", { method: "POST", json: { ...values, password } })
  if (!result.ok) return { error: result.message, values }

  redirect(`/verificar?email=${encodeURIComponent(values.email)}&next=${encodeURIComponent(next)}&nuevo=1`)
}

export async function verifyAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase()
  const code = text(formData, "code")
  const next = safeNext(text(formData, "next"))
  if (!/^\d{6}$/.test(code)) return { error: "Escribe los 6 dígitos del código." }

  const result = await delasoftApi("/auth/verify", { method: "POST", json: { email, code } })
  if (!result.ok && result.code !== "ALREADY_VERIFIED") return { error: result.message }

  redirect(`/ingresar?email=${encodeURIComponent(email)}&verificado=1&next=${encodeURIComponent(next)}`)
}

export async function resendCodeAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase()
  const result = await delasoftApi("/auth/resend-code", { method: "POST", json: { email } })
  return result.ok ? { message: "Te enviamos un código nuevo." } : { error: result.message }
}

export async function logoutAction() {
  const token = await getAccessToken({ canRefresh: true })
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value
  // Revoca el token de refresco en Delasoft para que la sesión no pueda reutilizarse.
  if (token) await delasoftApi("/auth/logout", { method: "POST", token, json: { refreshToken } })
  await clearSession()
  redirect("/")
}
