import Image from "next/image"
import { useId } from "react"
import type { Product } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

/** Frasco ilustrado en SVG; se usa mientras el producto no tenga foto. */
export function BottleArt({ hue, className }: { hue: number; className?: string }) {
  const id = useId().replace(/:/g, "")
  const liquid = `oklch(0.72 0.11 ${hue})`
  const liquidDeep = `oklch(0.5 0.12 ${hue})`

  return (
    <svg viewBox="0 0 200 320" className={className} aria-hidden>
      <defs>
        <linearGradient id={`glass-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.12" />
          <stop offset="1" stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`liquid-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={liquid} />
          <stop offset="1" stopColor={liquidDeep} />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="oklch(0.55 0.08 75)" />
          <stop offset="0.45" stopColor="oklch(0.88 0.08 85)" />
          <stop offset="1" stopColor="oklch(0.5 0.07 70)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="308" rx="70" ry="8" fill="black" opacity="0.12" />
      <rect x="72" y="18" width="56" height="62" rx="4" fill={`url(#cap-${id})`} />
      <rect x="86" y="80" width="28" height="22" fill="oklch(0.85 0.03 80)" />
      <rect x="28" y="100" width="144" height="204" rx="14" fill={`url(#liquid-${id})`} />
      <rect x="28" y="100" width="144" height="204" rx="14" fill={`url(#glass-${id})`} />
      <rect x="40" y="112" width="10" height="176" rx="5" fill="white" opacity="0.35" />
      <rect x="50" y="178" width="100" height="52" rx="2" fill="oklch(0.98 0.01 85)" opacity="0.9" />
      <text
        x="100"
        y="209"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="2"
        fill="oklch(0.25 0.01 60)"
        fontFamily="serif"
      >
        VERSATILLE
      </text>
    </svg>
  )
}

export function ProductVisual({
  product,
  className,
  sizes = "(min-width: 1024px) 33vw, 80vw",
  priority,
}: {
  product: Pick<Product, "name" | "size" | "image" | "hue">
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.size ? `${product.name} — ${product.size}` : product.name}
        fill
        sizes={sizes}
        priority={priority}
        // multiply funde el fondo blanco de las fotos del catálogo con el degradado de la tarjeta
        className={cn("object-contain mix-blend-multiply", className)}
      />
    )
  }
  return <BottleArt hue={product.hue} className={cn("h-full w-full", className)} />
}
