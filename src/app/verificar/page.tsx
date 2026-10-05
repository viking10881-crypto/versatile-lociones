import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { VerifyForm } from "@/components/auth/verify-form"

export const metadata: Metadata = { title: "Verificar correo — Versatile" }

export default async function VerificarPage({ searchParams }: PageProps<"/verificar">) {
  const params = await searchParams
  const email = typeof params.email === "string" ? params.email : ""
  if (!email) redirect("/registro")
  const next =
    typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/cuenta"

  return (
    <AuthShell
      eyebrow={params.nuevo === "1" ? "Un paso más" : "Verifica tu correo"}
      title="Revisa tu correo"
      description={
        <>
          Enviamos un código de 6 dígitos a <span className="font-medium text-foreground">{email}</span>.
        </>
      }
    >
      <VerifyForm email={email} next={next} />
    </AuthShell>
  )
}
