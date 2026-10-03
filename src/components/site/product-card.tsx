"use client"

import { motion } from "motion/react"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"
import { ease } from "@/components/motion/reveal"
import { ProductVisual } from "./product-visual"

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      className="group relative flex flex-col"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <a href={`#${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />
      <div
        className="relative aspect-4/5 overflow-hidden rounded-lg"
        style={{
          background: `radial-gradient(120% 80% at 50% 100%, oklch(0.9 0.05 ${product.hue}), oklch(0.95 0.015 85))`,
        }}
      >
        {product.badge ? (
          <Badge variant="secondary" className="absolute top-4 left-4 z-20 bg-background/90">
            {product.badge}
          </Badge>
        ) : null}
        <motion.div
          className="absolute inset-[14%]"
          variants={{ rest: { y: 0, scale: 1 }, hover: { y: -12, scale: 1.04 } }}
          transition={{ duration: 0.5, ease }}
        >
          <ProductVisual product={product} />
        </motion.div>
        {/* Siempre visible en táctil; en escritorio aparece al pasar el cursor o con foco. */}
        <div className="absolute inset-x-4 bottom-4 z-20 transition duration-300 ease-out lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          {product.available ? (
            <Button className="h-10 w-full rounded-full" aria-label={`Agregar ${product.name} al carrito`}>
              <Plus /> Agregar al carrito
            </Button>
          ) : (
            <Button disabled variant="secondary" className="h-10 w-full rounded-full">
              Agotado
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
          {product.notes.length > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{product.notes.join(" · ")}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{product.family}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium tabular-nums">{product.priceLabel}</p>
          {product.compareAtLabel ? (
            <p className="mt-1 text-xs text-muted-foreground tabular-nums line-through">{product.compareAtLabel}</p>
          ) : product.size ? (
            <p className="mt-1 text-xs text-muted-foreground">{product.size}</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
