import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Ingresar — Versatile" }

function safeNext(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/cuenta"
}

export default async function IngresarPage({ searchParams }: PageProps<"/ingresar">) {
  const params = await searchParams
  const next = safeNext(params.next)
  if (await getSessionUser()) redirect(next)

  return (
    <AuthShell
      eyebrow="Tu cuenta"
      title="Ingresar"
      description={next === "/checkout" ? "Inicia sesión para finalizar tu compra." : "Consulta tus pedidos y compra más rápido."}
    >
      <LoginForm
        next={next}
        email={typeof params.email === "string" ? params.email : undefined}
        verified={params.verificado === "1"}
      />
    </AuthShell>
  )
}
