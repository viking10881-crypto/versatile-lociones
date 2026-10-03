"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"
import { useCart } from "@/lib/cart/cart-context"
import { ease } from "@/components/motion/reveal"
import { QuantityStepper } from "./quantity-stepper"

function availabilityText(product: Product) {
  if (!product.available) return "Agotado por ahora"
  if (product.badge === "Últimas unidades") return "Últimas unidades disponibles"
  return "Disponible"
}

/** Cantidad + agregar al carrito, con una barra fija en móvil cuando el botón sale de pantalla. */
export function ProductPurchase({ product }: { product: Product }) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { initial: true })

  function handleAdd() {
    add(product, quantity)
    setQuantity(1)
  }

  return (
    <>
      <div ref={ref} className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm">
          <span
            className={
              product.available
                ? "size-2 rounded-full bg-[oklch(0.65_0.15_150)]"
                : "size-2 rounded-full bg-destructive"
            }
          />
          {availabilityText(product)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {product.available ? (
            <>
              <QuantityStepper
                value={quantity}
                max={product.maxQuantity}
                onChange={setQuantity}
                label="Cantidad"
                className="self-start"
              />
              <Button size="lg" className="h-12 flex-1 rounded-full text-base" onClick={handleAdd}>
                <ShoppingBag data-icon="inline-start" /> Agregar al carrito
              </Button>
            </>
          ) : (
            <Button size="lg" variant="secondary" className="h-12 flex-1 rounded-full" disabled>
              Agotado
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!inView && product.available ? (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-serif text-lg leading-tight">{product.name}</p>
                <p className="text-sm tabular-nums">{product.priceLabel}</p>
              </div>
              <Button className="h-11 shrink-0 rounded-full px-5" onClick={handleAdd}>
                <ShoppingBag data-icon="inline-start" /> Agregar
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
