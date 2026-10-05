import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/lib/auth/actions"
import { getAccessToken, getSessionUser } from "@/lib/auth/session"
import { formatPrice } from "@/lib/catalog/format"
import { delasoftApi } from "@/lib/delasoft/api"
import { whatsappLink } from "@/lib/store-config"

export const metadata: Metadata = { title: "Mi cuenta — Versatile" }

type Order = {
  id: number
  order_code: string
  created_at: string
  total: string
  payment_status: "pending" | "partial" | "paid" | "cancelled" | string
  payment_method: string
  shipping_city: string | null
  shipping_notes: string | null
}

const statusLabels: Record<string, { label: string; tone: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Validando pago", tone: "secondary" },
  partial: { label: "Pago parcial", tone: "secondary" },
  paid: { label: "Pagado", tone: "default" },
  cancelled: { label: "Cancelado", tone: "destructive" },
}

function receiptFrom(notes: string | null) {
  return notes?.match(/Comprobante:\s*(\S+)/)?.[1]
}

export default async function CuentaPage() {
  const [token, user] = await Promise.all([getAccessToken(), getSessionUser()])
  if (!token || !user) redirect("/ingresar?next=/cuenta")

  const history = await delasoftApi<Order[]>("/sales/user/history", { token })
  const orders = history.ok ? history.data : []

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-8 sm:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Mi cuenta</p>
            <h1 className="mt-3 font-serif text-5xl leading-none font-light">Hola, {user.name.split(" ")[0]}</h1>
            <p className="mt-3 text-muted-foreground">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="rounded-full">
              <LogOut data-icon="inline-start" /> Cerrar sesión
            </Button>
          </form>
        </div>

        <section aria-labelledby="pedidos" className="mt-16">
          <h2 id="pedidos" className="font-serif text-3xl font-light">
            Mis pedidos
          </h2>
          {!history.ok ? (
            <p className="mt-6 text-muted-foreground">No pudimos cargar tus pedidos. Intenta de nuevo en un momento.</p>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
              <Package className="size-10 text-muted-foreground" strokeWidth={1} />
              <p className="text-muted-foreground">Aún no has hecho pedidos.</p>
              <Button asChild className="rounded-full px-6">
                <Link href="/lociones">Ver lociones</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
              {orders.map((order) => {
                const status = statusLabels[order.payment_status] ?? { label: order.payment_status, tone: "outline" as const }
                const receipt = receiptFrom(order.shipping_notes)
                const total = formatPrice(Number(order.total))
                return (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-mono text-sm">{order.order_code}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-CO", { dateStyle: "long" })}
                        {order.shipping_city ? ` · ${order.shipping_city}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={status.tone}>{status.label}</Badge>
                      <span className="font-medium tabular-nums">{total}</span>
                      {order.payment_status === "pending" && receipt ? (
                        <Button asChild size="sm" variant="ghost" className="rounded-full">
                          <a
                            href={whatsappLink(
                              `Hola Versatile, envío el comprobante de mi pedido ${order.order_code} por ${total}: ${receipt}`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Reenviar comprobante
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
