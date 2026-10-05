"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldProps = React.ComponentProps<typeof Input> & {
  label: string
  name: string
  error?: string
  hint?: string
}

export function Field({ label, name, error, hint, className, type, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("h-11 px-4", isPassword && "pr-11", className)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Errores por campo que se ocultan en cuanto la persona corrige ese campo. Cada nuevo envío
 * (un objeto `errors` distinto) los vuelve a mostrar todos.
 */
export function useEditableErrors(errors: Record<string, string> | undefined) {
  const [state, setState] = useState({ source: errors, edited: new Set<string>() })
  if (state.source !== errors) setState({ source: errors, edited: new Set() })
  const visible: Record<string, string> = {}
  for (const [key, message] of Object.entries(errors ?? {})) {
    if (!state.edited.has(key)) visible[key] = message
  }
  function onInput(event: React.FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name
    if (name && errors?.[name] && !state.edited.has(name)) {
      setState((s) => ({ ...s, edited: new Set(s.edited).add(name) }))
    }
  }
  return { errors: visible, onInput }
}

export function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" data-icon="inline-start" /> {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
