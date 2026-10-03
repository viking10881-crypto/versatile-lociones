"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatPrice } from "@/lib/catalog/format"
import { useCart } from "@/lib/cart/cart-context"
import { ease } from "@/components/motion/reveal"
import { QuantityStepper } from "./quantity-stepper"
import { ProductVisual } from "./product-visual"

export function CartSheet() {
  const { items, count, subtotalLabel, open, setOpen, setQuantity, remove } = useCart()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-serif text-3xl font-normal">Tu carrito</SheetTitle>
          <SheetDescription>
            {count === 0
              ? "Aún no has agregado fragancias."
              : `${count} ${count === 1 ? "producto" : "productos"}`}
          </SheetDescription>
        </SheetHeader>
        <Separator />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
            <p className="max-w-60 text-sm text-muted-foreground">
              Explora la colección y encuentra el aroma que te represente.
            </p>
            <SheetClose asChild>
              <Button asChild className="rounded-full px-6">
                <Link href="/lociones">Ver lociones</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* data-lenis-prevent: deja que esta lista haga scroll propio bajo Lenis */}
            <ul data-lenis-prevent className="flex-1 overflow-y-auto px-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="flex gap-4 overflow-hidden border-b border-border py-5 last:border-b-0"
                  >
                    <div
                      className="relative size-24 shrink-0 overflow-hidden rounded-md p-2"
                      style={{
                        background: `radial-gradient(120% 80% at 50% 100%, oklch(0.9 0.05 ${item.hue}), oklch(0.95 0.015 85))`,
                      }}
                    >
                      <div className="relative h-full w-full">
                        <ProductVisual
                          product={{ name: item.name, size: item.size, image: item.image, hue: item.hue }}
                          sizes="96px"
                        />
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <SheetClose asChild>
                          <Link
                            href={`/lociones/${item.slug}`}
                            className="line-clamp-2 font-serif text-lg leading-snug hover:underline"
                          >
                            {item.name}
                          </Link>
                        </SheetClose>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(item.id)}
                          aria-label={`Eliminar ${item.name} del carrito`}
                          className="-mt-1 -mr-2 shrink-0 text-muted-foreground"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      {item.size ? <p className="text-xs text-muted-foreground">{item.size}</p> : null}
                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          max={item.maxQuantity}
                          onChange={(quantity) => setQuantity(item.id, quantity)}
                          label={`Cantidad de ${item.name}`}
                        />
                        <p className="text-sm font-medium tabular-nums">
                          {formatPrice(item.price * item.quantity, item.currency)}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <SheetFooter className="border-t border-border bg-muted/40">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-xl font-medium tabular-nums">{subtotalLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground">Envío calculado al finalizar la compra.</p>
              {/* El pago se conecta con las ventas de Delasoft en el siguiente paso. */}
              <Button size="lg" className="h-12 w-full rounded-full" disabled>
                Finalizar compra
              </Button>
              <p className="text-center text-xs text-muted-foreground">Pago en línea muy pronto.</p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
