"use client"

import { useActionState } from "react"
import Link from "next/link"
import { CircleAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerAction, type FormState } from "@/lib/auth/actions"
import { Field, SubmitButton, useEditableErrors } from "./form-parts"

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {})
  const { errors, onInput } = useEditableErrors(state.fieldErrors)
  const values = state.values ?? {}

  return (
    <form action={action} onInput={onInput} className="flex flex-col gap-5" noValidate>
      {state.error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="next" value={next} />
      <Field label="Nombre completo" name="name" autoComplete="name" required defaultValue={values.name} error={errors.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Cédula"
          name="cedula"
          inputMode="numeric"
          required
          defaultValue={values.cedula}
          error={errors.cedula}
        />
        <Field
          label="Celular"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="300 123 4567"
          required
          defaultValue={values.phone}
          error={errors.phone}
        />
      </div>
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values.email}
        error={errors.email}
        hint="Te enviaremos un código para verificarlo."
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.password}
        hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo."
      />
      <SubmitButton pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/ingresar?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
          Ingresar
        </Link>
      </p>
    </form>
  )
}
