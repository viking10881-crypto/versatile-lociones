"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"
import { useCart } from "@/lib/cart/cart-context"
import { ease } from "@/components/motion/reveal"
import { ProductVisual } from "./product-visual"

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const secondImage = product.images[1]

  return (
    <motion.article
      className="group relative flex flex-col"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Link href={`/lociones/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />
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
          <ProductVisual
            product={product}
            className={secondImage ? "transition-opacity duration-500 group-hover:opacity-0" : undefined}
          />
          {/* Con varias fotos, al pasar el cursor se muestra la segunda. */}
          {secondImage ? (
            <Image
              src={secondImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 80vw"
              className="object-contain opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </motion.div>
        {/* Siempre visible en táctil; en escritorio aparece al pasar el cursor o con foco. */}
        <div className="absolute inset-x-4 bottom-4 z-20 transition duration-300 ease-out lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          {product.available ? (
            <Button
              className="h-10 w-full rounded-full"
              aria-label={`Agregar ${product.name} al carrito`}
              onClick={() => add(product)}
            >
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
