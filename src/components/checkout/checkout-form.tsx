"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Check, CircleAlert, Copy, ImageUp, Loader2, ShoppingBag, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Field, useEditableErrors } from "@/components/auth/form-parts"
import { ProductVisual } from "@/components/site/product-visual"
import { ease } from "@/components/motion/reveal"
import { formatPrice } from "@/lib/catalog/format"
import { useCart } from "@/lib/cart/cart-context"
import { placeNequiOrder } from "@/lib/checkout/actions"
import { compressImage } from "@/lib/checkout/compress-image"
import { NEQUI_NUMBER, formatPhone } from "@/lib/store-config"
import { cn } from "@/lib/utils"
import { OrderSuccess, type PlacedOrder } from "./order-success"

type Customer = { name: string; email: string; phone: string; city: string; address: string }

export function CheckoutForm({ customer }: { customer: Customer }) {
  const router = useRouter()
  const { items, subtotalLabel, clear } = useCart()
  const [method, setMethod] = useState("nequi")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { errors: fieldErrors, onInput } = useEditableErrors(submittedErrors)
  const [placed, setPlaced] = useState<PlacedOrder | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setPreparing(true)
    const compressed = await compressImage(file)
    setPreparing(false)
    setReceipt(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  function removeReceipt() {
    setReceipt(null)
    setPreview(null)
    if (fileInput.current) fileInput.current.value = ""
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(NEQUI_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set("items", JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity }))))
    if (receipt) formData.set("receipt", receipt)
    else formData.delete("receipt")
    setError(null)

    // Se guarda una copia del carrito para el mensaje de WhatsApp antes de vaciarlo.
    const lines = items.map((item) => ({ name: item.name, size: item.size, quantity: item.quantity }))

    startTransition(async () => {
      const result = await placeNequiOrder(formData)
      if (!result.ok) {
        if (result.needsLogin) {
          router.push("/ingresar?next=/checkout")
          return
        }
        setError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      setPlaced({
        saleNumber: result.saleNumber,
        totalLabel: formatPrice(result.total, items[0]?.currency ?? "COP"),
        receiptUrl: result.receiptUrl,
        lines,
        customer: {
          name: customer.name,
          email: customer.email,
          address: String(formData.get("address") ?? ""),
          city: String(formData.get("city") ?? ""),
        },
      })
      clear()
      window.scrollTo({ top: 0 })
    })
  }

  if (placed) return <OrderSuccess order={placed} />

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
        <p className="font-serif text-3xl">Tu carrito está vacío</p>
        <p className="max-w-sm text-muted-foreground">Agrega tus fragancias favoritas para finalizar la compra.</p>
        <Button asChild className="mt-2 rounded-full px-6">
          <Link href="/lociones">Ver lociones</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} onInput={onInput} noValidate className="mt-12 grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
      <div className="flex flex-col gap-12">
        {/* 1. Envío */}
        <section aria-labelledby="envio" className="flex flex-col gap-5">
          <StepTitle id="envio" step={1} title="Datos de envío" />
          <p className="text-sm text-muted-foreground">
            Comprando como <span className="font-medium text-foreground">{customer.name}</span> · {customer.email}
          </p>
          <Field
            label="Celular de contacto"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            defaultValue={customer.phone}
            error={fieldErrors.phone}
            required
          />
          <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
            <Field
              label="Ciudad"
              name="city"
              autoComplete="address-level2"
              defaultValue={customer.city}
              error={fieldErrors.city}
              required
            />
            <Field
              label="Dirección"
              name="address"
              autoComplete="street-address"
              placeholder="Calle, número, barrio, apto."
              defaultValue={customer.address}
              error={fieldErrors.address}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas para la entrega (opcional)</Label>
            <Textarea id="notes" name="notes" maxLength={300} rows={3} placeholder="Ej.: dejar en portería" />
          </div>
        </section>

        {/* 2. Pago */}
        <section aria-labelledby="pago" className="flex flex-col gap-5">
          <StepTitle id="pago" step={2} title="Método de pago" />
          <RadioGroup value={method} onValueChange={setMethod} className="grid gap-3 sm:grid-cols-2">
            <PaymentOption value="nequi" title="Nequi" description="Transfiere y sube el comprobante" selected={method === "nequi"} />
            <PaymentOption
              value="wompi"
              title="Tarjeta, PSE y más"
              description="Pago en línea con Wompi"
              selected={false}
              disabled
              badge="Próximamente"
            />
          </RadioGroup>

          <AnimatePresence initial={false}>
            {method === "nequi" ? (
              <motion.div
                key="nequi"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-5 sm:p-6">
                  <ol className="flex flex-col gap-5 text-sm">
                    <li className="flex gap-4">
                      <StepDot n={1} />
                      <div className="flex flex-1 flex-col gap-3">
                        <p>
                          Desde tu app Nequi envía <span className="font-medium">{subtotalLabel}</span> a este número:
                        </p>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-muted px-4 py-3">
                          <span className="font-mono text-xl tracking-wider tabular-nums">{formatPhone(NEQUI_NUMBER)}</span>
                          <Button type="button" variant="outline" size="sm" onClick={copyNumber} className="rounded-full">
                            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                            {copied ? "Copiado" : "Copiar"}
                          </Button>
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <StepDot n={2} />
                      <div className="flex flex-1 flex-col gap-3">
                        <p>Toma una captura de pantalla del comprobante y súbela aquí:</p>
                        <input
                          ref={fileInput}
                          id="receipt"
                          name="receipt"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          aria-describedby={fieldErrors.receipt ? "receipt-error" : undefined}
                          onChange={(event) => handleFile(event.target.files?.[0])}
                        />
                        {preview ? (
                          <div className="flex items-center gap-4 rounded-md border border-border p-3">
                            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-muted">
                              <Image src={preview} alt="Comprobante seleccionado" fill unoptimized className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{receipt?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {receipt ? `${Math.max(1, Math.round(receipt.size / 1024))} KB` : null}
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={removeReceipt} aria-label="Quitar comprobante">
                              <X />
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor="receipt"
                            className={cn(
                              "flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors hover:border-foreground/40 hover:bg-muted/50 focus-within:ring-3 focus-within:ring-ring/50",
                              fieldErrors.receipt ? "border-destructive" : "border-border",
                            )}
                          >
                            {preparing ? (
                              <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            ) : (
                              <ImageUp className="size-6 text-muted-foreground" strokeWidth={1.5} />
                            )}
                            <span className="font-medium">{preparing ? "Preparando imagen…" : "Subir comprobante"}</span>
                            <span className="text-xs text-muted-foreground">JPG, PNG o WebP</span>
                          </label>
                        )}
                        {fieldErrors.receipt ? (
                          <p id="receipt-error" className="text-sm text-destructive">
                            {fieldErrors.receipt}
                          </p>
                        ) : null}
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <StepDot n={3} />
                      <p className="flex-1">
                        Confirma el pedido. Después te pediremos enviar el comprobante por WhatsApp para validar tu pago.
                      </p>
                    </li>
                  </ol>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        {error ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Resumen */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <h2 className="font-serif text-2xl">Tu pedido</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <div
                  className="relative size-16 shrink-0 overflow-hidden rounded-md p-1.5"
                  style={{ background: `radial-gradient(120% 80% at 50% 100%, oklch(0.9 0.05 ${item.hue}), oklch(0.95 0.015 85))` }}
                >
                  <div className="relative h-full w-full">
                    <ProductVisual product={item} sizes="64px" />
                  </div>
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-foreground text-[10px] text-background tabular-nums">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug">{item.name}</p>
                  {item.size ? <p className="text-xs text-muted-foreground">{item.size}</p> : null}
                </div>
                <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity, item.currency)}</p>
              </li>
            ))}
          </ul>
          <Separator className="my-5" />
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-medium tabular-nums">{subtotalLabel}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">El envío se coordina por WhatsApp al validar tu pago.</p>
          <Button
            type="submit"
            size="lg"
            className="mt-6 h-12 w-full rounded-full text-base"
            disabled={pending || preparing || method !== "nequi"}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" /> Registrando pedido…
              </>
            ) : (
              "Confirmar pedido"
            )}
          </Button>
        </div>
      </aside>
    </form>
  )
}

function StepTitle({ id, step, title }: { id: string; step: number; title: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-serif text-3xl font-light">
      <span className="font-mono text-xs text-muted-foreground">0{step}</span> {title}
    </h2>
  )
}

function StepDot({ n }: { n: number }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
      {n}
    </span>
  )
}

function PaymentOption({
  value,
  title,
  description,
  selected,
  disabled,
  badge,
}: {
  value: string
  title: string
  description: string
  selected: boolean
  disabled?: boolean
  badge?: string
}) {
  return (
    <Label
      htmlFor={`pay-${value}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-colors",
        selected ? "border-foreground bg-card" : "border-border",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-foreground/40",
      )}
    >
      <RadioGroupItem id={`pay-${value}`} value={value} disabled={disabled} className="mt-0.5" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 font-medium">
          {title}
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </span>
        <span className="text-sm font-normal text-muted-foreground">{description}</span>
      </span>
    </Label>
  )
}
