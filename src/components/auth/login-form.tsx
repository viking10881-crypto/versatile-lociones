"use client"

import { useActionState } from "react"
import Link from "next/link"
import { CircleCheck, CircleAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction, type FormState } from "@/lib/auth/actions"
import { Field, SubmitButton } from "./form-parts"

export function LoginForm({ next, email, verified }: { next: string; email?: string; verified: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {})

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {verified && !state.error ? (
        <Alert>
          <CircleCheck />
          <AlertDescription>Tu correo quedó verificado. Ingresa para continuar.</AlertDescription>
        </Alert>
      ) : null}
      {state.error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="next" value={next} />
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email ?? email}
      />
      <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
      <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href={`/registro?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}
