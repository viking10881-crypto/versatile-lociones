"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ease } from "@/components/motion/reveal"
import { whatsappLink } from "@/lib/store-config"

export type PlacedOrder = {
  saleNumber: string
  totalLabel: string
  receiptUrl: string
  lines: { name: string; size?: string; quantity: number }[]
  customer: { name: string; email: string; address: string; city: string }
}

function buildMessage(order: PlacedOrder) {
  return [
    "Hola Versatile, acabo de hacer un pedido y pagué por Nequi.",
    "",
    `*Pedido:* ${order.saleNumber}`,
    `*Cliente:* ${order.customer.name} (${order.customer.email})`,
    "*Productos:*",
    ...order.lines.map((line) => `• ${line.quantity} × ${line.name}${line.size ? ` (${line.size})` : ""}`),
    `*Total:* ${order.totalLabel}`,
    `*Envío:* ${order.customer.address}, ${order.customer.city}`,
    "",
    `*Comprobante:* ${order.receiptUrl}`,
  ].join("\n")
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 6.95 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.37-2.94c-.25-.44.25-.4.72-1.35.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.76 4.76 0 0 0 1 2.53 10.9 10.9 0 0 0 4.18 3.69c1.55.67 2.16.73 2.94.61.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

export function OrderSuccess({ order }: { order: PlacedOrder }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="mx-auto mt-12 flex max-w-xl flex-col items-center text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        className="grid size-16 place-items-center rounded-full bg-foreground text-background"
      >
        <Check className="size-8" />
      </motion.span>
      <h2 className="mt-6 font-serif text-4xl font-light sm:text-5xl">¡Pedido registrado!</h2>
      <p className="mt-3 text-muted-foreground">
        Tu pedido <span className="font-mono font-medium text-foreground">{order.saleNumber}</span> por{" "}
        <span className="font-medium text-foreground">{order.totalLabel}</span> quedó registrado y está pendiente de validar el pago.
      </p>

      <div className="mt-10 w-full rounded-lg border border-border bg-card p-6 text-left">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Último paso</p>
        <p className="mt-2 font-serif text-2xl">Envía tu comprobante por WhatsApp</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Se abrirá un mensaje con el resumen de tu pedido y el enlace al comprobante. Solo tienes que enviarlo para que
          validemos tu pago y coordinemos el envío.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 h-12 w-full rounded-full bg-[oklch(0.62_0.17_150)] text-base text-white hover:bg-[oklch(0.56_0.17_150)]"
        >
          <a href={whatsappLink(buildMessage(order))} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Enviar comprobante por WhatsApp
          </a>
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/cuenta">Ver mis pedidos</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full px-6">
          <Link href="/lociones">Seguir comprando</Link>
        </Button>
      </div>
    </motion.section>
  )
}
