"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SplitText } from "@/components/motion/reveal"
import type { Product } from "@/lib/catalog/types"
import { ProductVisual } from "./product-visual"

/** Sección fija: el scroll vertical desplaza la colección en horizontal (solo en escritorio). */
export function Collection({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  // Recorrido exacto: ancho del carril menos el viewport, para terminar alineado al borde.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 32))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [products.length])

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])

  return (
    <section id="coleccion" ref={ref} className="relative lg:h-[260vh]">
      <div className="flex flex-col overflow-hidden py-24 lg:sticky lg:top-0 lg:h-svh lg:justify-center lg:py-0">
        <div className="mx-auto mb-12 flex w-full max-w-7xl items-end justify-between gap-6 px-4 sm:px-8">
          <h2 className="font-serif text-5xl leading-none font-light sm:text-7xl">
            <SplitText text="La colección" />
          </h2>
          <Button asChild variant="outline" className="hidden h-11 rounded-full bg-transparent px-5 sm:inline-flex">
            <a href="#mas-vendidos">
              Ver todo <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </div>

        {/* Escritorio: carril horizontal ligado al scroll */}
        <motion.div ref={trackRef} style={{ x }} className="hidden w-max will-change-transform gap-8 pr-8 pl-8 lg:flex xl:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {products.map((product, i) => (
            <FeaturedCard key={product.id} product={product} index={i} total={products.length} />
          ))}
        </motion.div>

        {/* Móvil y tablet: carrusel con desplazamiento nativo */}
        <div className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:scroll-px-8 pb-4 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
          {products.map((product, i) => (
            <FeaturedCard key={product.id} product={product} index={i} total={products.length} />
          ))}
        </div>

        <div className="mx-auto mt-12 hidden w-full max-w-7xl px-8 lg:block">
          <div className="h-px w-full bg-border">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ product, index, total }: { product: Product; index: number; total: number }) {
  return (
    <a
      href={`#${product.slug}`}
      className="group relative flex w-[78vw] shrink-0 snap-start flex-col sm:w-[46vw] lg:w-[34vw] xl:w-[30vw]"
    >
      <div
        className="relative aspect-4/5 overflow-hidden rounded-lg lg:aspect-[4/4.6]"
        style={{
          background: `linear-gradient(160deg, oklch(0.95 0.02 85), oklch(0.86 0.06 ${product.hue}))`,
        }}
      >
        <span className="absolute top-6 left-6 font-mono text-xs text-foreground/60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="absolute top-6 right-6 text-xs tracking-[0.25em] text-foreground/60 uppercase">
          {product.family}
        </span>
        <div className="absolute inset-[16%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:-rotate-3">
          <ProductVisual product={product} sizes="(min-width: 1024px) 30vw, 78vw" />
        </div>
        <span className="absolute right-6 bottom-6 grid size-11 place-items-center rounded-full bg-background/90 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-3xl">{product.name}</h3>
        <span className="text-sm tabular-nums">{product.priceLabel}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {product.notes.length > 0 ? product.notes.join(" · ") : product.size ?? product.badge}
      </p>
    </a>
  )
}
