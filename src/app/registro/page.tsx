import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Crear cuenta — Versatille" }

export default async function RegistroPage({ searchParams }: PageProps<"/registro">) {
  const params = await searchParams
  const next =
    typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/cuenta"
  if (await getSessionUser()) redirect(next)

  return (
    <AuthShell
      eyebrow="Bienvenida"
      title="Crear cuenta"
      description="Registra tus datos una sola vez: los usamos para el envío y para que sigas el estado de tus pedidos."
    >
      <RegisterForm next={next} />
    </AuthShell>
  )
}
