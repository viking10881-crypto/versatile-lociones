import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getAccessToken, getSessionUser } from "@/lib/auth/session"
import { delasoftApi } from "@/lib/delasoft/api"

export const metadata: Metadata = { title: "Finalizar compra — Versatille" }

type Profile = { name: string; email: string; phone: string | null; city: string | null; address: string | null }

export default async function CheckoutPage() {
  // proxy.ts ya garantizó una sesión vigente para esta ruta.
  const [token, user] = await Promise.all([getAccessToken(), getSessionUser()])
  if (!token || !user) redirect("/ingresar?next=/checkout")

  const profile = await delasoftApi<Profile>("/auth/profile", { token })

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-36">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Checkout</p>
        <h1 className="mt-3 font-serif text-5xl leading-none font-light sm:text-6xl">Finalizar compra</h1>
        <CheckoutForm
          customer={{
            name: user.name,
            email: user.email,
            phone: profile.ok ? (profile.data.phone ?? "") : "",
            city: profile.ok ? (profile.data.city ?? "") : "",
            address: profile.ok ? (profile.data.address ?? "") : "",
          }}
        />
      </div>
    </main>
  )
}
