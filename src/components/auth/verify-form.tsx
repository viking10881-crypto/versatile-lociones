"use client"

import { useActionState, useState } from "react"
import { CircleAlert, CircleCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { resendCodeAction, verifyAction, type FormState } from "@/lib/auth/actions"
import { SubmitButton } from "./form-parts"

export function VerifyForm({ email, next }: { email: string; next: string }) {
  const [state, action] = useActionState<FormState, FormData>(verifyAction, {})
  const [resendState, resend, resending] = useActionState<FormState, FormData>(resendCodeAction, {})
  const [code, setCode] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-6">
        {state.error ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="code" value={code} />
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          inputMode="numeric"
          pattern="^[0-9]*$"
          autoFocus
          aria-label="Código de verificación"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <SubmitButton pendingText="Verificando…">Verificar correo</SubmitButton>
      </form>

      <form action={resend} className="flex flex-col items-start gap-2">
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-muted-foreground">¿No te llegó? Revisa también la carpeta de spam.</p>
        <Button type="submit" variant="link" className="h-auto p-0" disabled={resending}>
          {resending ? "Enviando…" : "Enviar un código nuevo"}
        </Button>
        {resendState.message ? (
          <p className="flex items-center gap-2 text-sm">
            <CircleCheck className="size-4" /> {resendState.message}
          </p>
        ) : null}
        {resendState.error ? <p className="text-sm text-destructive">{resendState.error}</p> : null}
      </form>
    </div>
  )
}
